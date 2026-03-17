import { Componente } from '../core/domain/Componente';

export interface SnapElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Guide {
  axis: 'x' | 'y';
  position: number;
}

interface SnappedPosition {
  x: number;
  y: number;
  guides: Guide[];
}

export const useMagneticGuidelines = () => {
  const threshold = 8; // Pixels distance to trigger snap

  const calculateSnapping = (
    currentId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    elements: SnapElement[],
    canvasWidth: number,
    canvasHeight: number,
    isNested: boolean = false
  ): SnappedPosition => {
    let snappedX = x;
    let snappedY = y;
    const guides: Guide[] = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // --- Pontos de Snap Verticais (X) ---
    const vSnapPoints: { pos: number; guide: number }[] = [];

    if (!isNested) {
      vSnapPoints.push({ pos: canvasWidth / 2 - halfWidth, guide: canvasWidth / 2 }); // Artboard center
      vSnapPoints.push({ pos: canvasWidth - width, guide: canvasWidth }); // Right Artboard edge
    }

    // Other elements vertical edges and centers
    elements.forEach((el) => {
      if (el.id === currentId) return;

      const elX = Number(el.x);
      const elWidth = Number(el.width);
      if (isNaN(elX) || isNaN(elWidth)) return;

      const elRight = elX + elWidth;
      const elCenterX = elX + elWidth / 2;

      // Current Left to Other Left
      vSnapPoints.push({ pos: elX, guide: elX });
      // Current Left to Other Right
      vSnapPoints.push({ pos: elRight, guide: elRight });
      // Current Right to Other Left
      vSnapPoints.push({ pos: elX - width, guide: elX });
      // Current Right to Other Right
      vSnapPoints.push({ pos: elRight - width, guide: elRight });
      // Current Center to Other Center
      vSnapPoints.push({ pos: elCenterX - halfWidth, guide: elCenterX });
    });

    // Check X - Encontrar o ponto de snap mais próximo
    let closestV: { pos: number; guide: number; dist: number } | null = null;
    for (const point of vSnapPoints) {
      const dist = Math.abs(x - point.pos);
      if (dist < threshold) {
        if (!closestV || dist < closestV.dist) {
          closestV = { ...point, dist };
        }
      }
    }

    if (closestV) {
      // Se for snap para 0, só ativa se já estivermos razoavelmente perto (evita saltos do nada)
      if (closestV.pos === 0 && Math.abs(x) > threshold * 1.5) {
        // Não snap para o zero se o movimento foi grande demais para ele (provável glitch)
      } else {
        snappedX = closestV.pos;
        guides.push({ axis: 'x', position: closestV.guide });
      }
    }

    // --- Pontos de Snap Horizontais (Y) ---
    const hSnapPoints: { pos: number; guide: number }[] = [];

    if (!isNested) {
      hSnapPoints.push({ pos: canvasHeight / 2 - halfHeight, guide: canvasHeight / 2 });
      hSnapPoints.push({ pos: canvasHeight - height, guide: canvasHeight });
    }

    elements.forEach((el) => {
      if (el.id === currentId) return;

      const elY = Number(el.y);
      const elHeight = Number(el.height);
      if (isNaN(elY) || isNaN(elHeight)) return;

      const elBottom = elY + elHeight;
      const elCenterY = elY + elHeight / 2;

      // Current Top to Other Top
      hSnapPoints.push({ pos: elY, guide: elY });
      // Current Top to Other Bottom
      hSnapPoints.push({ pos: elBottom, guide: elBottom });
      // Current Bottom to Other Top
      hSnapPoints.push({ pos: elY - height, guide: elY });
      // Current Bottom to Other Bottom
      hSnapPoints.push({ pos: elBottom - height, guide: elBottom });
      // Current Center to Other Center
      hSnapPoints.push({ pos: elCenterY - halfHeight, guide: elCenterY });
    });

    // Check Y - Encontrar o ponto de snap mais próximo
    let closestH: { pos: number; guide: number; dist: number } | null = null;
    for (const point of hSnapPoints) {
      const dist = Math.abs(y - point.pos);
      if (dist < threshold) {
        if (!closestH || dist < closestH.dist) {
          closestH = { ...point, dist };
        }
      }
    }

    if (closestH) {
      if (closestH.pos === 0 && Math.abs(y) > threshold * 1.5) {
        // Ignora
      } else {
        snappedY = closestH.pos;
        guides.push({ axis: 'y', position: closestH.guide });
      }
    }

    // Final safety check: if for some reason snappedX/Y are NaN, use input as fallback
    return { 
      x: isNaN(snappedX) ? Number(x) || 0 : snappedX, 
      y: isNaN(snappedY) ? Number(y) || 0 : snappedY, 
      guides 
    };
  };

  return { calculateSnapping };
};
