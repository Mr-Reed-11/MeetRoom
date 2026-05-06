# MeetRoom — Sistema de Reserva de Sala de Reuniões

Projeto acadêmico para a disciplina de Desenvolvimento Web — Pós-graduação Lato Sensu em Desenvolvimento de Sistemas Computacionais, IFTO Campus Araguatins.

## Equipe

- **Francisco Jorge Pires** — Gerente de projeto (requisitos, planejamento)
- **Vitor Cesar Gonçalves Ornelas** — Desenvolvedor full stack (frontend + backend + APIs)
- **Ananda Máyra Afonso Ferreira** — Administradora de banco de dados
- **Aline Ribeiro Alves** — Analista de QA

---

## Stack

| Camada     | Tecnologia                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router v7 |
| Backend    | NestJS, TypeScript                                      |
| Banco      | PostgreSQL                                              |
| Auth       | JWT (Bearer token) + bcrypt                             |
| Hospedagem | Vercel (frontend) · Render (backend + banco)            |

---

## Estrutura do monorepo

```
Projeto Desenvolvimento WEB/
├── frontend/   — React app (Vite)
└── backend/    — NestJS API
```

---

## Frontend (`frontend/`)

### Comandos

```bash
pnpm dev        # dev server em localhost:5173
pnpm build      # build de produção
```

### Variáveis de ambiente

| Variável       | Padrão                  | Descrição          |
|----------------|-------------------------|--------------------|
| `VITE_API_URL` | `http://localhost:3000` | URL base da API    |

### Estrutura de arquivos

```
src/
├── types/index.ts                  — interfaces TypeScript (User, Room, Booking, etc.)
├── services/api.ts                 — cliente HTTP com Bearer token automático
├── contexts/AuthContext.tsx        — estado de autenticação global (login/logout/isAdmin)
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           — shell com Sidebar + Header + <Outlet>
│   │   ├── Sidebar.tsx             — navegação lateral (itens de admin condicionais)
│   │   └── Header.tsx              — cabeçalho com avatar e nome do usuário
│   └── ui/
│       ├── Modal.tsx               — modal reutilizável
│       └── Badge.tsx               — badge colorido (green/red/blue/slate/yellow)
└── pages/
    ├── LoginPage.tsx               — tela de login com JWT
    ├── DashboardPage.tsx           — calendário mensal + reservas do dia selecionado
    ├── BookingForm.tsx             — formulário de criação/edição de reserva
    ├── BookingsPage.tsx            — tabela de reservas com edição e cancelamento
    ├── RoomsPage.tsx               — cards de salas com CRUD (criação/edição só para admin)
    ├── UsersPage.tsx               — tabela de usuários com CRUD (somente admin)
    ├── ReportsPage.tsx             — cards de estatísticas + gráfico de uso por sala
    └── SettingsPage.tsx            — edição de perfil e troca de senha
```

### Roteamento e proteção

- `RequireAuth` — redireciona para `/login` se não autenticado
- `RequireAdmin` — redireciona para `/dashboard` se não for admin
- Rotas admin: `/users`, `/reports`
- Token JWT e dados do usuário persistidos no `localStorage`

### Tipos principais

```ts
type Role = 'admin' | 'user';

interface User { id, name, email, role, created_at, updated_at }
interface Room { id, name, capacity, location, description, is_active, created_at }
interface Booking { id, user_id, room_id, title, start_time, end_time, status, notes, created_at }
type BookingStatus = 'active' | 'cancelled';
```

---

## Backend (`backend/`)

### Status atual

Projeto NestJS gerado com CLI, ainda sem módulos de negócio implementados. Apenas estrutura padrão (`AppModule`, `AppController`, `AppService`).

### Comandos

```bash
pnpm start:dev   # dev server em localhost:3000 (watch mode)
pnpm build       # build de produção
pnpm test        # testes unitários
```

### Módulos planejados (a implementar)

| Módulo           | Prefixo de rota    |
|------------------|--------------------|
| `AuthModule`     | `/auth`            |
| `UsersModule`    | `/users`           |
| `RoomsModule`    | `/rooms`           |
| `BookingsModule` | `/bookings`        |
| `ReportsModule`  | `/reports`         |

### Endpoints esperados pelo frontend

```
POST   /auth/login                  — login, retorna { access_token, user }
POST   /auth/logout

GET    /users                       — listar (admin)
GET    /users/:id
POST   /users                       — criar
PATCH  /users/:id
DELETE /users/:id                   — remover (admin)

GET    /rooms                       — listar todas
GET    /rooms/:id
POST   /rooms                       — cadastrar (admin)
PATCH  /rooms/:id
DELETE /rooms/:id                   — remover (admin)

GET    /bookings                    — reservas do usuário autenticado
GET    /bookings/:id
POST   /bookings
PATCH  /bookings/:id
DELETE /bookings/:id                — cancela (muda status para 'cancelled')

GET    /reports/bookings            — todas as reservas (admin)
GET    /reports/rooms/usage         — taxa de utilização por sala
```

### Modelo do banco de dados

```
users        — id (UUID PK), name, email, password_hash, role (admin|user), created_at, updated_at
rooms        — id (UUID PK), name, capacity, location, description, is_active, created_at
bookings     — id (UUID PK), user_id (FK), room_id (FK), title, start_time, end_time,
               status (active|cancelled), notes, created_at
```

### Segurança

- Senhas com `bcrypt`
- JWT assinado com chave secreta
- Guard do NestJS valida token em rotas protegidas
- Autorização baseada em `role` (admin vs user)
