# Configuração do Banco de Dados - Espaço Z

Para configurar o banco de dados Supabase necessário para rodar o projeto, siga os passos abaixo:

## 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Anote a **Project URL** e a **API Key (anon/public)**.

## 2. Configurar Variáveis de Ambiente
Renomeie o arquivo `.env.local.example` para `.env.local` e preencha as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

## 3. Rodar o Script SQL
O arquivo com a estrutura completa do banco de dados está em:
`supabase/schema.sql`

Para aplicar:
1. No painel do Supabase, vá em **SQL Editor**.
2. Cole todo o conteúdo do arquivo `supabase/schema.sql`.
3. Clique em **Run**.

Isso irá criar:
- 12 Tabelas (tenants, spaces, bookings, users, etc.)
- Políticas de Segurança (Row Level Security - RLS)
- Triggers automáticos para atualização e estatísticas.

## 4. Dados Iniciais (Opcional)
Para popular o banco com alguns dados de teste, você pode criar uma função SQL ou inserir manualmente na tabela `spaces` e `tenants`.

---

## Estrutura do Projeto

- **Frontend**: Next.js 15 (App Router) + React 18
- **Estilização**: CSS Modules (zero config, performance nativa)
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (para fotos)

## Comandos Úteis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria a build de produção.
- `npm run start`: Inicia o servidor de produção.
- `npm run seed:test-users`: Cria usuários de teste no sistema (requer SUPABASE_SERVICE_ROLE_KEY).

## Usuários de Teste

Para criar usuários de teste no sistema, execute:

```bash
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role" npm run seed:test-users
```

OBS: A chave de service role pode ser encontrada no painel do Supabase em Project Settings > API.

### Credenciais de Usuários de Teste

Após executar o script de seed, os seguintes usuários estarão disponíveis:

1. **Super Admin**
   - Email: `admin@espacoz.com.br`
   - Senha: `Senha@123`
   - Tipo: Administrador do sistema

2. **Anunciante de Hospedagem**
   - Email: `hospedagem@espacoz.com.br`
   - Senha: `Senha@123`
   - Empresa: "Hotéis & Pousadas Silva"
   - Tipo: Anunciante (oferece hospedagem)

3. **Anunciante de Venda de Imóveis**
   - Email: `venda@espacoz.com.br`
   - Senha: `Senha@123`
   - Empresa: "Imobiliária Oliveira"
   - Tipo: Anunciante (vende imóveis)

4. **Anunciante de Aluguel de Imóveis**
   - Email: `aluguel@espacoz.com.br`
   - Senha: `Senha@123`
   - Empresa: "Aluga Aqui Imóveis"
   - Tipo: Anunciante (oferta imóveis para alugar)

5. **Usuário Final (Cliente)**
   - Email: `cliente@espacoz.com.br`
   - Senha: `Senha@123`
   - Tipo: Usuário comum (cliente que busca serviços)
