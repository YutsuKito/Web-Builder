import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Componente, EstilosCSS, TipoComponente, Viewport, BreakpointData } from '../core/domain/Componente';

// ─── Tipos do Store ───────────────────────────────────────────────────────────

interface EditorState {
  elementos: Componente[];
  elementosSelecionadosIds: string[];
  viewport: Viewport;
  showBrowserFrame: boolean;
  activeGuides: { axis: 'x' | 'y'; position: number }[];
  projectId: string;
  projectName: string;
  isSaving: boolean;

  adicionarElemento: (tipo: TipoComponente, baseProps?: Partial<Componente>) => void;
  adicionarVariosElementos: (novosElementos: Componente[]) => void;
  atualizarElemento: (id: string, updates: Partial<Componente>) => void;
  atualizarBreakpointData: (id: string, updates: Partial<BreakpointData>) => void;
  atualizarEstiloElemento: (id: string, propriedade: string, valor: any) => void;
  removerElemento: (id: string) => void;
  removerVarios: (ids: string[]) => void;
  vincularElementoPai: (filhoId: string, paiId: string | null) => void;
  selecionarElemento: (id: string | null) => void;
  toggleSelecaoElemento: (id: string) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setViewport: (viewport: Viewport) => void;
  toggleBrowserFrame: () => void;
  resetarEditor: () => void;
  reordenarElementos: (startIndex: number, endIndex: number) => void;
  setActiveGuides: (guides: { axis: 'x' | 'y'; position: number }[]) => void;
  setProjectId: (id: string) => void;
  setProjectName: (name: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  loadProject: (project: { id: string, name: string, canvasState: any }) => void;
}


// ─── Helpers de Resolução (Herança Desktop-First) ──────────────────────────────

/**
 * Resolve os dados de um elemento para um viewport específico seguindo a cascata:
 * Desktop -> Tablet -> Mobile
 */
export function getResolvedElementData(el: Componente, viewport: Viewport): Required<BreakpointData> {
  const desktop = el.breakpoints?.desktop || {};
  const tablet = el.breakpoints?.tablet || {};
  const mobile = el.breakpoints?.mobile || {};

  // Helper para garantir números válidos (apenas para x/y que são sempre numéricos)
  const safeNum = (val: any, fallback: number): number => {
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(num) ? fallback : num;
  };

  // Helper para dimensões que aceitam string (ex: "50%", "auto") ou number
  const safeDim = (val: any, fallback: number | string): number | string => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'string') {
      // Preserva strings como "50%", "auto", "100vh", etc.
      if (val.includes('%') || val === 'auto' || val.includes('v')) return val;
      // Tenta converter strings puramente numéricas
      const num = parseFloat(val);
      return isNaN(num) ? fallback : num;
    }
    return typeof val === 'number' ? val : fallback;
  };

  const resolved: Required<BreakpointData> = {
    x: safeNum(desktop.x, 0),
    y: safeNum(desktop.y, 0),
    width: safeDim(desktop.width, 100),
    height: safeDim(desktop.height, 100),
    dockX: desktop.dockX ?? 'left',
    dockY: desktop.dockY ?? 'top',
    estilos: { ...(desktop.estilos || {}) },
  };

  if (viewport === 'tablet' || viewport === 'mobile') {
    if (tablet.x !== undefined) resolved.x = safeNum(tablet.x, resolved.x);
    if (tablet.y !== undefined) resolved.y = safeNum(tablet.y, resolved.y);
    if (tablet.width !== undefined) resolved.width = safeDim(tablet.width, resolved.width);
    if (tablet.height !== undefined) resolved.height = safeDim(tablet.height, resolved.height);
    if (tablet.dockX !== undefined) resolved.dockX = tablet.dockX;
    if (tablet.dockY !== undefined) resolved.dockY = tablet.dockY;
    if (tablet.estilos) resolved.estilos = { ...resolved.estilos, ...tablet.estilos };
  }

  if (viewport === 'mobile') {
    if (mobile.x !== undefined) resolved.x = safeNum(mobile.x, resolved.x);
    if (mobile.y !== undefined) resolved.y = safeNum(mobile.y, resolved.y);
    if (mobile.width !== undefined) resolved.width = safeDim(mobile.width, resolved.width);
    if (mobile.height !== undefined) resolved.height = safeDim(mobile.height, resolved.height);
    if (mobile.dockX !== undefined) resolved.dockX = mobile.dockX;
    if (mobile.dockY !== undefined) resolved.dockY = mobile.dockY;
    if (mobile.estilos) resolved.estilos = { ...resolved.estilos, ...mobile.estilos };
  }

  return resolved;
}

/**
 * Calcula a posição absoluta (em relação ao Artboard) de um elemento,
 * percorrendo recursivamente seus pais.
 */
