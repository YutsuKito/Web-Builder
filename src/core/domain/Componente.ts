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

export type Viewport = 'desktop' | 'tablet' | 'mobile';


export interface BreakpointData {
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  estilos?: EstilosCSS;
  dockX?: 'left' | 'center' | 'right';
  dockY?: 'top' | 'center' | 'bottom';
}

/**
 * Entidade central do domínio que representa um elemento genérico de UI.
 */
export interface Componente {
  /** Identificador único do componente (UUID). */
  readonly id: string;

  /** Tipo semântico do elemento (ex: 'button', 'gradient'). */
  readonly tipo: TipoComponente;

  /** Dados e estilos mapeados por viewport. */
  readonly breakpoints: Record<Viewport, BreakpointData>;

  /** Texto exibido dentro do componente (pode ser vazio). */
  readonly conteudoTextual: string;

  /** Nome customizado exibido no painel de camadas */
  readonly nomeCamada?: string;

  /** Ordem de empilhamento (comum a todos os breakpoints por simplicidade inicial) */
  readonly zIndex: number;
  
  /** Propriedades específicas para imagens ('image') */
  readonly src?: string;
  readonly alt?: string;

  /** IDs dos elementos filhos caso seja um 'container' */
  readonly childrenIds?: string[];

  /** ID do elemento pai (opcional) */
  readonly parentId?: string;

  /** Propriedades de link (comum a todos os elementos) */
  readonly link?: string;
  readonly linkTarget?: '_blank' | '_self';
}

