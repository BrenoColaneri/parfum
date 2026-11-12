# 🌟 PARFUM — Biblioteria Olfativa & Oráculo Inteligente

> **Aplicação Progressive Web App (PWA) de luxo para catalogação de coleções de perfumes, diário olfativo, recomendação inteligente baseada no clima e consultoria com IA generativa.**

🌐 **Acesse a aplicação em produção:** [https://parfum-two-delta.vercel.app/](https://parfum-two-delta.vercel.app/)

---

## 📌 Sumário
- [1. Visão Geral](#1-visão-geral)
- [2. Principais Funcionalidades](#2-principais-funcionalidades)
- [3. Tecnologias Utilizadas](#3-tecnologias-utilizadas)
- [4. Arquitetura e Estrutura de Diretórios](#4-arquitetura-e-estrutura-de-diretórios)
- [5. Pré-requisitos e Instalação](#5-pré-requisitos-e-instalação)
- [6. Configuração do Supabase & Migrações](#6-configuração-do-supabase--migrações)
- [7. Configuração da Inteligência Artificial (Google Gemini)](#7-configuração-da-inteligência-artificial-google-gemini)
- [8. Execução e Comandos](#8-execução-e-comandos)
- [9. Testes Automatizados (Vitest)](#9-testes-automatizados-vitest)
- [10. Modo Demonstração para Apresentações](#10-modo-demonstração-para-apresentações)
- [11. Segurança e Boas Práticas](#11-segurança-e-boas-práticas)

---

## 1. Visão Geral

O **PARFUM** é um ecossistema digital refinado voltado a entusiastas e colecionadores de perfumaria fina. O sistema resolve o problema clássico de "erros climáticos" (utilizar perfumes densos em dias de calor excessivo ou fragrâncias excessivamente voláteis no frio intenso), oferecendo:
- Um **Oráculo Olfativo** que cruza temperatura, sensação térmica, umidade e ocasião para sugerir a melhor fragrância da coleção pessoal.
- Um **Acervo Digital (Biblioteria)** completo com pirâmide olfativa, notas, acordes, controle de borrifadas, nível do frasco e valor investido.
- **Visão Computacional Multimodal** para cadastrar frascos apenas tirando uma foto com o celular.
- **Laboratório Olfativo:** *Layering* (mistura de duas fragrâncias), busca por *contratipos/dupes* acessíveis no Brasil e *Batalha Olfativa* com critérios técnicos.
- **Sommelier Virtual (Jean):** Chat conversacional especializado em consultoria de estilo e imagem.

---

## 2. Principais Funcionalidades

### 🏰 Gestão do Acervo (Biblioteria)
- **Cadastro Inteligente:** Preenchimento automático de notas, concentração (EDC, EDT, EDP, Parfum, Extrait) e marca via Google Gemini.
- **Identificação por Foto:** Envio de fotografia do frasco processado por visão computacional.
- **Filtros Avançados:** Filtre por família olfativa (*Amadeirado, Fresco, Doce, Especiado*) ou gênero (*Masculino, Feminino, Unissex*).
- **Controle de Frasco:** Acompanhe ml restantes e registre borrifadas utilizadas.
- **Gestão Financeira:** Registro do preço pago (`price_paid`) com cálculo automático do valor total investido.

### 🔮 Oráculo Climático (Home & Análise)
- **Leitura Meteorológica em Tempo Real:** Conexão com Open-Meteo e geolocalização do dispositivo.
- **Simulador de Horário:** Teste recomendações para *Agora*, *Dia* ou *Noite*.
- **Seleção de Ocasiões:** Trabalho, Encontro, Academia, Festa, Jantar, ou crie suas próprias ocasiões personalizadas.
- **Dica do Sommelier & Notas a Evitar:** Recomendações de borrifadas e alerta contra acordes sufocantes no clima atual.
- **Lojas Físicas & Cotação:** Visualização de lojas parceiras na região e busca online rápida no Google Shopping.

### 💖 Lista de Desejos (Wishlist)
- **Meta de Preço:** Defina o valor máximo que você aceita pagar.
- **Links Diretos:** Acesso com 1 clique para checar o preço real na Amazon, Sephora, Mercado Livre e Google Shopping.
- **Transparência:** Preços baseados em metas do usuário e links de lojas reais, sem falsas simulações randômicas.

### 📅 Diário Olfativo & Estatísticas
- **Perfume do Dia (SOTD):** Marque o que você usou com um clique; prevenção contra duplicidades na mesma data.
- **Gráficos e Métricas:** Distribuição da coleção por famílias olfativas (Recharts) e ranking dos frascos mais usados.

### ⚙️ Ajustes & Experiência
- **Tema Claro / Tema Escuro:** Alternância instantânea com contraste WCAG AA preservado.
- **Modais Nativos:** Sem uso de `alert()` ou `prompt()`; sistema integrado de Toasts e Confirmações seguras.

---

## 3. Tecnologias Utilizadas

| Tecnologia | Versão | Função na Aplicação |
|---|---|---|
| **React** | 19.2.x | Biblioteca de interface reativa e componentizada |
| **Vite** | 8.2.x | Bundler ultra-rápido com compilação Rolldown |
| **React Router DOM** | 7.18.x | Roteamento declarativo de páginas e histórico SPA |
| **Supabase** | 2.112.x | Backend-as-a-Service: Autenticação JWT e PostgreSQL gerenciado |
| **PostgreSQL** | 15+ | Banco relacional com Row Level Security (RLS) estrito |
| **Google Generative AI** | 0.24.x | SDK Gemini (Oráculo, Visão Multimodal e Sommelier) |
| **Recharts** | 3.10.x | Gráficos vetoriais de distribuição e perfil olfativo |
| **Lucide React** | 1.31.x | Ícones estilizados e consistentes |
| **Vite Plugin PWA** | 1.3.x | Capacidade offline, Service Worker e manifesto instalável |
| **Vitest** | 5.1.x | Framework de testes unitários e de integração de alta velocidade |
| **Testing Library** | 16.3.x | Testes orientados a comportamento e acessibilidade |

---

## 4. Arquitetura e Estrutura de Diretórios

```
PARFUM/
├── api/
│   └── gemini.js               # Serverless Function Vercel (Backend seguro da IA)
├── migrations/
│   └── 01_fix_sotd_and_inventory.sql  # Migração SQL idempotente para o Supabase
├── public/
│   └── manifest.json           # Manifesto PWA com ícones e splash screen
├── src/
│   ├── assets/                 # Imagens estáticas e logotipos
│   ├── components/
│   │   ├── BottomNav.jsx       # Barra de navegação inferior elegante
│   │   └── FloatingChat.jsx    # Chat modal flutuante com Sommelier Virtual
│   ├── context/
│   │   ├── AppProvider.jsx     # Contexto mestre (Inventário, SOTD, Clima, Demo Mode)
│   │   └── ToastContext.jsx    # Sistema de Toasts e Diálogos de Confirmação
│   ├── pages/
│   │   ├── Analysis.jsx        # Tela de análise do Oráculo, Layering, Clones e Batalha
│   │   ├── History.jsx         # Histórico diário e estatísticas com gráficos
│   │   ├── Home.jsx            # Tela principal com clima, ocasiões e recomendação
│   │   ├── Inventory.jsx       # Acervo da Biblioteria com filtros e cadastro inteligente
│   │   ├── Login.jsx           # Autenticação, criação de conta e recuperação
│   │   ├── PerfumeDetails.jsx  # Ficha técnica, pirâmide olfativa, borrifadas e diário
│   │   ├── Settings.jsx        # Configurações de senha, e-mail, tema e demo
│   │   └── Wishlist.jsx        # Lista de desejos com links para lojas reais
│   ├── test/
│   │   ├── setup.js            # Configuração do ambiente de testes
│   │   ├── auth.test.js        # Testes de autenticação e sessão
│   │   ├── inventory.test.js   # Testes da biblioteria, filtros e price_paid
│   │   ├── wishlist.test.js    # Testes de metas e links de compra
│   │   ├── history.test.js     # Testes do SOTD e cálculos estatísticos
│   │   └── aiRecommender.test.js # Testes do Oráculo, Sommelier e resiliência
│   ├── utils/
│   │   ├── aiRecommender.js    # Orquestrador de IA com fallback e proxy serverless
│   │   └── supabaseClient.js   # Cliente Supabase com inicialização segura
│   ├── App.jsx                 # Rotas protegidas e estrutura global
│   ├── index.css               # Estilos Glassmorphism e suporte Dark/Light
│   └── main.jsx                # Ponto de entrada do React com Providers
├── .env.example                # Modelo de variáveis de ambiente documentadas
├── package.json                # Dependências e scripts de execução
├── supabase_schema.sql         # Schema SQL completo e atualizado com RLS
├── vercel.json                 # Roteamento seguro de SPA e Serverless Functions
└── vite.config.js              # Configuração do Vite, PWA e Vitest
```

---

## 5. Pré-requisitos e Instalação

### Pré-requisitos:
- **Node.js**: v18.0.0 ou superior (recomendado v20+).
- **Gerenciador de Pacotes**: npm ou yarn.

### Instalação passo a passo:

```bash
# 1. Clone o repositório
git clone https://github.com/BrenoColaneri/parfum.git
cd parfum

# 2. Instale as dependências
npm install

# 3. Configure o arquivo de variáveis de ambiente
cp .env.example .env
```

---

## 6. Configuração do Supabase & Migrações

1. Acesse o [Supabase Dashboard](https://supabase.com).
2. Vá em **SQL Editor** no menu lateral.
3. Copie e cole todo o conteúdo do arquivo [`supabase_schema.sql`](./supabase_schema.sql) (ou aplique a migração incremental [`migrations/01_fix_sotd_and_inventory.sql`](./migrations/01_fix_sotd_and_inventory.sql) se você já possui uma base anterior).
4. Clique em **Run** para criar as tabelas `inventory`, `wishlist` e `sotd_history`, os índices de performance e as políticas RLS.
5. Copie a **URL do Projeto** e a **Anon Key** e cole no seu `.env`:
   ```env
   VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
   VITE_SUPABASE_ANON_KEY="sua_chave_anon_aqui"
   ```

---

## 7. Configuração da Inteligência Artificial (Google Gemini)

O PARFUM foi projetado com arquitetura de segurança moderna:

- **Em Produção (Vercel):**
  Defina a variável `GEMINI_API_KEY` diretamente no painel da Vercel (*Project Settings -> Environment Variables*). As requisições de IA serão processadas pelo endpoint serverless `/api/gemini`, **sem expor a chave de API no código JavaScript do navegador do usuário**.
- **Em Desenvolvimento Local:**
  Caso deseje testar a IA diretamente sem a CLI da Vercel, defina `VITE_GEMINI_API_KEY` no seu `.env` local.
- **Modo Offline / Sem Chave:**
  Se nenhuma chave for fornecida, a aplicação **não quebra**: ela ativa automaticamente o motor olfativo determinístico com regras harmônicas pré-definidas.

---

## 8. Execução e Comandos

```bash
# Iniciar servidor de desenvolvimento local
npm run dev

# Executar a suíte de testes automatizados (Vitest)
npm test

# Compilar para produção (Vite Build)
npm run build

# Pré-visualizar o build de produção localmente
npm run preview
```

---

## 9. Testes Automatizados (Vitest)

O projeto conta com suíte de testes automatizados com cobertura nas áreas críticas:

```bash
npm test
```

### Resultados dos Testes:
```
 ✓ src/test/history.test.js (3 tests)
 ✓ src/test/wishlist.test.js (3 tests)
 ✓ src/test/auth.test.js (4 tests)
 ✓ src/test/inventory.test.js (5 tests)
 ✓ src/test/aiRecommender.test.js (7 tests)
 ✓ src/test/fullValidation.test.jsx (15 tests)

 Test Files  6 passed (6)
      Tests  37 passed (37)
```

---

## 10. Modo Demonstração para Apresentações

Para avaliações acadêmicas, bancas de TCC, entrevistas ou apresentações onde não se deseja criar conta no Supabase:

1. Na tela de login, clique em **"Acessar Modo Demonstração"**.
2. O sistema carregará instantaneamente um acervo de fragrâncias de prestígio internacional (*Bleu de Chanel, Sauvage Elixir, Acqua di Giò Profondo, Baccarat Rouge 540, Terre d'Hermès*), dados de desejos e histórico pronto para navegação fluida.
3. Você também pode ativar ou redefinir a demonstração a qualquer momento na aba **Ajustes (Configurações) -> Carregar Demo**.

---

## 11. Segurança e Boas Práticas

- **Row Level Security (RLS):** Toda consulta SQL no Supabase é filtrada por `auth.uid() = user_id`. Um usuário é estritamente impedido de acessar dados de outro colecionador.
- **Proteção de Segredos:** Suporte a Serverless Function para evitar vazamento de chaves de IA em pacotes de frontend.
- **Zero Raw Alerts:** Diálogos intrusivos foram substituídos por Toasts flutuantes e modais de confirmação para ações destrutivas.
- **Validação de Entrada:** Limitação de tamanho de uploads (máximo 4MB) e checagem de tipos MIME de imagens para evitar estouro de memória e vulnerabilidades.
