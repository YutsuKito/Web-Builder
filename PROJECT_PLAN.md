# 🎨 Gerador Web de UI/CSS (Nome do Projeto)

## 📌 Visão Geral
Um aplicativo web focado em permitir que usuários não-desenvolvedores criem estilizações de HTML e CSS de maneira intuitiva e visual. O sistema oferece ferramentas drag-and-drop e painéis de configuração para gerar componentes (botões, gradientes, imagens, etc.) e exportar o código limpo e pronto para uso.

## 🚀 Tecnologias Utilizadas
* **Frontend & Backend:** Next.js 16 (App Router)
* **Linguagem:** TypeScript (Tipagem estática rigorosa)
* **Banco de Dados:** SQL (via container Docker)
* **Estilização do App:** Tailwind CSS (Recomendado para a interface da plataforma)
* **Gerenciamento de Estado:** Zustand ou Context API (para o canvas de edição)

## 🏗 Arquitetura (Clean Architecture adaptada para Next.js)
Para garantir fácil manutenção e escalabilidade, o projeto utilizará uma separação clara de responsabilidades, dividindo a lógica de negócios da interface e da infraestrutura.

### Camadas da Arquitetura
1.  **Domain (Domínio):** Entidades centrais do negócio (ex: `Componente`, `Estilo`, `Projeto`) e interfaces (contratos).
2.  **Use Cases (Casos de Uso):** Regras de negócio da aplicação (ex: `SalvarProjeto`, `GerarCodigoCSS`, `ExportarHTML`).
3.  **Infrastructure (Infraestrutura):** Implementações externas, como conexão com banco de dados SQL, repositórios e serviços de terceiros.
4.  **Presentation (Apresentação):** Componentes React, páginas do Next.js (App Router) e Server Actions/Route Handlers.

### 📂 Estrutura de Diretórios Sugerida
```text
📦 src
 ┣ 📂 app                  # Presentation: Rotas, Pages e Layouts (Next.js 16)
 ┃ ┣ 📂 (auth)             # Rotas de autenticação
 ┃ ┣ 📂 editor             # Página principal do canvas de edição
 ┃ ┗ 📜 layout.tsx         # Layout base
 ┣ 📂 components           # Presentation: Componentes de UI isolados (Botões, Modais)
 ┣ 📂 core                 # Core da Aplicação (Clean Architecture)
 ┃ ┣ 📂 domain             # Entidades e Interfaces
 ┃ ┃ ┣ 📜 Project.ts
 ┃ ┃ ┗ 📜 User.ts
 ┃ ┣ 📂 use-cases          # Lógica de negócio e orquestração
 ┃ ┃ ┣ 📜 SaveProject.ts
 ┃ ┃ ┗ 📜 GenerateCSS.ts
 ┃ ┗ 📂 infra              # Infrastructure: Banco de dados, Repositórios, APIs externas
 ┃   ┣ 📂 database         # Conexão SQL, Queries ou ORM
 ┃   ┗ 📂 repositories     # Implementação dos contratos do domínio
 ┣ 📂 lib                  # Utilitários gerais e configurações de bibliotecas externas
 ┗ 📂 types                # Tipagens globais do TypeScript