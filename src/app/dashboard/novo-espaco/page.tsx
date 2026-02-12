'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

type Step = 'modulo' | 'basico' | 'detalhes' | 'fotos';

export default function NewSpaceWizard() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState<Step>('modulo');
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        module: 'hospedagem',
        title: '',
        property_type: 'apartamento',
        city: 'Fortaleza',
        state: 'CE',
        neighborhood: '',
        price: '',
        description: '',
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        instant_booking: false,
        check_in_time: '14:00',
        check_out_time: '11:00',
        min_nights: 1,
    });

    useEffect(() => {
        async function getTenant() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('user_id', user.id)
                    .single();
                setTenantId(profile?.tenant_id);
            }
        }
        getTenant();
    }, []);

    const handleNext = async () => {
        if (step === 'modulo') setStep('basico');
        else if (step === 'basico') setStep('detalhes');
        else if (step === 'detalhes') setStep('fotos');
        else {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!tenantId) {
            alert('Erro: Tenant não identificado. Recarregue a página.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('spaces')
                .insert({
                    tenant_id: tenantId,
                    module: formData.module,
                    title: formData.title,
                    description: formData.description,
                    property_type: formData.property_type,
                    city: formData.city,
                    state: formData.state,
                    neighborhood: formData.neighborhood,
                    price: Number(formData.price),
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    max_guests: formData.max_guests,
                    check_in_time: formData.check_in_time,
                    check_out_time: formData.check_out_time,
                    min_nights: formData.min_nights,
                    instant_booking: formData.instant_booking,
                    status: 'ativo' // Publicado imediatamente para este exemplo
                });

            if (error) throw error;

            router.push('/dashboard/espacos');
        } catch (err: any) {
            console.error('Erro ao salvar anúncio:', err);
            alert(`Erro: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'basico') setStep('modulo');
        else if (step === 'detalhes') setStep('basico');
        else if (step === 'fotos') setStep('detalhes');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Criar novo anúncio</h1>
                <div className={styles.progress}>
                    <div className={`${styles.step} ${['modulo', 'basico', 'detalhes', 'fotos'].includes(step) ? styles.activeStep : ''}`}>1</div>
                    <div className={styles.line} />
                    <div className={`${styles.step} ${['basico', 'detalhes', 'fotos'].includes(step) ? styles.activeStep : ''}`}>2</div>
                    <div className={styles.line} />
                    <div className={`${styles.step} ${['detalhes', 'fotos'].includes(step) ? styles.activeStep : ''}`}>3</div>
                    <div className={styles.line} />
                    <div className={`${styles.step} ${step === 'fotos' ? styles.activeStep : ''}`}>4</div>
                </div>
            </header>

            <div className={styles.content}>
                {step === 'modulo' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>O que você quer anunciar?</h2>
                        <div className={styles.moduleGrid}>
                            <button
                                className={`${styles.moduleCard} ${formData.module === 'hospedagem' ? styles.selectedModule : ''}`}
                                onClick={() => setFormData({ ...formData, module: 'hospedagem' })}
                            >
                                <div className={styles.icon}>🏨</div>
                                <h3>Hospedagem</h3>
                                <p>Receba hóspedes por dias ou temporadas</p>
                            </button>
                            <button
                                className={`${styles.moduleCard} ${formData.module === 'alugueis' ? styles.selectedModule : ''}`}
                                onClick={() => setFormData({ ...formData, module: 'alugueis' })}
                            >
                                <div className={styles.icon}>🏠</div>
                                <h3>Aluguel</h3>
                                <p>Alugue seu imóvel mensal ou anualmente</p>
                            </button>
                            <button
                                className={`${styles.moduleCard} ${formData.module === 'vendas' ? styles.selectedModule : ''}`}
                                onClick={() => setFormData({ ...formData, module: 'vendas' })}
                            >
                                <div className={styles.icon}>🏡</div>
                                <h3>Venda</h3>
                                <p>Venda seu imóvel para compradores</p>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'basico' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Informações básicas</h2>

                        <div className={styles.formGroup}>
                            <label>Título do anúncio</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Ex: Apartamento aconchegante vista mar"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Tipo de imóvel</label>
                                <select
                                    className={styles.input}
                                    value={formData.property_type}
                                    onChange={e => setFormData({ ...formData, property_type: e.target.value })}
                                >
                                    <option value="apartamento">Apartamento</option>
                                    <option value="casa">Casa</option>
                                    <option value="quarto">Quarto</option>
                                    <option value="flat">Flat</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Bairro</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Ex: Meireles"
                                    value={formData.neighborhood}
                                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Quartos</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.bedrooms}
                                    onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Hóspedes Max</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.max_guests}
                                    onChange={e => setFormData({ ...formData, max_guests: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 'detalhes' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Detalhes e Valores</h2>

                        <div className={styles.formGroup}>
                            <label>Descrição completa</label>
                            <textarea
                                className={styles.textarea}
                                rows={5}
                                placeholder="Descreva o que seu espaço tem de melhor..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Preço {formData.module === 'hospedagem' ? '(por noite)' : formData.module === 'vendas' ? '(total)' : '(por mês)'}</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    placeholder="R$ 0,00"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Check-in</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.check_in_time}
                                    onChange={e => setFormData({ ...formData, check_in_time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 'fotos' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Fotos do espaço</h2>
                        <div className={styles.uploadArea}>
                            <div className={styles.uploadPlaceholder}>
                                <span>📸</span>
                                <p>Para este MVP, as fotos serão adicionadas via painel de edição após a criação.</p>
                                <p style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>Estamos configurando o storage do Supabase.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className={styles.footer}>
                <button
                    className={styles.backBtn}
                    onClick={handleBack}
                    disabled={step === 'modulo' || loading}
                >
                    Voltar
                </button>
                <button
                    className={styles.nextBtn}
                    onClick={handleNext}
                    disabled={loading || (step === 'modulo' && !formData.module)}
                >
                    {loading ? 'Processando...' : step === 'fotos' ? 'Publicar Anúncio' : 'Continuar'}
                </button>
            </footer>
        </div>
    );
}
