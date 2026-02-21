import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Chave com permissões de service_role
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTestUsers() {
  console.log('Iniciando criação de usuários de teste...');

  // 1. Super Admin
  const superAdminData = {
    email: 'admin@espacoz.com.br',
    password: 'Senha@123',
    userData: {
      full_name: 'Administrador do Sistema',
      role: 'admin' as const,
    }
  };

  // 2. Usuário de Hospedagem (Anunciante)
  const hospedagemUserData = {
    email: 'hospedagem@espacoz.com.br',
    password: 'Senha@123',
    userData: {
      full_name: 'João Silva - Anunciante de Hospedagem',
      role: 'anunciante' as const,
    },
    tenantData: {
      name: 'Hotéis & Pousadas Silva',
      slug: 'silva-hospedagem',
      email: 'joao.silva.hospedagem@espacoz.com.br',
      phone: '(85) 99999-8888',
      description: 'Hotéis e pousadas de qualidade na região de Fortaleza.',
      subscription_plan: 'plano_5' as const,
    }
  };

  // 3. Usuário de Venda de Imóveis (Anunciante)
  const vendaUserData = {
    email: 'venda@espacoz.com.br',
    password: 'Senha@123',
    userData: {
      full_name: 'Maria Oliveira - Anunciante de Vendas',
      role: 'anunciante' as const,
    },
    tenantData: {
      name: 'Imobiliária Oliveira',
      slug: 'oliveira-venda',
      email: 'maria.oliveira.venda@espacoz.com.br',
      phone: '(85) 97777-6666',
      description: 'Imóveis à venda com garantia de qualidade e confiança.',
      subscription_plan: 'plano_5' as const,
    }
  };

  // 4. Usuário de Aluguel de Imóveis (Anunciante)
  const aluguelUserData = {
    email: 'aluguel@espacoz.com.br',
    password: 'Senha@123',
    userData: {
      full_name: 'Carlos Santos - Anunciante de Aluguéis',
      role: 'anunciante' as const,
    },
    tenantData: {
      name: 'Aluga Aqui Imóveis',
      slug: 'santos-aluguel',
      email: 'carlos.santos.aluguel@espacoz.com.br',
      phone: '(85) 95555-4444',
      description: 'Apartamentos e casas para aluguel residencial e comercial.',
      subscription_plan: 'plano_5' as const,
    }
  };

  // 5. Usuário final (Cliente)
  const usuarioFinalData = {
    email: 'cliente@espacoz.com.br',
    password: 'Senha@123',
    userData: {
      full_name: 'Ana Costa - Cliente',
      role: 'usuario' as const,
    }
  };

  const usersToCreate = [
    superAdminData,
    hospedagemUserData,
    vendaUserData,
    aluguelUserData,
    usuarioFinalData
  ];

  for (const userData of usersToCreate) {
    try {
      console.log(`Criando usuário: ${userData.userData.full_name}`);

      // Criar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Confirma automaticamente o e-mail
        user_metadata: {
          full_name: userData.userData.full_name
        }
      });

      if (authError) {
        console.error(`Erro ao criar usuário ${userData.userData.full_name}:`, authError);
        continue;
      }

      const userId = authData.user.id;

      // Criar registro correspondente na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          full_name: userData.userData.full_name,
          role: userData.userData.role
        }]);

      if (profileError) {
        console.error(`Erro ao criar perfil para ${userData.userData.full_name}:`, profileError);
        
        // Se falhar, tentar atualizar caso já exista
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: userData.userData.full_name,
            role: userData.userData.role
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error(`Erro ao atualizar perfil para ${userData.userData.full_name}:`, updateError);
        } else {
          console.log(`Perfil atualizado para: ${userData.userData.full_name}`);
        }
      } else {
        console.log(`Usuário criado com sucesso: ${userData.userData.full_name}`);
      }

      // Se for um anunciante, criar também o tenant
      const tenantData = (userData as any).tenantData;
      if (tenantData) {
        const { error: tenantError } = await supabase
          .from('tenants')
          .insert([{
            user_id: userId,
            name: tenantData.name,
            slug: tenantData.slug,
            email: tenantData.email,
            phone: tenantData.phone,
            description: tenantData.description,
            subscription_plan: tenantData.subscription_plan,
          }]);

        if (tenantError) {
          console.error(`Erro ao criar tenant para ${userData.userData.full_name}:`, tenantError);
          
          // Tentar atualizar caso já exista
          const { error: updateTenantError } = await supabase
            .from('tenants')
            .update({
              name: tenantData.name,
              slug: tenantData.slug,
              email: tenantData.email,
              phone: tenantData.phone,
              description: tenantData.description,
              subscription_plan: tenantData.subscription_plan,
            })
            .eq('user_id', userId);

          if (updateTenantError) {
            console.error(`Erro ao atualizar tenant para ${userData.userData.full_name}:`, updateTenantError);
          } else {
            console.log(`Tenant atualizado para: ${userData.userData.full_name}`);
          }
        } else {
          console.log(`Tenant criado com sucesso para: ${userData.userData.full_name}`);
        }
      }
    } catch (error) {
      console.error(`Erro geral ao criar usuário ${userData.userData.full_name}:`, error);
    }
  }

  console.log('Criação de usuários de teste concluída!');
}

// Executar a função
createTestUsers()
  .then(() => {
    console.log('Script de seed concluído com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao executar o script de seed:', error);
    process.exit(1);
  });