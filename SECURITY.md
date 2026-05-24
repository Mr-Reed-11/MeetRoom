# Inspeção de Segurança — MeetRoom

Documento que registra as vulnerabilidades identificadas durante a inspeção do projeto com foco em cibersegurança.

---

## Vulnerabilidade 1 — Escalada de privilégios no cadastro de usuário

**Severidade:** Crítica  
**Arquivo:** `backend/src/users/users.controller.ts`

O endpoint `POST /users` está marcado como `@Public()`, ou seja, não exige autenticação. Além disso, o DTO aceita o campo `role` com o valor `'admin'`. Isso permite que qualquer pessoa, sem estar logada, crie uma conta com perfil de administrador, obtendo acesso total ao sistema.

**Evidência:**
```ts
@Post()
@Public()
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```
```ts
@IsOptional()
@IsIn(['admin', 'user'])
role?: 'admin' | 'user';
```

**Correção recomendada:** Remover o `@Public()` do endpoint de criação de usuários e garantir que somente administradores autenticados possam definir `role: 'admin'`.

---

## Vulnerabilidade 2 — Ausência de rate limiting no endpoint de login

**Severidade:** Alta  
**Arquivo:** `backend/src/auth/auth.controller.ts`

O endpoint `POST /auth/login` não possui nenhum mecanismo de limitação de requisições. Isso permite ataques de força bruta, onde um atacante pode testar combinações de senha indefinidamente sem ser bloqueado.

**Correção recomendada:** Implementar rate limiting com o pacote `@nestjs/throttler`, limitando tentativas de login por IP.

---

## Vulnerabilidade 3 — Ausência de headers de segurança HTTP

**Severidade:** Alta  
**Arquivo:** `backend/src/main.ts`

A aplicação não utiliza o middleware `helmet`, que é responsável por definir headers de segurança HTTP como `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy` e `Strict-Transport-Security`. A ausência desses headers expõe a aplicação a ataques como clickjacking e injeção de conteúdo.

**Correção recomendada:** Instalar e configurar `@nestjs/helmet` no `main.ts`:
```ts
import helmet from 'helmet';
app.use(helmet());
```

---

## Vulnerabilidade 4 — Token JWT sem mecanismo de revogação

**Severidade:** Média  
**Arquivo:** `backend/src/auth/auth.controller.ts`

O endpoint `POST /auth/logout` não realiza nenhuma ação no servidor — apenas retorna `204 No Content`. O token JWT continua válido até o seu vencimento (7 dias), mesmo após o logout. Se um token for comprometido, não há como invalidá-lo.

**Evidência:**
```ts
@Post('logout')
@Public()
@HttpCode(HttpStatus.NO_CONTENT)
logout() {
  return; // nenhuma ação
}
```

**Correção recomendada:** Implementar uma blocklist de tokens no servidor (em memória ou Redis) e verificar essa lista no `JwtAuthGuard`.

---

## Vulnerabilidade 5 — Edição de perfil sem verificação de propriedade

**Severidade:** Média  
**Arquivo:** `backend/src/users/users.controller.ts`

O endpoint `PATCH /users/:id` exige apenas autenticação, sem verificar se o usuário autenticado é o dono do recurso. Qualquer usuário logado pode alterar os dados de qualquer outro usuário informando um UUID diferente do seu.

**Evidência:**
```ts
@Patch(':id')
update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
  return this.usersService.update(id, dto);
}
```

**Correção recomendada:** Verificar que `id === user.sub` ou que `user.role === 'admin'` antes de permitir a atualização.

---

## Vulnerabilidade 6 — Exposição de dados de outros usuários

**Severidade:** Média  
**Arquivo:** `backend/src/users/users.controller.ts`

O endpoint `GET /users/:id` não possui restrição de acesso além da autenticação. Qualquer usuário autenticado pode consultar os dados de qualquer outro usuário do sistema, incluindo nome, e-mail e perfil, desde que conheça ou adivinhe o UUID.

**Correção recomendada:** Restringir o acesso para que um usuário comum só consiga consultar seus próprios dados, reservando a listagem geral para administradores.

---

## Vulnerabilidade 7 — Política de senhas insuficiente

**Severidade:** Baixa  
**Arquivo:** `backend/src/users/dto/create-user.dto.ts`

A validação de senha exige apenas comprimento mínimo de 6 caracteres, sem requisitos de complexidade (letras maiúsculas, números, caracteres especiais). Isso facilita o uso de senhas fracas e ataques de dicionário.

**Evidência:**
```ts
@IsString()
@MinLength(6)
password: string;
```

**Correção recomendada:** Adicionar validação com `@Matches()` exigindo ao menos uma letra maiúscula, um número e comprimento mínimo de 8 caracteres.

---

## Vulnerabilidade 8 — Credenciais fracas no ambiente de desenvolvimento

**Severidade:** Baixa  
**Arquivo:** `docker-compose.yml`

O `docker-compose.yml` contém um `JWT_SECRET` com valor previsível (`dev-secret-troque-em-producao`) e credenciais do banco de dados idênticas ao nome do serviço (`meetroom:meetroom`). Caso esse arquivo seja usado inadvertidamente em produção, a segurança do sistema é comprometida.

**Correção recomendada:** Utilizar variáveis de ambiente ou um arquivo `.env` separado (não versionado) para as credenciais do ambiente de desenvolvimento.

---

## Vulnerabilidade 9 — Race condition na verificação de conflito de reservas

**Severidade:** Baixa  
**Arquivo:** `backend/src/bookings/bookings.service.ts`

A verificação de conflito de horário e o salvamento da reserva são operações separadas, sem uso de transação com bloqueio (`SELECT FOR UPDATE`). Em cenários de alta concorrência, duas requisições simultâneas podem passar pela verificação ao mesmo tempo e gerar reservas conflitantes para a mesma sala e horário.

**Correção recomendada:** Envolver a verificação e o insert em uma transação com isolamento adequado (`SERIALIZABLE` ou `REPEATABLE READ`).

---

## Resumo

| # | Vulnerabilidade | Severidade |
|---|----------------|-----------|
| 1 | Escalada de privilégios no cadastro de usuário | Crítica |
| 2 | Ausência de rate limiting no login | Alta |
| 3 | Ausência de headers de segurança HTTP | Alta |
| 4 | Token JWT sem mecanismo de revogação | Média |
| 5 | Edição de perfil sem verificação de propriedade | Média |
| 6 | Exposição de dados de outros usuários | Média |
| 7 | Política de senhas insuficiente | Baixa |
| 8 | Credenciais fracas no ambiente de desenvolvimento | Baixa |
| 9 | Race condition na verificação de conflito de reservas | Baixa |
