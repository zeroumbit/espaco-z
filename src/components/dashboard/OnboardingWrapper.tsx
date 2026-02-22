'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import CompleteAddressModal from './CompleteAddressModal/CompleteAddressModal';

interface OnboardingWrapperProps {
    tenant: {
        id: string;
        address_completed: boolean;
    } | null;
}

export default function OnboardingWrapper({ tenant }: OnboardingWrapperProps) {
    const [showModal, setShowModal] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        async function checkAddressCompleted() {
            if (!tenant) {
                setIsChecking(false);
                return;
            }

            try {
                const supabase = createClient();
                // Buscar dados mais recentes do tenant diretamente do banco
                const { data: freshTenant, error } = await supabase
                    .from('tenants')
                    .select('id, address_completed')
                    .eq('id', tenant.id)
                    .single();

                if (error) {
                    console.error('[OnboardingWrapper] Erro ao buscar tenant:', error);
                    // Fallback: usa o valor passado via props
                    setShowModal(!tenant.address_completed);
                } else {
                    // Usa o valor mais recente do banco
                    setShowModal(!freshTenant.address_completed);
                }
            } catch (err) {
                console.error('[OnboardingWrapper] Erro inesperado:', err);
                setShowModal(false);
            } finally {
                setIsChecking(false);
            }
        }

        checkAddressCompleted();
    }, [tenant]);

    if (isChecking || !showModal || !tenant) return null;

    return (
        <CompleteAddressModal
            tenantId={tenant.id}
            onComplete={() => setShowModal(false)}
        />
    );
}
