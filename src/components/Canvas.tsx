'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditorStore, getResolvedElementData } from '../store/useEditorStore';
import type { Componente } from '../core/domain/Componente';
import { Rnd } from 'react-rnd';
import TextElement from './elements/TextElement';
import ContainerElement from './elements/ContainerElement';
import IconElement from './elements/IconElement';
import ButtonElement from './elements/ButtonElement';
import { BrowserFrame } from './BrowserFrame';
import { getValidStyles } from '../utils/styleHelpers';

import { useMagneticGuidelines } from '../hooks/useMagneticGuidelines';
import { SelectionMarquee } from './SelectionMarquee';

// ─── Estado de drag FORA do React ──────────────────────────────────────────
type DragInfo = {
  mouseStartX: number;
  mouseStartY: number;
  elStartX: number;
  elStartY: number;
  didMove: boolean;
};
const dragInfoMap = new Map<string, DragInfo>();

export function Canvas() {
  const {
    elementos,
    elementosSelecionadosIds,
    selecionarElemento,
    toggleSelecaoElemento,
    atualizarElemento,
    atualizarBreakpointData,
    removerElemento,
    removerVarios,
    viewport,
    showBrowserFrame,
  } = useEditorStore();

  const { calculateSnapping } = useMagneticGuidelines();
  const artboardRef = useRef<HTMLDivElement>(null);

  // Estado local de posição de drag + guias juntos num único useState
  // para evitar renders intermediários com dados dessincronizados
  const [dragVisual, setDragVisual] = useState<{
    id: string;
    x: number;
    y: number;
    guides: { axis: 'x' | 'y'; position: number }[];
  } | null>(null);

  const isSelected = (id: string) => elementosSelecionadosIds.includes(id);
  const hasMultipleSelected = elementosSelecionadosIds.length > 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const selectedIds = useEditorStore.getState().elementosSelecionadosIds;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        if (selectedIds.length === 1) removerElemento(selectedIds[0]);
        else removerVarios(selectedIds);
        return;
      }

      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrowKeys.includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const currentElements = useEditorStore.getState().elementos;
        selectedIds.forEach(id => {
          const el = currentElements.find(item => item.id === id);
          if (!el) return;
          const resolved = getResolvedElementData(el, viewport);
          let newX = resolved.x;
          let newY = resolved.y;
          if (e.key === 'ArrowUp') newY -= step;
          if (e.key === 'ArrowDown') newY += step;
          if (e.key === 'ArrowLeft') newX -= step;
          if (e.key === 'ArrowRight') newX += step;
          atualizarBreakpointData(id, { x: newX, y: newY });
        });
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) useEditorStore.temporal.getState().redo();
          else useEditorStore.temporal.getState().undo();
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          useEditorStore.temporal.getState().redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removerElemento, removerVarios, atualizarElemento]);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      case 'desktop':
      default: return 'w-[1024px]';
    }
  };

  const getSelectionRing = (elId: string) => {
    if (!isSelected(elId)) {
      return 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1 hover:ring-offset-slate-50';
    }
    if (hasMultipleSelected) {
      return 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-50';
    }
    return 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50';
  };

  // Helper: snap com fallback seguro (nunca retorna NaN)
  const safeSnap = useCallback((
    elId: string, tentX: number, tentY: number,
    el: Componente, res: any, state: any
  ) => {
    const canvasWidth = state.viewport === 'mobile' ? 375 : state.viewport === 'tablet' ? 768 : 1024;
    const siblings = state.elementos.filter((item: Componente) => item.parentId === el.parentId);
    const w = typeof res.width === 'number' ? res.width : parseFloat(String(res.width)) || 100;
    const h = typeof res.height === 'number' ? res.height : parseFloat(String(res.height)) || 100;

    const snapped = calculateSnapping(
      elId, tentX, tentY, w, h,
      siblings.map((item: Componente) => {
        const sRes = getResolvedElementData(item, state.viewport);
        return {
          id: item.id, x: sRes.x, y: sRes.y,
          width: typeof sRes.width === 'number' ? sRes.width : parseFloat(String(sRes.width)) || 100,
          height: typeof sRes.height === 'number' ? sRes.height : parseFloat(String(sRes.height)) || 100
        };
      }),
      canvasWidth, 1200, !!el.parentId
    );

    // Proteção final contra NaN
    return {
      x: isNaN(snapped.x) ? tentX : snapped.x,
      y: isNaN(snapped.y) ? tentY : snapped.y,
      guides: snapped.guides || [],
    };
  }, [calculateSnapping]);

  const renderElement = (el: Componente) => {
    const resolved = getResolvedElementData(el, viewport);
    const children = elementos.filter(child => child.parentId === el.id);

    // Posição visual: se arrastando, usa dragVisual. Senão, usa store.
    const isDragging = dragVisual?.id === el.id;
    const posX = isDragging ? dragVisual.x : resolved.x;
    const posY = isDragging ? dragVisual.y : resolved.y;

    return (
      <Rnd
        key={el.id}
        size={{ width: resolved.width, height: resolved.height }}
        position={{ x: posX, y: posY }}
        style={{ zIndex: el.zIndex || 2 }}
        onDragStart={(e) => {
          const state = useEditorStore.getState();
          const elAtual = state.elementos.find(item => item.id === el.id);
          const res = elAtual ? getResolvedElementData(elAtual, state.viewport) : resolved;
          dragInfoMap.set(el.id, {
            mouseStartX: (e as MouseEvent).clientX,
            mouseStartY: (e as MouseEvent).clientY,
            elStartX: res.x,
            elStartY: res.y,
            didMove: false,
          });
          setDragVisual({ id: el.id, x: res.x, y: res.y, guides: [] });
        }}
        onDrag={(e, d) => {
          if (Math.abs(d.deltaX) < 0.5 && Math.abs(d.deltaY) < 0.5) return;
          const ds = dragInfoMap.get(el.id);
          if (!ds) return;
          ds.didMove = true;

          const mouseX = (e as MouseEvent).clientX;
          const mouseY = (e as MouseEvent).clientY;
          const tentX = ds.elStartX + (mouseX - ds.mouseStartX);
          const tentY = ds.elStartY + (mouseY - ds.mouseStartY);

          // Calcula snap
          const state = useEditorStore.getState();
          const elAtual = state.elementos.find(item => item.id === el.id);
          if (!elAtual) {
            setDragVisual({ id: el.id, x: tentX, y: tentY, guides: [] });
            return;
          }
          const res = getResolvedElementData(elAtual, state.viewport);
          const snapped = safeSnap(el.id, tentX, tentY, el, res, state);

          // Um único setState com posição + guias juntos (sem render intermediário)
          setDragVisual({
            id: el.id,
            x: snapped.x,
            y: snapped.y,
            guides: el.parentId ? [] : snapped.guides,
          });
        }}
        onDragStop={(e) => {
          const ds = dragInfoMap.get(el.id);
          dragInfoMap.delete(el.id);

          const mouseEndX = (e as MouseEvent).clientX;
          const mouseEndY = (e as MouseEvent).clientY;

          if (!ds) {
            setDragVisual(null);
            selecionarElemento(el.id);
            return;
          }

          const dist = Math.sqrt(
            Math.pow(mouseEndX - ds.mouseStartX, 2) +
            Math.pow(mouseEndY - ds.mouseStartY, 2)
          );

          if (!ds.didMove && dist < 5) {
            setDragVisual(null);
            if ((e as MouseEvent).shiftKey) toggleSelecaoElemento(el.id);
            else selecionarElemento(el.id);
            return;
          }

          // Drag real: salva posição final com snap
          const finalX = ds.elStartX + (mouseEndX - ds.mouseStartX);
          const finalY = ds.elStartY + (mouseEndY - ds.mouseStartY);

          const state = useEditorStore.getState();
          const elAtual = state.elementos.find(item => item.id === el.id);
          if (!elAtual) { setDragVisual(null); return; }
          const res = getResolvedElementData(elAtual, state.viewport);
          const snapped = safeSnap(el.id, finalX, finalY, el, res, state);

          if (state.elementosSelecionadosIds.length > 1 && state.elementosSelecionadosIds.includes(el.id)) {
            const deltaX = snapped.x - ds.elStartX;
            const deltaY = snapped.y - ds.elStartY;
            state.elementosSelecionadosIds.forEach(id => {
              const item = state.elementos.find(it => it.id === id);
              if (item) {
                const itRes = getResolvedElementData(item, state.viewport);
                atualizarBreakpointData(id, { x: itRes.x + deltaX, y: itRes.y + deltaY });
              }
            });
          } else {
            atualizarBreakpointData(el.id, { x: snapped.x, y: snapped.y });
          }

          setDragVisual(null);
        }}
        onResizeStart={(e) => e.stopPropagation()}
        onResizeStop={(e, direction, ref, delta, position) => {
          e.stopPropagation();
          const w = ref.style.width.endsWith('px') ? parseFloat(ref.style.width) : ref.style.width;
          const h = ref.style.height.endsWith('px') ? parseFloat(ref.style.height) : ref.style.height;
          // Usar position do react-rnd para resize (necessário para left/top resize handles).
          // Proteger contra 0,0 espúrios: se position for 0,0 mas resolved não era,
          // preservar a posição atual do store.
          const state = useEditorStore.getState();
          const elAtual = state.elementos.find(item => item.id === el.id);
          const currentRes = elAtual ? getResolvedElementData(elAtual, state.viewport) : resolved;
          
          let finalX = position.x;
          let finalY = position.y;
          
          // Se react-rnd reporta 0,0 mas o elemento não estava perto de 0,0 → preserva store
          if (position.x === 0 && position.y === 0 && (currentRes.x > 10 || currentRes.y > 10)) {
            finalX = currentRes.x;
            finalY = currentRes.y;
          }
          
          atualizarBreakpointData(el.id, { width: w, height: h, x: finalX, y: finalY });
        }}
        bounds="none"
        className={`group ${getSelectionRing(el.id)}`}
      >
        <div
          className="w-full h-full relative group"
          onClick={(e) => e.stopPropagation()}
        >
          {isSelected(el.id) && (
            <>
              <div className={`absolute -top-6 left-0 ${hasMultipleSelected ? 'bg-emerald-500' : 'bg-blue-500'} text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-mono z-50 pointer-events-none hidden group-hover:block whitespace-nowrap`}>
                {el.tipo} ({Math.round(parseFloat(String(resolved.width)))}x{Math.round(parseFloat(String(resolved.height)))})
              </div>

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

          {el.tipo === 'button' ? (
            <ButtonElement elemento={{...el, ...resolved}} />
          ) : el.tipo === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={el.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
              alt={el.alt || 'Imagem placeholder'}
              style={{
                ...getValidStyles(resolved.estilos),
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                margin: 0,
              }}
              className="pointer-events-none select-none border border-transparent"
              draggable="false"
            />
          ) : el.tipo === 'text' ? (
            <TextElement elemento={{...el, ...resolved}} />
          ) : el.tipo === 'container' ? (
            <ContainerElement elemento={{...el, ...resolved}}>
              {children.map(child => renderElement(child))}
            </ContainerElement>
          ) : el.tipo === 'icon' ? (
            <IconElement elemento={{...el, ...resolved}} />
          ) : (
            <div style={{ ...getValidStyles(resolved.estilos), width: '100%', height: '100%', pointerEvents: 'none' }}>
              {el.conteudoTextual}
            </div>
          )}
        </div>
      </Rnd>
    );
  };

  // Guias visuais vêm do dragVisual (não mais do zustand store)
  const currentGuides = dragVisual?.guides || [];

  const ArtboardContent = (
    <div
      ref={artboardRef}
      className={`relative bg-white min-h-[800px] ${getViewportWidth()} ${showBrowserFrame ? '' : 'shadow-xl'}`}
    >
      <SelectionMarquee artboardRef={artboardRef} />

      {elementos.filter(el => !el.parentId).map((el) => renderElement(el))}

      {currentGuides.map((guide, idx) => (
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
      tabIndex={0}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {showBrowserFrame ? (
        <div className={`transition-all duration-300 mt-4 mb-20 ${viewport === 'desktop' ? getViewportWidth() : 'w-auto'} flex justify-center`}>
          <BrowserFrame viewport={viewport}>
            {ArtboardContent}
          </BrowserFrame>
        </div>
      ) : (
        <div className="mt-8 w-full flex justify-center mb-20">
          {ArtboardContent}
        </div>
      )}
    </main>
  );
}
