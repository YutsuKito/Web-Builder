# 🎨 Gerador Web de UI/CSS

O **Gerador Web de UI/CSS** é uma plataforma intuitiva projetada para permitir que usuários criem interfaces e componentes web visualmente, exportando código HTML e CSS limpo e responsivo.

## 🚀 Funcionalidades Principais

- **Editor Visual Drag & Drop:** Arraste, redimensione e posicione elementos com facilidade.
- **Estilização Avançada:** Controle total sobre cores, gradientes, opacidade, bordas e tipografia.
- **Sistema de Grade e Guias Magnéticas:** Alinhamento preciso com snapping automático.
- **Design Responsivo Nativo:** Edite estilos independentes para Desktop, Tablet e Mobile.
- **Gerenciamento de Camadas:** Organize e reordene elementos visualmente.
- **Docking de Componentes:** Posicionamento inteligente (âncoras) para manter layouts em diferentes telas.
- **Templates Pré-moldados:** Inicie projetos rapidamente com seções e componentes prontos.
- **Exportação de Código:** Gere e baixe o código HTML/CSS pronto para produção.
- **Undo/Redo:** Histórico de alterações completo para maior segurança na edição.

## 🛠 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Estado Global:** [Zustand](https://zustand-demo.pmnd.rs/) com middleware [Zundo](https://github.com/charkour/zundo) (Undo/Redo)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **Infraestrutura:** [Docker](https://www.docker.com/) & Docker Compose
- **Interatividade:** [React Rnd](https://github.com/bokuweb/react-rnd) para drag/resize.

## 🏁 Como Começar

### Pré-requisitos

- Node.js (versão recomendada v20+)
- Docker e Docker Compose

### Configuração do Ambiente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/YutsuKito/Web-Builder.git
   cd Web-Builder
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` baseado no `.env.local` (ou vice-versa) com suas credenciais do banco de dados.

4. **Suba o Banco de Dados (Docker):**
   ```bash
   docker-compose up -d
   ```

5. **Rode as migrações do Prisma:**
   ```bash
   npx prisma migrate dev
   ```

### Executando em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗 Arquitetura

O projeto segue uma versão adaptada da **Clean Architecture**, dividindo responsabilidades em:

- `src/core/domain`: Entidades e interfaces de contrato.
- `src/core/use-cases`: Regras de negócio e lógica de orquestração.
- `src/core/infra`: Implementações de infraestrutura (DB, API).
- `src/app` & `src/components`: Camada de apresentação (UI).

## 🔎 Análise e roadmap de melhorias

Foi adicionada uma análise técnica completa do estado atual do projeto, com prioridades e sugestões de evolução:

- [`ANALISE_MELHORIAS.md`](./ANALISE_MELHORIAS.md)

## 📄 Licença

Este projeto é privado. Consulte os proprietários para termos de uso.
