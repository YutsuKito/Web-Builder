'use client';

import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Rnd } from 'react-rnd';
import TextElement from './elements/TextElement';
import ContainerElement from './elements/ContainerElement';
import IconElement from './elements/IconElement';
import ButtonElement from './elements/ButtonElement';
import { BrowserFrame } from './BrowserFrame';
import { getValidStyles } from '../utils/styleHelpers';
import { useMagneticGuidelines } from '../hooks/useMagneticGuidelines';
import { SelectionMarquee } from './SelectionMarquee';

export function Canvas() {
  const { 
    elementos, 
    elementosSelecionadosIds, 
    selecionarElemento,
    toggleSelecaoElemento,
    atualizarElemento, 
    removerElemento,
    removerVarios,
    viewport, 
    showBrowserFrame,
    activeGuides,
    setActiveGuides
  } = useEditorStore();

  const { calculateSnapping } = useMagneticGuidelines();
  const artboardRef = useRef<HTMLDivElement>(null);

  // Helper: verifica se um elemento está selecionado
  const isSelected = (id: string) => elementosSelecionadosIds.includes(id);
  const isSingleSelected = (id: string) => elementosSelecionadosIds.length === 1 && elementosSelecionadosIds[0] === id;
  const hasMultipleSelected = elementosSelecionadosIds.length > 1;

  // Listener para teclado (Delete, Backspace, Setas, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evita acionar atalhos quando estiver digitando em um input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const selectedIds = useEditorStore.getState().elementosSelecionadosIds;

      // Delete/Backspace: remove todos os selecionados
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        if (selectedIds.length === 1) {
          removerElemento(selectedIds[0]);
        } else {
          removerVarios(selectedIds);
        }
        return;
      }

      // Movimentação com as setas do teclado — move todos os selecionados
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrowKeys.includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const currentElements = useEditorStore.getState().elementos;

        selectedIds.forEach(id => {
          const el = currentElements.find(item => item.id === id);
          if (!el) return;

          let newX = el.x;
          let newY = el.y;

          if (e.key === 'ArrowUp') newY -= step;
          if (e.key === 'ArrowDown') newY += step;
          if (e.key === 'ArrowLeft') newX -= step;
          if (e.key === 'ArrowRight') newX += step;

          atualizarElemento(id, { x: newX, y: newY });
        });
        return;
      }

      // Atalhos de Undo / Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            useEditorStore.temporal.getState().redo();
          } else {
            useEditorStore.temporal.getState().undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          useEditorStore.temporal.getState().redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removerElemento, removerVarios, atualizarElemento]);

  // Mapeamento de largura baseado no viewport
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      case 'desktop': 
      default: return 'w-[1024px]';
    }
  };

  // Determina a classe de ring visual para cada elemento
  const getSelectionRing = (elId: string) => {
    if (!isSelected(elId)) {
      return 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1 hover:ring-offset-slate-50';
    }
    if (hasMultipleSelected) {
      // Multi-seleção: ring verde
      return 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-50';
    }
    // Seleção única: ring azul
    return 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50';
  };

  const ArtboardContent = (
    <div 
      ref={artboardRef}
      className={`relative bg-white min-h-[800px] transition-all duration-300 ${getViewportWidth()} ${showBrowserFrame ? '' : 'shadow-xl'}`}
    >
      {/* Camada de Marquee Selection */}
      <SelectionMarquee artboardRef={artboardRef} />

      {/* Elementos Renderizados */}
      {elementos.map((el) => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          style={{ zIndex: el.zIndex || 2 }}
          onDragStart={(e, d) => {
            // Se o elemento arrastado não está selecionado, seleciona-o sozinho
            if (!isSelected(el.id)) {
              selecionarElemento(el.id);
            }
          }}
          onDrag={(e, d) => {
            const canvasWidth = viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : 1024;
            const canvasHeight = 800;

            const snapped = calculateSnapping(
              el.id,
              d.x,
              d.y,
              typeof el.width === 'number' ? el.width : parseFloat(el.width),
              typeof el.height === 'number' ? el.height : parseFloat(el.height),
              elementos,
              canvasWidth,
              canvasHeight
            );

            // Move todos os selecionados juntos (delta)
            const selectedIds = useEditorStore.getState().elementosSelecionadosIds;
            if (selectedIds.length > 1 && selectedIds.includes(el.id)) {
              const deltaX = snapped.x - el.x;
              const deltaY = snapped.y - el.y;
              const currentElements = useEditorStore.getState().elementos;
              
              selectedIds.forEach(id => {
                if (id === el.id) {
                  atualizarElemento(id, { x: snapped.x, y: snapped.y });
                } else {
                  const otherEl = currentElements.find(item => item.id === id);
                  if (otherEl) {
                    atualizarElemento(id, { x: otherEl.x + deltaX, y: otherEl.y + deltaY });
                  }
                }
              });
            } else {
              atualizarElemento(el.id, { x: snapped.x, y: snapped.y });
            }
            setActiveGuides(snapped.guides);
          }}
          onDragStop={(e, d) => {
            setActiveGuides([]);
          }}
          onResizeStart={(e, dir, ref) => {
            if (!isSelected(el.id)) {
              selecionarElemento(el.id);
            }
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            atualizarElemento(el.id, {
              width: ref.style.width,
              height: ref.style.height,
              ...position,
            });
          }}
          bounds="parent"
          className={`group ${getSelectionRing(el.id)}`}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (e.shiftKey) {
              // Shift+Click: toggle multi-seleção
              toggleSelecaoElemento(el.id);
            } else {
              // Click normal: seleção única
              selecionarElemento(el.id);
            }
          }}
        >
          <div className="w-full h-full relative group">
            {/* Badge de Seleção Opcional */}
            {isSelected(el.id) && (
              <>
                <div className={`absolute -top-6 left-0 ${hasMultipleSelected ? 'bg-emerald-500' : 'bg-blue-500'} text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-mono z-50 pointer-events-none hidden group-hover:block whitespace-nowrap`}>
                  {el.tipo} ({Math.round(el.width as number)}x{Math.round(el.height as number)})
                </div>
                
                {/* Botão de Remover Elemento */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removerElemento(el.id);
                  }}
                  className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md flex items-center justify-center z-50 transition-transform hover:scale-110"
                  title="Remover Elemento"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}

            {/* O Elemento Interno */}
            {el.tipo === 'button' ? (
              <ButtonElement elemento={el} />
            ) : el.tipo === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={el.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                alt={el.alt || 'Imagem placeholder'}
                style={{
                  ...getValidStyles(el.estilos),
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  margin: 0,
                }}
                className="pointer-events-none select-none border border-transparent"
                draggable="false"
              />
            ) : el.tipo === 'text' ? (
              <TextElement elemento={el} />
            ) : el.tipo === 'container' ? (
              <ContainerElement elemento={el} />
            ) : el.tipo === 'icon' ? (
              <IconElement elemento={el} />
            ) : (
              <div style={{ ...getValidStyles(el.estilos), width: '100%', height: '100%', pointerEvents: 'none' }}>
                {el.conteudoTextual}
              </div>
            )}
          </div>
        </Rnd>
      ))}

      {/* Guias Magnéticas */}
      {activeGuides.map((guide: { axis: 'x' | 'y'; position: number }, idx: number) => (
        <div
          key={idx}
          className="absolute bg-red-500 z-[9999] pointer-events-none"
          style={{
            left: guide.axis === 'x' ? `${guide.position}px` : 0,
            top: guide.axis === 'y' ? `${guide.position}px` : 0,
            width: guide.axis === 'x' ? '1px' : '100%',
            height: guide.axis === 'y' ? '1px' : '100%',
            transform: guide.axis === 'x' ? 'translateX(-50%)' : 'translateY(-50%)',
          }}
        />
      ))}

      {/* Indicador de Multi-Seleção */}
      {hasMultipleSelected && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm px-4 py-2 rounded-full shadow-lg z-[9999] font-medium pointer-events-none">
          {elementosSelecionadosIds.length} elementos selecionados
        </div>
      )}
    </div>
  );

  return (
    <main
      className="flex-1 relative bg-slate-50 overflow-auto flex flex-col items-center focus:outline-none"
      onClick={() => selecionarElemento(null)} // Clicar fora deseleciona
      tabIndex={0}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {showBrowserFrame ? (
        <div className={`transition-all duration-300 mt-4 mb-8 ${getViewportWidth()} shadow-2xl rounded-xl overflow-hidden`}>
          <BrowserFrame>
            {ArtboardContent}
          </BrowserFrame>
        </div>
      ) : (
        <div className="mt-0 w-full flex justify-center">
           {ArtboardContent}
        </div>
      )}
    </main>
  );
}
