import { Componente, TipoComponente } from './Componente';

export interface TemplateElement extends Omit<Componente, 'id' | 'zIndex' | 'childrenIds'> {
  id?: string; // Optional in template, used for internal mapping if needed
  children?: TemplateElement[];
}

export interface Template {
  id: string;
  nome: string;
  descricao: string;
  elementos: TemplateElement[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'hero-section',
    nome: 'Hero Section',
    descricao: 'Um container grande com título, descrição e botão de ação.',
    elementos: [
      {
        tipo: 'container',
        x: 0,
        y: 0,
        width: 800,
        height: 400,
        estilos: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
        conteudoTextual: '',
      },
      {
        tipo: 'text',
        x: 200,
        y: 80,
        width: 400,
        height: 'auto',
        estilos: {
          fontSize: '48px',
          fontWeight: '800',
          textAlign: 'center',
          color: '#1e293b',
          marginBottom: '16px',
        },
        conteudoTextual: 'Crie Sites Incríveis',
      },
      {
        tipo: 'text',
        x: 250,
        y: 180,
        width: 300,
        height: 'auto',
        estilos: {
          fontSize: '18px',
          fontWeight: '400',
          textAlign: 'center',
          color: '#64748b',
          marginBottom: '32px',
        },
        conteudoTextual: 'A maneira mais rápida de transformar suas ideias em realidade digital.',
      },
      {
        tipo: 'button',
        x: 325,
        y: 280,
        width: 150,
        height: 'auto',
        estilos: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '14px 28px',
          borderRadius: '9999px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          border: 'none',
          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
        },
        conteudoTextual: 'Começar Agora',
      }
    ]
  },
  {
    id: 'pricing-card',
    nome: 'Card de Preço',
    descricao: 'Um card elegante para exibir planos e preços.',
    elementos: [
      {
        tipo: 'container',
        x: 0,
        y: 0,
        width: 300,
        height: 450,
        estilos: {
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        },
        conteudoTextual: '',
      },
      {
        tipo: 'text',
        x: 50,
        y: 40,
        width: 200,
        height: 'auto',
        estilos: {
          fontSize: '14px',
          fontWeight: '700',
          color: '#3b82f6',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        },
        conteudoTextual: 'Plano Pro',
      },
      {
        tipo: 'text',
        x: 50,
        y: 80,
        width: 200,
        height: 'auto',
        estilos: {
          fontSize: '48px',
          fontWeight: '800',
          color: '#1e293b',
          textAlign: 'center',
        },
        conteudoTextual: '$29',
      },
      {
        tipo: 'text',
        x: 50,
        y: 140,
        width: 200,
        height: 'auto',
        estilos: {
          fontSize: '14px',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '24px',
        },
        conteudoTextual: 'por mês',
      },
      {
        tipo: 'button',
        x: 50,
        y: 360,
        width: 200,
        height: 'auto',
        estilos: {
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '12px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          width: '100%',
        },
        conteudoTextual: 'Assinar Plano',
      }
    ]
  }
];
