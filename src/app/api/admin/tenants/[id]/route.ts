import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verificar se o usuário é super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isSuperAdminEmail = user.email === 'zeroumbit@gmail.com';

    if (!profile || (profile.role !== 'admin' && !isSuperAdminEmail)) {
      return Response.json(
        { error: 'Acesso negado - permissões insuficientes' },
        { status: 403 }
      );
    }

    // Obter o tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (tenantError || !tenant) {
      return Response.json(
        { error: 'Anunciante não encontrado' },
        { status: 404 }
      );
    }

    // Alternar o status de ativo/inativo
    const { data: updatedTenant, error: updateError } = await supabase
      .from('tenants')
      .update({ is_active: !tenant.is_active })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar tenant:', updateError);
      return Response.json(
        { error: 'Erro ao atualizar status do anunciante' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      tenant: updatedTenant,
      message: updatedTenant.is_active
        ? 'Anunciante ativado com sucesso'
        : 'Anunciante suspenso com sucesso'
    });
  } catch (error) {
    console.error('Erro na requisição de atualização de tenant:', error);
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}