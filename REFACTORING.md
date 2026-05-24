# Refatoração e Otimização — MeetRoom

Documento que registra as mudanças realizadas na etapa de refatoração e otimização do projeto MeetRoom.

---

## 1. Controle de Versão

### Remoção do repositório Git aninhado
O diretório `backend/` havia sido inicializado como um repositório Git separado pelo NestJS CLI (`nest new` executa `git init` por padrão). Isso impedia que o monorepo rastreasse os arquivos do backend corretamente. O `.git` interno foi removido para unificar o controle de versão em um único repositório.

### Configuração do `.gitignore`
- Adicionadas regras para `.env` e `.env.*` no `frontend/.gitignore`, mantendo apenas o `.env.example` rastreado
- Criado `frontend/.env.example` como referência das variáveis de ambiente necessárias

---

## 2. Banco de Dados — Migrations

### Substituição do `synchronize` por migrations controladas
O projeto utilizava `synchronize: true` do TypeORM, que recria o esquema automaticamente a cada inicialização. Essa abordagem é inadequada para ambientes de produção pois pode causar perda de dados. A solução adotada foi:

- Criado `backend/src/data-source.ts` com a configuração do `DataSource` para uso pelo CLI do TypeORM
- Criado `backend/src/migrations/1746489600000-InitialSchema.ts` com a migration inicial, criando as tabelas `users`, `rooms` e `bookings` com seus respectivos tipos enumerados
- Criado `backend/src/migrations/1746489600001-SeedAdmin.ts` com o seed do usuário administrador padrão
- Configurado `migrationsRun: true` em produção no `AppModule`, para que as migrations sejam executadas automaticamente no startup
- Adicionados scripts ao `package.json`: `migration:generate`, `migration:run`, `migration:revert` e `migration:fresh`

---

## 3. API — Visibilidade de Reservas no Dashboard

### Novo endpoint `GET /bookings/all`
O endpoint `GET /bookings` retornava apenas as reservas do usuário autenticado. No dashboard, isso impedia que qualquer usuário visualizasse os horários já ocupados por outros usuários, tornando impossível verificar a disponibilidade de uma sala.

Foi adicionado o endpoint `GET /bookings/all` no `BookingsController`, acessível por qualquer usuário autenticado, que retorna todas as reservas do sistema. O dashboard passou a consumir esse endpoint para exibir todos os agendamentos do dia selecionado.

---

## 4. Frontend — Roteamento SPA

### Correção do erro 404 ao recarregar páginas
Aplicações React com React Router são SPAs (Single Page Applications): todas as rotas são gerenciadas pelo JavaScript no navegador. Ao recarregar uma página diretamente pela URL (ex: `/dashboard`), o servidor tentava encontrar um arquivo correspondente e retornava erro 404.

Foi criado o arquivo `frontend/vercel.json` com a seguinte configuração de rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Isso instrui a Vercel a redirecionar todas as requisições para o `index.html`, permitindo que o React Router assuma o controle do roteamento.

---

## 5. Deploy

### Configuração do ambiente de produção
- **Render**: provisionamento do banco PostgreSQL e Web Service para o backend NestJS
- **Vercel**: deploy do frontend React com variável de ambiente `VITE_API_URL` apontando para o backend
- Configuradas as variáveis de ambiente necessárias em ambas as plataformas (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `FRONTEND_URL`, `VITE_API_URL`)

### Suporte à variável `RESET_DB`
Adicionado suporte à variável de ambiente `RESET_DB=true` no `AppModule`, que aciona o `dropSchema` do TypeORM para limpar e recriar o banco de dados sem necessidade de acesso direto ao servidor. Útil para resetar o ambiente de produção durante o desenvolvimento.

---

## Resumo das alterações por arquivo

| Arquivo | Tipo de alteração |
|---------|------------------|
| `backend/src/app.module.ts` | Adicionado `migrationsRun`, `dropSchema` e `migrations` na config do TypeORM |
| `backend/src/data-source.ts` | Criado — DataSource para o CLI do TypeORM |
| `backend/src/migrations/1746489600000-InitialSchema.ts` | Criado — migration inicial do banco |
| `backend/src/migrations/1746489600001-SeedAdmin.ts` | Criado — seed do usuário administrador |
| `backend/src/bookings/bookings.controller.ts` | Adicionado endpoint `GET /bookings/all` |
| `backend/package.json` | Adicionados scripts de migration |
| `frontend/src/pages/DashboardPage.tsx` | Atualizado para consumir `/bookings/all` |
| `frontend/vercel.json` | Criado — correção do roteamento SPA |
| `frontend/.gitignore` | Adicionadas regras para arquivos `.env` |
| `frontend/.env.example` | Criado — referência de variáveis de ambiente |
