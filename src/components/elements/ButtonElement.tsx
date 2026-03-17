'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Componente } from '../../core/domain/Componente';
import { getValidStyles } from '../../utils/styleHelpers';

interface ButtonElementProps {
  elemento: Componente;
}

export default function ButtonElement({ elemento }: ButtonElementProps) {
  const { estilos, conteudoTextual } = elemento;
  const Icon = estilos.iconName ? (LucideIcons as any)[estilos.iconName] : null;
  const iconPosition = estilos.iconPosition || 'left';

  return (
    <button
      style={{
        ...getValidStyles(estilos),
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
      <span className="truncate">{conteudoTextual || ' '}</span>
      {Icon && iconPosition === 'right' && <Icon size={18} />}
    </button>
  );
}
