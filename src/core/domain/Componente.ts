/**
 * Tipos de componentes suportados pelo gerador.
 * Expandir conforme novos elementos forem adicionados.
 */
export type TipoComponente =
  | 'button'
  | 'gradient'
  | 'card'
  | 'text'
  | 'image'
  | 'icon'
  | 'container';

/**
 * Representa um par chave-valor de propriedades CSS.
 *
 * As chaves devem seguir o formato camelCase do JS (ex: `backgroundColor`)
 * e serão convertidas para kebab-case na geração do código CSS.
 *
 * @example
 * const estilos: EstilosCSS = {
 *   backgroundColor: '#3b82f6',
 *   borderRadius: '8px',
 *   fontSize: '16px',
 * };
 */
export type EstilosCSS = {
  opacity?: number;
  borderRadius?: string;
  isGradient?: boolean;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientAngle?: number;
  // Propriedades para ícones em botões
  iconName?: string;
  iconPosition?: 'left' | 'right';
} & Record<string, any>;

/**
 * Entidade central do domínio que representa um elemento genérico de UI.
 *
 * Cada componente possui um identificador único, um tipo que determina
 * a semântica do elemento, um mapa de estilos CSS e um conteúdo textual
 * opcional exibido dentro do elemento.
 */
export interface Componente {
  /** Identificador único do componente (UUID). */
  readonly id: string;

  /** Tipo semântico do elemento (ex: 'button', 'gradient'). */
  readonly tipo: TipoComponente;

  /** Mapa de propriedades CSS aplicadas ao componente. */
  readonly estilos: EstilosCSS;

  /** Texto exibido dentro do componente (pode ser vazio). */
  readonly conteudoTextual: string;

  /** Nome customizado exibido no painel de camadas */
  readonly nomeCamada?: string;

  /** Propriedades espaciais (Drag & Drop) */
  readonly x: number;
  readonly y: number;
  readonly zIndex: number;
  
  /** Dimensões (Resize) */
  readonly width: number | string;
  readonly height: number | string;

  /** Propriedades específicas para imagens ('image') */
  readonly src?: string;
  readonly alt?: string;

  /** IDs dos elementos filhos caso seja um 'container' */
  readonly childrenIds?: string[];

  /** Propriedades de link (comum a todos os elementos) */
  readonly link?: string;
  readonly linkTarget?: '_blank' | '_self';
}
