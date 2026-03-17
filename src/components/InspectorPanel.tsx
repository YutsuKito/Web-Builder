'use client';

import React from 'react';
import { useEditorStore, getResolvedElementData } from '../store/useEditorStore';
import { POPULAR_ICONS } from './IconSidebar';
import { getComputedStyles } from '../utils/styleHelpers';


export function InspectorPanel() {
  const { elementos, elementosSelecionadosIds, atualizarEstiloElemento, atualizarElemento, atualizarBreakpointData } = useEditorStore();

  const elementoSelecionadoId = elementosSelecionadosIds.length > 0 ? elementosSelecionadosIds[0] : null;
  const elemento = elementos.find((el) => el.id === elementoSelecionadoId);
  const viewport = useEditorStore((s) => s.viewport);
  
  // Resolve os dados e estilos com base na herança
  const resolved = elemento ? getResolvedElementData(elemento, viewport) : null;
  const estilosAtivos = resolved?.estilos || {};

  // Multi-seleção: mostra apenas uma mensagem informativa
  if (elementosSelecionadosIds.length > 1) {
    return (
      <div className="w-80 h-full bg-slate-50 border-l border-slate-200 flex flex-col items-center justify-center text-slate-400">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-emerald-600 font-bold text-lg">{elementosSelecionadosIds.length}</span>
          </div>
          <p className="font-medium text-slate-600">Elementos selecionados</p>
          <p className="text-xs text-slate-400 mt-1">Use <kbd className="bg-slate-100 px-1 rounded">Delete</kbd> para remover ou <kbd className="bg-slate-100 px-1 rounded">↑↓←→</kbd> para mover todos.</p>
        </div>
      </div>
    );
  }

  if (!elemento || !resolved) {
    return (
      <div className="w-80 h-full bg-slate-50 border-l border-slate-200 flex flex-col items-center justify-center text-slate-400">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="font-medium text-slate-600">Selecione um elemento</p>
          <p className="text-xs text-slate-400 mt-1">Clique em um componente no canvas para editar suas propriedades.</p>
        </div>
      </div>
    );
  }

  const handleStyleChange = (prop: string, value: any) => {
    atualizarEstiloElemento(elemento.id, prop, value);
  };

  const handleBreakpointPropChange = (prop: string, value: any) => {
    atualizarBreakpointData(elemento.id, { [prop]: value });
  };

  const handleUniversalPropChange = (prop: string, value: any) => {
    atualizarElemento(elemento.id, { [prop]: value });
  };

  return (
    <div className="w-80 h-full bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 capitalize flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {elemento.tipo}
          </h2>
          <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded-md font-mono">{elemento.id.split('-')[1] || elemento.id}</span>
        </div>
        <div className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase bg-blue-50 w-fit px-2 py-0.5 rounded border border-blue-100">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Editando: {viewport}
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* Seção Universal: Dimensões e Posição */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Layout ({viewport})
            <hr className="flex-1 border-slate-200" />
          </h3>
          
          {/* Seleção de Pai (Nesting) */}
          <div className="space-y-1.5 pb-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Elemento Pai
            </label>
            <select
              value={elemento.parentId || ''}
              onChange={(e) => {
                const newParentId = e.target.value || null;
                const { vincularElementoPai } = useEditorStore.getState();
                vincularElementoPai(elemento.id, newParentId);
              }}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Nenhum (Raiz)</option>
              {elementos
                .filter(el => el.tipo === 'container' && el.id !== elemento.id && el.parentId !== elemento.id)
                .map(container => (
                  <option key={container.id} value={container.id}>
                    {container.nomeCamada || `${container.tipo}-${container.id.split('-')[1]}`}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Largura</label>
              <div className="relative">
                <input
                  type="text"
                  value={resolved.width}
                  placeholder="ex: 200, 50%, auto"
                  onChange={(e) => handleBreakpointPropChange('width', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono pointer-events-none">
                  {String(resolved.width).includes('%') ? '%' : String(resolved.width) === 'auto' ? '' : 'PX'}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Altura</label>
              <div className="relative">
                <input
                  type="text"
                  value={resolved.height}
                  placeholder="ex: 100, 50%, auto"
                  onChange={(e) => handleBreakpointPropChange('height', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono pointer-events-none">
                  {String(resolved.height).includes('%') ? '%' : String(resolved.height) === 'auto' ? '' : 'PX'}
                </span>
              </div>
            </div>
            {/* X */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Posição X</label>
              <div className="relative">
                <input
                  type="number"
                  value={Math.round(resolved.x)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) handleBreakpointPropChange('x', val);
                  }}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono pointer-events-none">PX</span>
              </div>
            </div>
            {/* Y */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Posição Y</label>
              <div className="relative">
                <input
                  type="number"
                  value={Math.round(resolved.y)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) handleBreakpointPropChange('y', val);
                  }}
                  className="w-full text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono pointer-events-none">PX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Ancoragem (Docking) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Ancoragem ({viewport})
            <hr className="flex-1 border-slate-200" />
          </h3>
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 rounded-xl border border-slate-200">
              {[
                { y: 'top', x: 'left' }, { y: 'top', x: 'center' }, { y: 'top', x: 'right' },
                { y: 'center', x: 'left' }, { y: 'center', x: 'center' }, { y: 'center', x: 'right' },
                { y: 'bottom', x: 'left' }, { y: 'bottom', x: 'center' }, { y: 'bottom', x: 'right' }
              ].map((dock, i) => {
                const isActive = (resolved.dockX || 'left') === dock.x && (resolved.dockY || 'top') === dock.y;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      handleBreakpointPropChange('dockX', dock.x);
                      handleBreakpointPropChange('dockY', dock.y);
                    }}
                    className={`w-8 h-8 rounded-md border transition-all flex items-center justify-center ${
                      isActive 
                        ? 'bg-blue-500 border-blue-600 text-white shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
                    }`}
                    title={`${dock.y} ${dock.x}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-current'}`} />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center px-4">
              Determina como o elemento se comporta em telas maiores.
            </p>
          </div>
        </div>

        {(elemento.tipo === 'button' || elemento.tipo === 'container') && (
          <>
            {/* Seção de Conteúdo (Só para Botão por enquanto) */}
            {elemento.tipo === 'button' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  Conteúdo
                  <hr className="flex-1 border-slate-200" />
                </h3>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">Texto do Botão</label>
                  <input
                    type="text"
                    value={elemento.conteudoTextual || ''}
                    onChange={(e) => handleUniversalPropChange('conteudoTextual', e.target.value)}
                    placeholder="Ex: Clique Aqui"
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Seção de Estilos Comuns */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Aparência
                <hr className="flex-1 border-slate-200" />
              </h3>

              {/* Opacidade */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 flex justify-between items-center">
                  <span>Opacidade</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {Math.round((estilosAtivos.opacity ?? 1) * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round((estilosAtivos.opacity ?? 1) * 100)}
                  onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                />
              </div>

              {/* Fundo: Sólido vs Gradiente */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 block">Fundo</label>
                <div className="flex p-1 bg-slate-100 rounded-lg mb-3">
                  <button
                    onClick={() => handleStyleChange('isGradient', false)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!estilosAtivos.isGradient ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Sólido
                  </button>
                  <button
                    onClick={() => handleStyleChange('isGradient', true)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${estilosAtivos.isGradient ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Gradiente
                  </button>
                </div>

                {!estilosAtivos.isGradient ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="relative">
                        <input
                          type="color"
                          value={estilosAtivos.backgroundColor?.startsWith('#') ? estilosAtivos.backgroundColor : '#3b82f6'}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div 
                          className="h-10 w-12 rounded-lg border border-slate-300 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                          style={{ backgroundColor: estilosAtivos.backgroundColor || '#3b82f6' }}
                        />
                      </div>
                      <input
                        type="text"
                        value={estilosAtivos.backgroundColor || ''}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        placeholder="Ex: #3b82f6"
                        className="flex-1 text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-mono uppercase"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Cor 1</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={estilosAtivos.gradientColor1?.startsWith('#') ? estilosAtivos.gradientColor1 : '#3b82f6'}
                            onChange={(e) => handleStyleChange('gradientColor1', e.target.value)}
                            className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Cor 2</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={estilosAtivos.gradientColor2?.startsWith('#') ? estilosAtivos.gradientColor2 : '#9333ea'}
                            onChange={(e) => handleStyleChange('gradientColor2', e.target.value)}
                            className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 flex justify-between items-center">
                        <span>Ângulo</span>
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {estilosAtivos.gradientAngle ?? 90}°
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={estilosAtivos.gradientAngle ?? 90}
                        onChange={(e) => handleStyleChange('gradientAngle', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Cor do Texto (Só se tiver texto) */}
              {elemento.tipo === 'button' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Cor do Texto</label>
                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <input
                        type="color"
                        value={estilosAtivos.color?.startsWith('#') ? estilosAtivos.color : '#ffffff'}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div 
                        className="h-10 w-12 rounded-lg border border-slate-300 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                        style={{ backgroundColor: estilosAtivos.color || '#ffffff' }}
                      />
                    </div>
                    <input
                      type="text"
                      value={estilosAtivos.color || ''}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      placeholder="Ex: #ffffff"
                      className="flex-1 text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Border Radius */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Arredondamento</label>
                  <button 
                    onClick={() => handleStyleChange('borderRadius', '50%')}
                    className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm transition-colors font-medium"
                  >
                    Circular
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={estilosAtivos.borderRadius === '50%' ? 100 : parseInt(estilosAtivos.borderRadius || '0')}
                    onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                  />
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 min-w-[32px] text-center">
                    {estilosAtivos.borderRadius || '0px'}
                  </span>
                </div>
              </div>

               {/* Borda específica para Container */}
               {elemento.tipo === 'container' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">Borda (CSS)</label>
                  <input
                    type="text"
                    value={estilosAtivos.border || ''}
                    onChange={(e) => handleStyleChange('border', e.target.value)}
                    placeholder="ex: 1px solid #ccc"
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-mono"
                  />
                </div>
              )}

              {/* Padding para Botão */}
              {elemento.tipo === 'button' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">Padding</label>
                  <input
                    type="text"
                    value={estilosAtivos.padding || ''}
                    onChange={(e) => handleStyleChange('padding', e.target.value)}
                    placeholder="ex: 12px 24px"
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {elemento.tipo === 'image' && (
          <>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Origem
                <hr className="flex-1 border-slate-200" />
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleUniversalPropChange('src', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-600 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">URL</label>
                <input
                  type="text"
                  value={elemento.src || ''}
                  onChange={(e) => handleUniversalPropChange('src', e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Estilo
                <hr className="flex-1 border-slate-200" />
              </h3>

              {/* Opacidade */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 flex justify-between items-center">
                  <span>Opacidade</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {Math.round((estilosAtivos.opacity ?? 1) * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((estilosAtivos.opacity ?? 1) * 100)}
                  onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Arredondamento</label>
                  <button 
                    onClick={() => handleStyleChange('borderRadius', '50%')}
                    className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm font-medium"
                  >
                    Circular
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={estilosAtivos.borderRadius === '50%' ? 100 : parseInt(estilosAtivos.borderRadius || '0')}
                    onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 min-w-[32px] text-center">
                    {estilosAtivos.borderRadius || '0px'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Object Fit</label>
                <select
                  value={estilosAtivos.objectFit || 'cover'}
                  onChange={(e) => handleStyleChange('objectFit', e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
              </div>
            </div>
          </>
        )}

        {elemento.tipo === 'text' && (
          <>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Conteúdo
                <hr className="flex-1 border-slate-200" />
              </h3>
              <textarea
                value={elemento.conteudoTextual || ''}
                onChange={(e) => handleUniversalPropChange('conteudoTextual', e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg min-h-[80px]"
              />
              
              {/* Opacidade */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 flex justify-between items-center">
                  <span>Opacidade</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {Math.round((estilosAtivos.opacity ?? 1) * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((estilosAtivos.opacity ?? 1) * 100)}
                  onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Tipografia
                <hr className="flex-1 border-slate-200" />
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Tam.</label>
                  <input
                    type="number"
                    value={parseInt(String(estilosAtivos.fontSize) || '24')}
                    onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Peso</label>
                  <select
                    value={estilosAtivos.fontWeight || '400'}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="400">Regular</option>
                    <option value="600">Semibold</option>
                    <option value="700">Bold</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Cor</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={estilosAtivos.color?.startsWith('#') ? estilosAtivos.color : '#333333'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="h-10 w-12 rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={estilosAtivos.color || ''}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    placeholder="Ex: #333333"
                    className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg uppercase"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Icons Inspector */}
        {elemento.tipo === 'icon' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              Propriedades do Ícone
              <hr className="flex-1 border-slate-200" />
            </h3>

            {/* Cor */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Cor</label>
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <input
                    type="color"
                    value={estilosAtivos.color?.startsWith('#') ? estilosAtivos.color : '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div 
                    className="h-10 w-12 rounded-lg border border-slate-300 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                    style={{ backgroundColor: estilosAtivos.color || '#000000' }}
                  />
                </div>
                <input
                  type="text"
                  value={estilosAtivos.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="Ex: #000000"
                  className="flex-1 text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm font-mono uppercase"
                />
              </div>
            </div>

            {/* Tamanho (FontSize) */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 flex justify-between items-center">
                <span>Tamanho</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {parseInt(String(estilosAtivos.fontSize || '48'))}px
                </span>
              </label>
              <input
                type="range"
                min="12"
                max="256"
                step="1"
                value={parseInt(String(estilosAtivos.fontSize || '48'))}
                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
              />
            </div>
          </div>
        )}
        {/* Botão Inspector */}
        {elemento.tipo === 'button' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              Ícone do Botão
              <hr className="flex-1 border-slate-200" />
            </h3>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600">Escolher Ícone</label>
              <select
                value={estilosAtivos.iconName || ''}
                onChange={(e) => handleStyleChange('iconName', e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Nenhum</option>
                {POPULAR_ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            {estilosAtivos.iconName && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600">Posição</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleStyleChange('iconPosition', 'left')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                      (estilosAtivos.iconPosition || 'left') === 'left'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Esquerda
                  </button>
                  <button
                    onClick={() => handleStyleChange('iconPosition', 'right')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                      estilosAtivos.iconPosition === 'right'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Direita
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção de Link (Comum a todos os tipos de elementos que queremos que tenham link) */}
        {!['container'].includes(elemento.tipo) && (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              Ação / Link
              <hr className="flex-1 border-slate-200" />
            </h3>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600">URL de Destino</label>
              <input
                type="text"
                placeholder="https://exemplo.com"
                value={elemento.link || ''}
                onChange={(e) => handleUniversalPropChange('link', e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Abrir em nova aba</span>
              <button
                onClick={() => handleUniversalPropChange('linkTarget', elemento.linkTarget === '_blank' ? '_self' : '_blank')}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  elemento.linkTarget === '_blank' ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                    elemento.linkTarget === '_blank' ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

