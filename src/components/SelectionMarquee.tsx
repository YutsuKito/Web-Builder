'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MarqueeState {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verifica se dois retângulos se intersectam (colisão AABB).
 */
function retangulosColidem(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Normaliza as coordenadas do marquee para sempre ter width/height positivos.
 * (o drag pode ir em qualquer direção)
 */
function normalizarMarquee(state: MarqueeState): Rect {
  const x = Math.min(state.startX, state.currentX);
  const y = Math.min(state.startY, state.currentY);
  const width = Math.abs(state.currentX - state.startX);
  const height = Math.abs(state.currentY - state.startY);
  return { x, y, width, height };
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface SelectionMarqueeProps {
  /** Ref para o container do artboard (necessário para calcular coordenadas relativas) */
  artboardRef: React.RefObject<HTMLDivElement | null>;
}

export function SelectionMarquee({ artboardRef }: SelectionMarqueeProps) {
  const { elementos, setSelection, clearSelection } = useEditorStore();
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const isDrawing = useRef(false);

  /**
   * Calcula a posição do mouse relativa ao artboard (não à viewport).
   */
  const getRelativePosition = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    if (!artboardRef.current) return { x: 0, y: 0 };
    const rect = artboardRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left + artboardRef.current.scrollLeft,
      y: e.clientY - rect.top + artboardRef.current.scrollTop,
    };
  }, [artboardRef]);

  /**
   * Início do marquee (onMouseDown no fundo vazio).
   * Só ativa se o clique foi diretamente no artboard, não em um elemento filho.
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Verifica se o clique foi exatamente no artboard (fundo vazio)
    if (e.target !== e.currentTarget) return;
    // Ignora botão direito
    if (e.button !== 0) return;

    const pos = getRelativePosition(e);
    isDrawing.current = true;

    setMarquee({
      isActive: true,
      startX: pos.x,
      startY: pos.y,
      currentX: pos.x,
      currentY: pos.y,
    });

    // Se não está segurando Shift, limpa a seleção anterior
    if (!e.shiftKey) {
      clearSelection();
    }
  }, [getRelativePosition, clearSelection]);

  /**
   * Expansão do marquee (onMouseMove).
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing.current || !marquee) return;

    const pos = getRelativePosition(e);
    setMarquee(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
  }, [marquee, getRelativePosition]);

  /**
   * Fim do marquee (onMouseUp).
   * Calcula quais elementos colidem com a caixa e atualiza a seleção.
   */
  const handleMouseUp = useCallback((e?: React.MouseEvent) => {
    if (!isDrawing.current || !marquee) {
      isDrawing.current = false;
      setMarquee(null);
      return;
    }

    isDrawing.current = false;

    const selectionRect = normalizarMarquee(marquee);

    if (selectionRect.width > 5 && selectionRect.height > 5) {
      const idsColididos: string[] = [];

      for (const el of elementos) {
        const elRect: Rect = {
          x: el.x,
          y: el.y,
          width: typeof el.width === 'number' ? el.width : parseFloat(el.width) || 0,
          height: typeof el.height === 'number' ? el.height : parseFloat(el.height) || 0,
        };

        if (retangulosColidem(selectionRect, elRect)) {
          idsColididos.push(el.id);
        }
      }

      if (idsColididos.length > 0) {
        setSelection(idsColididos);
      } else if (!e?.shiftKey) {
        // Se desenhou mas não pegou ninguém, e não tá com shift, limpa
        clearSelection();
      }
    } else {
       // Se o rect foi muito pequeno (foi só um click), limpa a seleção
       if (!e?.shiftKey) {
         clearSelection();
       }
    }

    setMarquee(null);
  }, [marquee, elementos, setSelection]);

  // O retângulo visual do marquee
  const marqueeRect = marquee ? normalizarMarquee(marquee) : null;

  return (
    <>
      {/* Camada invisível de captura de eventos sobre o artboard */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ cursor: marquee ? 'crosshair' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          // Previne que o clique que finaliza o marquee dispare ações globais
          if (marqueeRect && marqueeRect.width > 2) {
            e.stopPropagation();
          }
        }}
      />

      {/* Caixa visual do marquee */}
      {marqueeRect && marqueeRect.width > 2 && marqueeRect.height > 2 && (
        <div
          className="absolute pointer-events-none z-[9998] border-2 border-blue-500 bg-blue-500/10 rounded-sm"
          style={{
            left: marqueeRect.x,
            top: marqueeRect.y,
            width: marqueeRect.width,
            height: marqueeRect.height,
          }}
        />
      )}
    </>
  );
}
