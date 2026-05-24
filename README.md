# MeetRoom — Sistema de Reserva de Sala de Reuniões

Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento Web** — Pós-graduação Lato Sensu em Desenvolvimento de Sistemas Computacionais, IFTO Campus Araguatins.

## Autor

**Vitor Cesar Gonçalves Ornelas** — Desenvolvedor Full Stack

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

### 4. Acesse a aplicação

Acesse http://localhost:5173 e faça login com o usuário administrador padrão:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@meetroom.com` |
| Senha | `12345678` |

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

## Deploy

### Ambientes de produção

| Serviço | Plataforma | URL |
|---------|-----------|-----|
| Frontend | Vercel | https://meet-room-delta.vercel.app |
| Backend | Render | https://meetroom-backend-85ql.onrender.com |
| Banco de dados | Render (PostgreSQL) | — |

O usuário admin padrão já é criado automaticamente via migration de seed na primeira inicialização:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@meetroom.com` |
| Senha | `12345678` |

### Render (backend + banco)

1. Crie um **PostgreSQL** no Render — copie a `Internal Database URL`
2. Crie um **Web Service** com as configurações:
   - Root Directory: `backend`
   - Build Command: `npm install -g pnpm && pnpm install && pnpm build`
   - Start Command: `node dist/main`
3. Adicione as variáveis de ambiente:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | URL interna do PostgreSQL |
| `JWT_SECRET` | string longa e aleatória |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL do projeto na Vercel |

As migrations rodam automaticamente no startup em produção.

### Vercel (frontend)

1. Importe o repositório na Vercel
2. Defina o **Root Directory** como `frontend`
3. Adicione a variável de ambiente:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL do Web Service no Render |
