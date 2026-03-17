import type { Componente } from '@/core/domain/Componente';
import { getValidStyles } from '@/utils/styleHelpers';

interface ContainerElementProps {
  elemento: Componente;
}

export default function ContainerElement({ elemento }: ContainerElementProps) {
  return (
    <div
      style={{
        ...getValidStyles(elemento.estilos),
        width: '100%',
        height: '100%',
        cursor: elemento.link ? 'pointer' : 'default'
      }}
    >
      {elemento.conteudoTextual}
      {/* Futuramente, este componente iterará sobre elemento.childrenIds e renderizará os filhos */}
    </div>
  );
}
