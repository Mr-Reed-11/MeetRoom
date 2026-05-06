# MeetRoom — Sistema de Reserva de Sala de Reuniões

Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento Web** — Pós-graduação Lato Sensu em Desenvolvimento de Sistemas Computacionais, IFTO Campus Araguatins.

## Equipe

| Nome | Função |
|------|--------|
| Francisco Jorge Pires | Gerente de Projeto |
| Vitor Cesar Gonçalves Ornelas | Desenvolvedor Full Stack |
| Ananda Máyra Afonso Ferreira | Administradora de Banco de Dados |
| Aline Ribeiro Alves | Analista de QA |

---

## Sobre o projeto

O MeetRoom permite que colaboradores visualizem a disponibilidade de salas de reuniões, realizem agendamentos e administrem reservas de forma eficiente. Administradores têm acesso a um painel completo de gestão de usuários, salas e relatórios de utilização.

### Funcionalidades

- **Calendário** — visualização mensal com marcação dos dias que possuem reservas
- **Reservas** — criar, editar e cancelar reservas com validação de conflito de horário
- **Salas** — cadastro e gestão de salas (admin)
- **Usuários** — gerenciamento de usuários e perfis (admin)
- **Relatórios** — estatísticas de uso e taxa de utilização por sala (admin)
- **Configurações** — edição de perfil e troca de senha

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | NestJS, TypeScript |
| Banco de dados | PostgreSQL 16 |
| Autenticação | JWT + bcrypt |
| Containerização | Docker + Docker Compose |
| Hospedagem | Vercel (frontend) · Render (backend + banco) |

---

## Estrutura do repositório

```
MeetRoom/
├── frontend/          # React app (Vite)
├── backend/           # NestJS API
├── docker-compose.yml # Orquestração local
└── README.md
```

---

## Rodando localmente com Docker

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado e rodando
- [Docker Compose](https://docs.docker.com/compose/) (já incluso no Docker Desktop)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/meetroom.git
cd meetroom
```

### 2. Suba os containers

```bash
docker compose up --build
```

Na primeira execução as imagens serão construídas e as dependências instaladas. Aguarde até ver os logs do backend e do nginx.

### 3. Acesse a aplicação

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

### 4. Crie o primeiro usuário administrador

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@meetroom.com","password":"123456","role":"admin"}' | jq
```

Depois acesse http://localhost:5173 e faça login com as credenciais acima.

### Comandos úteis

```bash
docker compose up -d          # sobe em background
docker compose down           # para os containers
docker compose down -v        # para e apaga o volume do banco
docker compose logs -f        # acompanha os logs em tempo real
docker compose logs backend   # logs só do backend
```

---

## Rodando sem Docker (modo desenvolvimento)

### Pré-requisitos

- Node.js 22+
- pnpm (`npm install -g pnpm`)
- PostgreSQL rodando localmente

### Backend

```bash
cd backend
cp .env.example .env        # configure as variáveis
pnpm install
pnpm start:dev              # inicia em modo watch na porta 3000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev                    # inicia em modo dev na porta 5173
```

### Variáveis de ambiente do backend (`.env`)

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/meetroom
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## API — Endpoints principais

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/login` | Login, retorna JWT | — |
| GET | `/rooms` | Listar salas | ✓ |
| POST | `/rooms` | Cadastrar sala | Admin |
| GET | `/bookings` | Reservas do usuário | ✓ |
| POST | `/bookings` | Criar reserva | ✓ |
| DELETE | `/bookings/:id` | Cancelar reserva | ✓ |
| GET | `/users` | Listar usuários | Admin |
| GET | `/reports/bookings` | Relatório geral | Admin |
| GET | `/reports/rooms/usage` | Uso por sala | Admin |

---

## Deploy no Render

Consulte o guia de deploy na wiki do projeto ou siga os passos abaixo:

1. Crie um **PostgreSQL** managed no Render — copie a `DATABASE_URL`
2. Crie um **Web Service** para o backend apontando para `./backend/Dockerfile`
3. Crie um **Static Site** para o frontend com build command `pnpm build`, publish dir `dist` e variável `VITE_API_URL=https://sua-api.onrender.com`
