# Roadmap de Desenvolvimento - Espaço Z

Este documento descreve o que foi implementado e os próximos passos para colocar a plataforma em produção.

## ✅ Fase 1: Fundação (Concluído)
- [x] Configuração do Next.js 15 + TypeScript + CSS Modules
- [x] Estrutura de pastas organizada (App Router)
- [x] Design System base (variáveis CSS globais, cores, tipografia)
- [x] Layouts responsivos (Desktop/Mobile)
- [x] Schema do Banco de Dados SQL (Supabase)

## ✅ Fase 2: Core Features (Concluído - Mock/UI)
- [x] **Home Page Multimódulo**: Abas para Hospedagem, Aluguéis e Vendas.
- [x] **Busca Inteligente**: Hero Search adaptativo por módulo.
- [x] **Página de Detalhes**: Galeria de fotos, informações do imóvel, anfitrião.
- [x] **Booking/Lead Flow**: Card de reserva (hospedagem) e formulário de interesse (vendas/aluguel).
- [x] **Painel do Anunciante**: Dashboard com métricas e gestão de espaços.
- [x] **Wizard de Criação de Anúncio**: Fluxo de cadastro passo-a-passo.

## 🚀 Fase 3: Integração Backend (Próximos Passos)
1.  **Configurar Supabase**: Criar projeto e rodar `supabase/schema.sql`.
2.  **Autenticação**: Integrar `supabase-auth-helpers` no Login/Cadastro.
3.  **CRUD de Espaços**: Substituir `MOCK_DATA` por chamadas reais `supabase.from('spaces').select()`.
4.  **Upload de Imagens**: Implementar upload real para o Supabase Storage no Wizard.
5.  **RLS Policies**: Testar as regras de segurança (tenant isolation).

## 🛠️ Fase 4: Funcionalidades Avançadas
- [ ] **Pagamentos**: Integrar Mercado Pago para assinaturas de planos e reservas.
- [ ] **Mapa Interativo**: Implementar Google Maps ou Leaflet real na busca.
- [ ] **Chat em Tempo Real**: Usar Supabase Realtime para mensagens entre usuários.
- [ ] **Calendário de Disponibilidade**: Sincronizar datas de bloqueio para hospedagem.

## 📦 Deploy
- Configurar Vercel para deploy contínuo.
- Configurar domínio personalizado (`espacoz.com`).
