import { Componente } from '../core/domain/Componente';

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
    elements: Componente[],
    canvasWidth: number,
    canvasHeight: number
  ): SnappedPosition => {
    let snappedX = x;
    let snappedY = y;
    const guides: Guide[] = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const currentRight = x + width;
    const currentBottom = y + height;
    const currentCenterX = x + halfWidth;
    const currentCenterY = y + halfHeight;

    // --- Vertical Guides (Snap X) ---
    const vSnapPoints = [
      { pos: 0, guide: 0 }, // Left edge of canvas
      { pos: canvasWidth / 2 - halfWidth, guide: canvasWidth / 2 }, // Center of canvas
      { pos: canvasWidth - width, guide: canvasWidth }, // Right edge of canvas
    ];

    // Other elements vertical edges and centers
    elements.forEach((el) => {
      if (el.id === currentId) return;

      const elX = el.x;
      const elWidth = typeof el.width === 'number' ? el.width : parseFloat(el.width);
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

    // Check X snapping
    for (const point of vSnapPoints) {
      if (Math.abs(x - point.pos) < threshold) {
        snappedX = point.pos;
        guides.push({ axis: 'x', position: point.guide });
        break;
      }
    }

    // --- Horizontal Guides (Snap Y) ---
    const hSnapPoints = [
      { pos: 0, guide: 0 }, // Top edge of canvas
      { pos: canvasHeight / 2 - halfHeight, guide: canvasHeight / 2 }, // Center of canvas
      { pos: canvasHeight - height, guide: canvasHeight }, // Bottom edge of canvas
    ];

    elements.forEach((el) => {
      if (el.id === currentId) return;

      const elY = el.y;
      const elHeight = typeof el.height === 'number' ? el.height : parseFloat(el.height);
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

    // Check Y snapping
    for (const point of hSnapPoints) {
      if (Math.abs(y - point.pos) < threshold) {
        snappedY = point.pos;
        guides.push({ axis: 'y', position: point.guide });
        break;
      }
    }

    return { x: snappedX, y: snappedY, guides };
  };

  return { calculateSnapping };
};
