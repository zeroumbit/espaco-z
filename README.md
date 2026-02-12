# Espaço Z - Plataforma de Anúncios Imobiliários

Bem-vindo ao Espaço Z, uma plataforma digital multitenant para anúncios de hospedagem, aluguéis e vendas de imóveis no Ceará.

## Visão Geral

O Espaço Z é uma plataforma completa que permite:

- **Hospedagem**: Anúncios de hotéis, pousadas, casas e apartamentos para temporada
- **Aluguéis**: Imóveis para aluguel residencial e comercial (mensal, semanal, anual)
- **Vendas**: Imóveis à venda (casas, apartamentos, terrenos, etc.)

## Tecnologias

- **Frontend**: Next.js 15 (App Router) + React 18
- **Estilização**: CSS Modules
- **Database**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage

## Configuração Inicial

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (veja `.env.local.example`)
4. Execute o projeto: `npm run dev`

## Usuários de Teste

O sistema inclui um script para criar usuários de teste. Para executar:

```bash
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role" npm run seed:test-users
```

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

## Documentação do Banco de Dados

Para informações detalhadas sobre a estrutura do banco de dados, consulte [README.DB.md](README.DB.md).

## Desenvolvimento

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run seed:test-users`: Cria usuários de teste no sistema