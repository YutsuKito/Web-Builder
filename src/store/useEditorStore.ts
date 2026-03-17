import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Componente, EstilosCSS, TipoComponente } from '../core/domain/Componente';

// ─── Tipos do Store ───────────────────────────────────────────────────────────

interface EditorState {
  elementos: Componente[];
  elementosSelecionadosIds: string[];
  viewport: 'desktop' | 'tablet' | 'mobile';
  showBrowserFrame: boolean;
  activeGuides: { axis: 'x' | 'y'; position: number }[];

  adicionarElemento: (tipo: TipoComponente, baseProps?: Partial<Componente>) => void;
  adicionarVariosElementos: (novosElementos: Componente[]) => void;
  atualizarElemento: (id: string, updates: Partial<Componente>) => void;
  atualizarEstiloElemento: (id: string, propriedade: string, valor: any) => void;
  removerElemento: (id: string) => void;
  removerVarios: (ids: string[]) => void;
  selecionarElemento: (id: string | null) => void;
  toggleSelecaoElemento: (id: string) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  toggleBrowserFrame: () => void;
  resetarEditor: () => void;
  reordenarElementos: (startIndex: number, endIndex: number) => void;
  setActiveGuides: (guides: { axis: 'x' | 'y'; position: number }[]) => void;
}

// ─── Valores Padrão ───────────────────────────────────────────────────────────

const criarBotaoPadrao = (id: string): Componente => ({
  id,
  tipo: 'button',
  x: 50,
  y: 50,
  width: 'auto',
  height: 'auto',
  zIndex: 1,
  estilos: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  conteudoTextual: 'Clique aqui',
});

const criarImagemPadrao = (id: string): Componente => ({
  id,
  tipo: 'image',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  zIndex: 1,
  estilos: {
    borderRadius: '4px',
    border: '2px dashed #cbd5e1',
    objectFit: 'cover'
  },
  conteudoTextual: '',
  src: '',
  alt: 'Imagem',
});

const criarTextoPadrao = (id: string): Componente => ({
  id,
  tipo: 'text',
  x: 100,
  y: 100,
  width: 'auto',
  height: 'auto',
  zIndex: 1,
  estilos: {
    fontSize: '24px',
    fontWeight: '400',
    textAlign: 'left',
    fontFamily: 'system-ui, sans-serif',
    color: '#333333',
  },
  conteudoTextual: 'Texto Livre',
});

const criarContainerPadrao = (id: string): Componente => ({
  id,
  tipo: 'container',
  x: 50,
  y: 50,
  width: 300,
  height: 200,
  zIndex: 1,
  estilos: {
    backgroundColor: 'transparent',
    border: '2px dashed #94a3b8',
    borderRadius: '8px',
  },
  conteudoTextual: '',
  childrenIds: [],
});

const criarIconePadrao = (id: string, iconName: string = 'Circle'): Componente => ({
  id,
  tipo: 'icon',
  x: 200,
  y: 200,
  width: 48,
  height: 48,
  zIndex: 1,
  estilos: {
    color: '#000000',
    fontSize: '48px',
  },
  conteudoTextual: iconName,
});

let nextId = 1;
const gerarId = () => `el-${Date.now()}-${nextId++}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retorna o primeiro ID selecionado, ou null. Útil para compatibilidade. */
function getElementoSelecionadoId(state: EditorState): string | null {
  return state.elementosSelecionadosIds.length > 0 ? state.elementosSelecionadosIds[0] : null;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>()(
  temporal(
    (set) => ({
      elementos: [criarBotaoPadrao('btn-001')],
      elementosSelecionadosIds: ['btn-001'],
      viewport: 'desktop',
      showBrowserFrame: true,
      activeGuides: [],

      adicionarElemento: (tipo, baseProps = {}) =>
        set((state) => {
          const id = gerarId();
          let novoElemento: Componente;
          
          if (tipo === 'button') {
            novoElemento = criarBotaoPadrao(id);
          } else if (tipo === 'image') {
            novoElemento = criarImagemPadrao(id);
          } else if (tipo === 'text') {
            novoElemento = criarTextoPadrao(id);
          } else if (tipo === 'container') {
            novoElemento = criarContainerPadrao(id);
          } else if (tipo === 'icon') {
            novoElemento = criarIconePadrao(id, (baseProps as any).conteudoTextual);
          } else {
            novoElemento = { ...criarBotaoPadrao(id), tipo };
          }

          novoElemento = { ...novoElemento, ...baseProps, zIndex: state.elementos.length + 1 };

          return {
            elementos: [...state.elementos, novoElemento],
            elementosSelecionadosIds: [id],
          };
        }),

      adicionarVariosElementos: (novosElementos) =>
        set((state) => ({
          elementos: [...state.elementos, ...novosElementos],
          elementosSelecionadosIds: novosElementos.length > 0 ? [novosElementos[0].id] : state.elementosSelecionadosIds,
        })),

      atualizarElemento: (id, updates) =>
        set((state) => ({
          elementos: state.elementos.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        })),

      atualizarEstiloElemento: (id, propriedade, valor) =>
        set((state) => ({
          elementos: state.elementos.map((el) =>
            el.id === id
              ? { ...el, estilos: { ...el.estilos, [propriedade]: valor } }
              : el
          ),
        })),

      removerElemento: (id) =>
        set((state) => ({
          elementos: state.elementos.filter((el) => el.id !== id),
          elementosSelecionadosIds: state.elementosSelecionadosIds.filter(sid => sid !== id),
        })),

      // Remove múltiplos elementos de uma vez
      removerVarios: (ids) =>
        set((state) => ({
          elementos: state.elementos.filter((el) => !ids.includes(el.id)),
          elementosSelecionadosIds: [],
        })),

      // Seleção única (click normal)
      selecionarElemento: (id) =>
        set({ elementosSelecionadosIds: id ? [id] : [] }),

      // Toggle para multi-seleção (Shift+Click)
      toggleSelecaoElemento: (id) =>
        set((state) => {
          const current = state.elementosSelecionadosIds;
          if (current.includes(id)) {
            return { elementosSelecionadosIds: current.filter(sid => sid !== id) };
          }
          return { elementosSelecionadosIds: [...current, id] };
        }),

      // Substitui toda a seleção (para marquee selection)
      setSelection: (ids) =>
        set({ elementosSelecionadosIds: ids }),

      // Limpa toda a seleção
      clearSelection: () =>
        set({ elementosSelecionadosIds: [] }),

      setViewport: (viewport) => set({ viewport }),
      toggleBrowserFrame: () => set((state) => ({ showBrowserFrame: !state.showBrowserFrame })),

      resetarEditor: () =>
        set({
          elementos: [criarBotaoPadrao('btn-001')],
          elementosSelecionadosIds: ['btn-001'],
        }),

      reordenarElementos: (startIndex, endIndex) =>
        set((state) => {
          const novaLista = [...state.elementos];
          const [removido] = novaLista.splice(startIndex, 1);
          novaLista.splice(endIndex, 0, removido);
          return { elementos: novaLista };
        }),

      setActiveGuides: (guides) => set({ activeGuides: guides }),
    }),
    {
      partialize: (state) => ({
        elementos: state.elementos,
        elementosSelecionadosIds: state.elementosSelecionadosIds,
      }),
    }
  )
);

/** Hook auxiliar: retorna o ID do primeiro elemento selecionado (ou null). */
export function useElementoSelecionadoId(): string | null {
  return useEditorStore((s) => s.elementosSelecionadosIds.length > 0 ? s.elementosSelecionadosIds[0] : null);
}