export function getAbsolutePosition(el: Componente, elementos: Componente[], viewport: any): { x: number; y: number } {
  const resolved = getResolvedElementData(el, viewport as any);
  
  if (!el.parentId) {
    return { x: resolved.x, y: resolved.y };
  }
  
  const pai = elementos.find(p => p.id === el.parentId);
  if (!pai) return { x: resolved.x, y: resolved.y };
  
  const posPai = getAbsolutePosition(pai, elementos, viewport as any);
  return {
    x: posPai.x + resolved.x,
    y: posPai.y + resolved.y
  };
}

// ─── Valores Padrão ───────────────────────────────────────────────────────────

const criarBotaoPadrao = (id: string): Componente => ({
  id,
  tipo: 'button',
  zIndex: 1,
  breakpoints: {
    desktop: {
      x: 50,
      y: 50,
      width: 150,
      height: 48,
      dockX: 'left',
      dockY: 'top',
      estilos: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
      }
    },
    tablet: {},
    mobile: {}
  },
  conteudoTextual: 'Clique aqui',
});

const criarImagemPadrao = (id: string): Componente => ({
  id,
  tipo: 'image',
  zIndex: 1,
  breakpoints: {
    desktop: {
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      dockX: 'left',
      dockY: 'top',
      estilos: {
        borderRadius: '4px',
        border: '2px dashed #cbd5e1',
        objectFit: 'cover'
      }
    },
    tablet: {},
    mobile: {}
  },
  conteudoTextual: '',
  src: '',
  alt: 'Imagem',
});

const criarTextoPadrao = (id: string): Componente => ({
  id,
  tipo: 'text',
  zIndex: 1,
  breakpoints: {
    desktop: {
      x: 100,
      y: 100,
      width: 250,
      height: 40,
      dockX: 'left',
      dockY: 'top',
      estilos: {
        fontSize: '24px',
        fontWeight: '400',
        textAlign: 'left',
        fontFamily: 'system-ui, sans-serif',
        color: '#333333',
      }
    },
    tablet: {},
    mobile: {}
  },
  conteudoTextual: 'Texto Livre',
});

const criarContainerPadrao = (id: string): Componente => ({
  id,
  tipo: 'container',
  zIndex: 1,
  breakpoints: {
    desktop: {
      x: 50,
      y: 50,
      width: 300,
      height: 200,
      dockX: 'left',
      dockY: 'top',
      estilos: {
        backgroundColor: 'transparent',
        border: '2px dashed #94a3b8',
        borderRadius: '8px',
      }
    },
    tablet: {},
    mobile: {}
  },
  conteudoTextual: '',
  childrenIds: [],
});

