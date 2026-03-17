import { EstilosCSS } from '../core/domain/Componente';
import React from 'react';

export const getValidStyles = (estilos: any | EstilosCSS): React.CSSProperties => {
  if (!estilos) return {};
  
  // Se for o formato antigo/aninhado, pega a base. Se for o novo/resolvido, usa direto.
  const styles = estilos.base ? estilos.base : estilos;
  const { isGradient, gradientColor1, gradientColor2, gradientAngle, ...validStyles } = styles;
  
  if (isGradient) {
    const c1 = gradientColor1 || '#3b82f6';
    const c2 = gradientColor2 || '#9333ea';
    const angle = gradientAngle ?? 90;
    validStyles.backgroundImage = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    validStyles.backgroundColor = 'transparent';
  }
  
  return validStyles as React.CSSProperties;
};

export function getComputedStyles(estilos: any, viewport: string): EstilosCSS {
  if (!estilos) return {};
  
  // Se for o formato novo (estilos já resolvidos/achatados), retorna direto
  if (estilos && !estilos.base && !estilos.tablet && !estilos.mobile) {
    return estilos;
  }

  const base = estilos.base || {};
  const tablet = estilos.tablet || {};
  const mobile = estilos.mobile || {};

  if (viewport === 'mobile') {
    return { ...base, ...tablet, ...mobile };
  }
  if (viewport === 'tablet') {
    return { ...base, ...tablet };
  }
  return base;
}

