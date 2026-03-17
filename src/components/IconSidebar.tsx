'use client';

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

// Lista de ícones populares para o seletor
export const POPULAR_ICONS = [
  'Home', 'User', 'Settings', 'Mail', 'Bell', 'Calendar', 'Camera', 'Heart', 
  'Star', 'Search', 'Menu', 'X', 'Check', 'Info', 'AlertCircle', 'ExternalLink',
  'ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronDown', 'ShoppingCart', 
  'CreditCard', 'Globe', 'Lock', 'Trash2', 'Edit', 'Plus', 'Minus', 'Github', 
  'Facebook', 'Twitter', 'Instagram', 'Linkedin', 'Youtube'
];

export function IconSidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const adicionarElemento = useEditorStore((state) => state.adicionarElemento);

  const filteredIcons = POPULAR_ICONS.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Ícones Lucide
        </h3>
        <div className="relative">
          <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar ícone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-3 gap-2">
          {filteredIcons.map((iconName) => {
            const Icon = (LucideIcons as any)[iconName];
            return (
              <button
                key={iconName}
                onClick={() => adicionarElemento('icon', { conteudoTextual: iconName } as any)}
                className="group flex flex-col items-center justify-center p-2 rounded-lg border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all gap-1"
                title={iconName}
              >
                <div className="text-slate-600 group-hover:text-blue-600 transition-colors">
                  {Icon && <Icon size={20} />}
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-500 font-medium truncate w-full text-center">
                  {iconName}
                </span>
              </button>
            );
          })}
        </div>
        
        {filteredIcons.length === 0 && (
          <div className="text-center py-8">
            <LucideIcons.SearchX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum ícone encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