const criarIconePadrao = (id: string, iconName: string = 'Circle'): Componente => ({
  id,
  tipo: 'icon',
  zIndex: 1,
  breakpoints: {
    desktop: {
      x: 200,
      y: 200,
      width: 48,
      height: 48,
      dockX: 'left',
      dockY: 'top',
      estilos: {
        color: '#000000',
        fontSize: '48px',
      }
    },
    tablet: {},
    mobile: {}
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

/**
 * Re-calcula o zIndex de todos os elementos com base na posição do array.
 * Garante que a ordem DOM/Visual sempre acompanhe 1:1 a ordem do Store.
 */
function normalizarZIndex(lista: Componente[]): Componente[] {
  return lista.map((el, i) => ({ ...el, zIndex: i + 1 }));
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
      projectId: gerarId(),
      projectName: 'Novo Projeto',
      isSaving: false,

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

          novoElemento = { 
            ...novoElemento, 
            ...baseProps, 
            zIndex: state.elementos.length + 1,
            // Garantir que breakpoints existam se baseProps for parcial
            breakpoints: { 
              ...novoElemento.breakpoints, 
              ...(baseProps.breakpoints || {}) 
            }
          };

          return {
            elementos: [...state.elementos, novoElemento],
            elementosSelecionadosIds: [id],
          };
        }),

      adicionarVariosElementos: (novosElementos) =>
        set((state) => {
          const novaLista = [...state.elementos, ...novosElementos];
          return {
            elementos: normalizarZIndex(novaLista),
            elementosSelecionadosIds: novosElementos.length > 0 ? [novosElementos[0].id] : state.elementosSelecionadosIds,
          };
        }),

      atualizarElemento: (id, updates) =>
        set((state) => ({
          elementos: state.elementos.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        })),

      atualizarBreakpointData: (id, updates) =>
        set((state) => {
          return {
            elementos: state.elementos.map((el) => {
              if (el.id !== id) return el;
              const currentViewport = state.viewport;

              // Filtra updates para evitar valores inválidos (NaN)
              const sanitizedUpdates = { ...updates };
              const numericKeys = ['x', 'y', 'width', 'height'] as const;
              numericKeys.forEach(key => {
                if (key in sanitizedUpdates) {
                  const val = sanitizedUpdates[key];
                  if (typeof val === 'number' && isNaN(val)) {
                    delete sanitizedUpdates[key];
                  } else if (typeof val === 'string' && val.trim() === '') {
                     // Permite strings vazias se for intencional, mas se for número parcial, ignore
                  }
                }
              });

              return {
                ...el,
                breakpoints: {
                  ...el.breakpoints,
                  [currentViewport]: {
                    ...(el.breakpoints[currentViewport] || {}),
                    ...sanitizedUpdates
                  }
                }
              };
            }),
          };
        }),

      atualizarEstiloElemento: (id, propriedade, valor) =>
        set((state) => {
          const currentViewport = state.viewport;
          
          return {
            elementos: state.elementos.map((el) => {
              if (el.id !== id) return el;
              
              const currentBreakpointData = el.breakpoints[currentViewport] || {};
              const currentStyles = currentBreakpointData.estilos || {};
              
              return {
                ...el,
                breakpoints: {
                  ...el.breakpoints,
                  [currentViewport]: {
                    ...currentBreakpointData,
                    estilos: {
                      ...currentStyles,
                      [propriedade]: valor
                    }
                  }
                }
              };
            }),
          };
        }),

      removerElemento: (id) =>
        set((state) => ({
          elementos: normalizarZIndex(state.elementos.filter((el) => el.id !== id)),
          elementosSelecionadosIds: state.elementosSelecionadosIds.filter(sid => sid !== id),
        })),

      removerVarios: (ids) =>
        set((state) => ({
          elementos: normalizarZIndex(state.elementos.filter((el) => !ids.includes(el.id))),
          elementosSelecionadosIds: [],
        })),

      vincularElementoPai: (filhoId, paiId) =>
        set((state) => {
          const { viewport, elementos } = state;
          const pai = paiId ? elementos.find(el => el.id === paiId) : null;
          
          return {
            elementos: elementos.map((el) => {
              if (el.id !== filhoId) return el;
              
              // Se estamos vinculando a um novo pai, ajustamos as coordenadas para manter a posição visual
              if (paiId && pai) {
                const absFilho = getAbsolutePosition(el, elementos, viewport);
                const absPai = getAbsolutePosition(pai, elementos, viewport);
                
                // Nova posição local = Posição Absoluta Filho - Posição Absoluta do Pai
                const newX = absFilho.x - absPai.x;
                const newY = absFilho.y - absPai.y;
                
                return {
                  ...el,
                  parentId: paiId,
                  breakpoints: {
                    ...el.breakpoints,
                    [viewport]: {
                      ...(el.breakpoints[viewport] || {}),
                      x: newX,
                      y: newY
                    }
                  }
                };
              }
              
              // Se estamos desvinculando (paiId é null)
              if (!paiId && el.parentId) {
                const absFilho = getAbsolutePosition(el, elementos, viewport);
                
                // Nova posição absoluta = simplesmente a posição absoluta que ele já tinha
                return {
                  ...el,
                  parentId: undefined,
                  breakpoints: {
                    ...el.breakpoints,
                    [viewport]: {
                      ...(el.breakpoints[viewport] || {}),
                      x: absFilho.x,
                      y: absFilho.y
                    }
                  }
                };
              }

              return { ...el, parentId: paiId || undefined };
            }),
          };
        }),

      // Seleção única (click normal)
      selecionarElemento: (id) => {
        console.log(`[DEBUG] selecionarElemento id: ${id}`);
        set({ elementosSelecionadosIds: id ? [id] : [] });
      },

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
          
          // Recalcula o zIndex de todos os elementos para refletir a nova ordem
          const listaAtualizada = novaLista.map((el, index) => ({
            ...el,
            zIndex: index + 1
          }));

          return { elementos: listaAtualizada };
        }),

      setActiveGuides: (guides) => set({ activeGuides: guides }),
      setProjectId: (id) => set({ projectId: id }),
      setProjectName: (name) => set({ projectName: name }),
      setIsSaving: (isSaving) => set({ isSaving }),
      loadProject: (project) => set({
        projectId: project.id,
        projectName: project.name,
        elementos: project.canvasState.elementos || [],
        elementosSelecionadosIds: []
      }),
    }),
    {
      partialize: (state) => ({
        elementos: state.elementos,
        elementosSelecionadosIds: state.elementosSelecionadosIds,
        projectId: state.projectId,
        projectName: state.projectName,
      }),
    }
  )
);

/** Hook auxiliar: retorna o ID do primeiro elemento selecionado (ou null). */
export function useElementoSelecionadoId(): string | null {
  return useEditorStore((s) => s.elementosSelecionadosIds.length > 0 ? s.elementosSelecionadosIds[0] : null);
}

