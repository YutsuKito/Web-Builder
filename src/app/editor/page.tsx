'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Canvas } from '@/components/Canvas';
import { InspectorPanel } from '@/components/InspectorPanel';
import ModalExportacao from '@/components/ModalExportacao';
import { TopBar } from '@/components/TopBar';

export default function EditorPage() {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden text-slate-800">
      {/* 1. Painel Esquerdo: Ferramentas e Opções de adicionar */}
      <Sidebar onExportClick={() => setModalAberto(true)} />

      {/* 2. Área Central: Renderização interativa */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar />
        <Canvas />
      </div>

      {/* 3. Painel Direito: Configuração do elemento selecionado */}
      <InspectorPanel />

      {/* Modal de Exportação */}
      <ModalExportacao
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  );
}
