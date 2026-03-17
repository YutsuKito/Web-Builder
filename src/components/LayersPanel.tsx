'use client';

import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';

// Ícones correspondentes a cada tipo de elemento
const IconesPorTipo: Record<string, React.ReactNode> = {
  button: (
    <div className="w-4 h-2 bg-blue-500 rounded-[2px]" />
  ),
  image: (
    <div className="w-4 h-4 border border-emerald-400 border-dashed rounded-[2px] flex items-center justify-center">
      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
    </div>
  ),
  text: (
    <span className="text-amber-500 font-serif font-bold text-sm leading-none">T</span>
  ),
  container: (
    <div className="w-4 h-4 border border-purple-400 rounded-[2px] flex items-center justify-center">
      <div className="w-2 h-2 border border-purple-300 border-dashed" />
    </div>
  ),
};

const NomesPorTipo: Record<string, string> = {
  button: 'Botão',
  image: 'Imagem',
  text: 'Texto',
  container: 'Container',
};

export function LayersPanel() {
  const { elementos, elementosSelecionadosIds, selecionarElemento, toggleSelecaoElemento, reordenarElementos, atualizarElemento } = useEditorStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Reverter a lista para exibição (o último elemento do array fica no topo da lista visual)
  const reversedElementos = [...elementos].reverse();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, reverseIndex: number) => {
    // Calculamos o índice original no array (do Zustand)
    const originalIndex = elementos.length - 1 - reverseIndex;
    setDraggedIndex(originalIndex);
    e.dataTransfer.effectAllowed = 'move';
    
    // Pequeno ajuste visual para o item arrastado
    const target = e.target as HTMLElement;
    setTimeout(() => {
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(null);
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessário para permitir o drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, reverseIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const targetOriginalIndex = elementos.length - 1 - reverseIndex;
    if (draggedIndex !== targetOriginalIndex) {
      reordenarElementos(draggedIndex, targetOriginalIndex);
    }
  };

  const handleDoubleClick = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleRenameSubmit = (id: string) => {
    if (editingId === id) {
      atualizarElemento(id, { nomeCamada: editValue.trim() || undefined });
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col border-t border-slate-200 mt-4 pt-4 overflow-hidden">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 shadow-sm pb-2">
        Camadas
      </h3>
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
        {reversedElementos.length === 0 ? (
          <p className="text-xs text-slate-500 italic px-2">Design vazio.</p>
        ) : (
          reversedElementos.map((el, index) => {
            const isSelected = elementosSelecionadosIds.includes(el.id);
            const isMulti = elementosSelecionadosIds.length > 1;
            const originalIndex = elementos.length - 1 - index;
            const defaultName = `${NomesPorTipo[el.tipo] || 'Elemento'} ${originalIndex + 1}`;
            const displayName = el.nomeCamada || defaultName;
            
            return (
              <div
                key={el.id}
                draggable={editingId !== el.id}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={(e) => {
                  if (e.shiftKey) {
                    toggleSelecaoElemento(el.id);
                  } else {
                    selecionarElemento(el.id);
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors border ${
                  isSelected 
                    ? isMulti
                      ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500'
                      : 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                    : 'bg-white border-transparent hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Grip Handle */}
                <div className="text-slate-300 cursor-grab hover:text-slate-500" title="Arrastar param cima ou para baixo">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                {/* Ícone */}
                <div className="w-5 flex items-center justify-center cursor-pointer">
                  {IconesPorTipo[el.tipo] || IconesPorTipo['container']}
                </div>

                {/* Nome da Camada */}
                {editingId === el.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(el.id)}
                    onKeyDown={(e) => handleKeyDown(e, el.id)}
                    className="flex-1 text-xs text-slate-800 px-1 py-0.5 border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Prevent selecting another element or dragging when clicking inside the input
                    onDragStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                ) : (
                  <span 
                    onDoubleClick={(e) => {
                      e.stopPropagation(); // Avoid other events
                      handleDoubleClick(el.id, displayName);
                    }}
                    className={`text-xs truncate flex-1 select-none cursor-pointer ${isSelected ? 'font-semibold text-blue-700' : 'text-slate-600'}`}
                  >
                    {displayName}
                  </span>
                )}
                
                {/* ID miniatura (opcional) */}
                <span className="text-[9px] text-slate-300 opacity-0 group-hover:opacity-100">
                  {el.id.split('-')[1] || ''}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
