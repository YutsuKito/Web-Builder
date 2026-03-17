import React, { useState } from 'react';
import { useStore } from 'zustand';
import { useEditorStore } from '../store/useEditorStore';
import { upsertProjectAction } from '@/app/actions/projectActions';
import { Save, Loader2 } from 'lucide-react';

export function TopBar() {
  const { 
    viewport, 
    setViewport, 
    showBrowserFrame, 
    toggleBrowserFrame, 
    elementos, 
    projectId, 
    projectName,
    setProjectName 
  } = useEditorStore();
  
  const { undo, redo, pastStates, futureStates } = useStore(useEditorStore.temporal, (state) => state);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await upsertProjectAction({
        id: projectId,
        name: projectName,
        canvasState: { elementos }
      });

      if (result.success) {
        // Projeto salvo com sucesso
      } else {
        alert('Erro ao salvar projeto');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Erro crítico ao salvar');
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  }

  return (
    <div className="flex bg-white border-b border-gray-200 h-14 items-center px-6 shrink-0 justify-between">
      {/* Undo/Redo Controls */}
      <div className="flex-1 flex gap-2 items-center">
        <button
          onClick={() => undo()}
          disabled={pastStates.length === 0}
          className={`p-2 rounded-md transition-colors ${
            pastStates.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Desfazer (Ctrl+Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          onClick={() => redo()}
          disabled={futureStates.length === 0}
          className={`p-2 rounded-md transition-colors ${
            futureStates.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Refazer (Ctrl+Y/Ctrl+Shift+Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </button>

        <div className="h-4 w-[1px] bg-gray-200 mx-2" />

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 w-32 lg:w-48 placeholder-slate-400"
          placeholder="Nome do Projeto"
        />

        <div className="h-4 w-[1px] bg-gray-200 mx-2" />

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
      
      {/* Viewport Controls */}
      <div className="flex space-x-2 justify-center">
        {/* ... (restando do código de botões de viewport) */}
        <button
          onClick={() => setViewport('desktop')}
          className={`p-2 rounded-md transition-colors ${
            viewport === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Desktop (1024px)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
          </svg>
        </button>

        <button
          onClick={() => setViewport('tablet')}
          className={`p-2 rounded-md transition-colors ${
            viewport === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Tablet (768px)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <line x1="12" x2="12.01" y1="18" y2="18" />
          </svg>
        </button>

        <button
          onClick={() => setViewport('mobile')}
          className={`p-2 rounded-md transition-colors ${
            viewport === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Mobile (375px)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
        </button>
      </div>

      {/* Browser Frame Toggle */}
      <div className="flex-1 flex justify-end">
        <button
          onClick={toggleBrowserFrame}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
            showBrowserFrame ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Exibir Navegador"
        >
          {showBrowserFrame ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
              <line x1="2" x2="22" y1="2" y2="22"/>
            </svg>
          )}
          <span>Browser</span>
        </button>
      </div>
    </div>
  );
}
