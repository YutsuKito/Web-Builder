'use client';

import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { LayersPanel } from './LayersPanel';
import { TEMPLATES } from '../core/domain/Templates';
import { injectTemplate } from '../utils/templateUtils';
import { IconSidebar } from './IconSidebar'; // Added IconSidebar import

export function Sidebar({ onExportClick }: { onExportClick: () => void }) {
  const { adicionarElemento, adicionarVariosElementos, resetarEditor, elementos } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'elements' | 'icons' | 'blocks'>('elements');

  const handleAddTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const newElements = injectTemplate(template.elementos, elementos.length + 1);
      adicionarVariosElementos(newElements);
    }
  };

  return (
    <aside className="w-20 lg:w-72 border-r border-slate-200 bg-white shadow-sm z-50 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row items-center justify-between gap-2">
        <h2 className="text-base font-bold tracking-tight text-slate-800 hidden lg:block">
          Web Builder
        </h2>
        <h2 className="text-xs font-bold tracking-tight text-slate-800 lg:hidden">
          UI
        </h2>
        <button
          onClick={resetarEditor}
          className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200"
          title="Apagar todo o projeto"
        >
          Reset
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'elements'
              ? 'text-blue-600 border-blue-600 bg-white'
              : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="hidden lg:inline">Elementos</span>
          <span className="lg:hidden">EL</span>
        </button>
        <button
          onClick={() => setActiveTab('icons')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'icons'
              ? 'text-blue-600 border-blue-600 bg-white'
              : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="hidden lg:inline">Ícones</span>
          <span className="lg:hidden">IC</span>
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'blocks'
              ? 'text-blue-600 border-blue-600 bg-white'
              : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="hidden lg:inline">Blocos</span>
          <span className="lg:hidden">BK</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === 'elements' && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 hidden lg:block">
                Componentes Base
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <button
                  onClick={() => adicionarElemento('button')}
                  className="group relative flex flex-col items-center justify-center p-3 h-20 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                >
                  <div className="w-8 h-4 bg-slate-200 rounded-md group-hover:bg-blue-200 transition-colors mb-2"></div>
                  <span className="text-xs font-semibold">Botão</span>
                </button>

                <button
                  onClick={() => adicionarElemento('image')}
                  className="group relative flex flex-col items-center justify-center p-3 h-20 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <div className="w-6 h-6 border-2 border-slate-200 border-dashed rounded-md group-hover:border-emerald-300 transition-colors mb-2 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-200 ml-auto mt-auto mr-1 mb-1"></div>
                  </div>
                  <span className="text-xs font-semibold">Imagem</span>
                </button>

                <button
                  onClick={() => adicionarElemento('text')}
                  className="group relative flex flex-col items-center justify-center p-3 h-20 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm"
                >
                  <div className="text-lg font-serif font-bold text-slate-300 group-hover:text-amber-300 transition-colors mb-1">T</div>
                  <span className="text-xs font-semibold">Texto</span>
                </button>

                <button
                  onClick={() => adicionarElemento('container')}
                  className="group relative flex flex-col items-center justify-center p-3 h-20 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm"
                >
                  <div className="w-6 h-6 border-2 border-slate-200 rounded-md group-hover:border-purple-300 transition-colors mb-2 flex items-center justify-center">
                    <div className="w-4 h-4 border border-slate-200 border-dashed rounded-sm group-hover:border-purple-200"></div>
                  </div>
                  <span className="text-xs font-semibold">Container</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'icons' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <IconSidebar />
          </div>
        )}

        {activeTab === 'blocks' && (
          <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 hidden lg:block">
              Biblioteca de Blocos
            </h3>
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleAddTemplate(template.id)}
                className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {template.nome}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    {template.descricao}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-1.5 focus:scale-110">
                    {Array.from({ length: Math.min(template.elementos.length, 4) }).map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-white bg-slate-100 flex items-center justify-center shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    ADICIONAR +
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Layers Panel */}
        <div className="border-t border-slate-200 min-h-[300px] flex flex-col bg-slate-50/50">
          <LayersPanel />
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 mt-auto">
        <button
          onClick={onExportClick}
          className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold shadow-md shadow-slate-900/20 hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-900/10 active:scale-[0.98] text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="hidden lg:inline">Exportar Código</span>
        </button>
      </div>
    </aside>
  );
}
