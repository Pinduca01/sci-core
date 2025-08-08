# SCI Core - Sistema de Autenticação

Sistema de login moderno com integração Supabase e design split-screen.

## Características

- **Layout Split-Screen**: Design responsivo com duas colunas
- **Efeito Spotlight**: Interação visual na coluna esquerda
- **Gradiente Animado**: Fundo com animação suave
- **Integração Supabase**: Autenticação completa via MCP
- **TypeScript**: Tipagem completa
- **Tailwind CSS**: Estilização moderna

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React (ícones)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Estrutura do Projeto

```
├── app/
│   ├── (auth)/login/page.tsx    # Página de login
│   ├── dashboard/page.tsx       # Dashboard principal
│   ├── globals.css              # Estilos globais
│   └── layout.tsx               # Layout raiz
├── components/
│   └── auth/LoginForm.tsx       # Componente do formulário
├── lib/
│   ├── auth.ts                  # Funções de autenticação
│   ├── auth.config.ts           # Configuração de auth
│   └── supabase.ts              # Cliente Supabase
└── ...
```

## Configuração

As variáveis de ambiente já estão configuradas no arquivo `.env.local` com as credenciais do projeto Supabase.

## Funcionalidades

- ✅ Login com email/senha
- ✅ Recuperação de senha
- ✅ Redirecionamento baseado em roles
- ✅ Validação de formulários
- ✅ Estados de loading
- ✅ Tratamento de erros
- ✅ Design responsivo
- ✅ Efeitos visuais interativos
Sistema centralizado de gestão de dados e processos de uma SESCINC
