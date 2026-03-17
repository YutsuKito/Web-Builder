'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Componente } from '../../core/domain/Componente';
import { getValidStyles, getComputedStyles } from '../../utils/styleHelpers';
import { useEditorStore } from '../../store/useEditorStore';

interface ButtonElementProps {
  elemento: Componente;
}

export default function ButtonElement({ elemento }: ButtonElementProps) {
  const { viewport } = useEditorStore();
  const estilos = (elemento as any).estilos || {};
  const computedStyles = getComputedStyles(estilos, viewport);

  const Icon = computedStyles?.iconName ? (LucideIcons as any)[computedStyles.iconName] : null;
  const iconPosition = computedStyles?.iconPosition || 'left';


  return (
    <button
      style={{
        ...getValidStyles(computedStyles),
        width: '100%',
        height: '100%',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: elemento.link ? 'pointer' : 'default',
      }}
      className="font-medium focus:outline-none whitespace-nowrap overflow-hidden shadow-sm pointer-events-none"
      disabled
    >
      {Icon && iconPosition === 'left' && <Icon size={18} />}
      <span className="truncate">{elemento.conteudoTextual || ' '}</span>
      {Icon && iconPosition === 'right' && <Icon size={18} />}
    </button>
  );
}
