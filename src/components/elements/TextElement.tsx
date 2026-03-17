import type { Componente } from '@/core/domain/Componente';
import { getValidStyles } from '@/utils/styleHelpers';

interface TextElementProps {
  elemento: Componente;
}

export default function TextElement({ elemento }: TextElementProps) {
  return (
    <div
      style={{
        ...getValidStyles(elemento.estilos),
        width: '100%',
        height: '100%',
        margin: 0,
        cursor: elemento.link ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: elemento.estilos.textAlign === 'center' ? 'center' : 'flex-start',
      }}
      className="overflow-hidden"
    >
      {elemento.conteudoTextual || ' '}
    </div>
  );
}
