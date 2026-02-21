'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    MODULO_CONFIG, TIPOS_IMOVEL, AMENIDADES, TIPOS_CHECKIN,
    GARANTIAS_ALUGUEL, INDICES_REAJUSTE, STATUS_OBRA,
    ESTADOS_CONSERVACAO, formatCentavos, parseToCentavos,
} from '@/lib/listings-constants';
import { CEARA_CITIES, BRAZILIAN_STATES } from '@/lib/constants';
import type { TipoModulo, WizardStep, PropertyFormData, ListingFormData } from '@/types/listings';
import { WIZARD_STEPS } from '@/types/listings';
import { ListingService } from '@/lib/supabase/services';
import styles from './page.module.css';

// ---- Initial States ----
const initialProperty: PropertyFormData = {
    titulo: '', descricao: '', tipo_imovel: 'apartamento', subtipo_imovel: '',
    area_total: '', area_privativa: '', area_terreno: '',
    quartos: 2, suites: 0, banheiros_sociais: 1, salas: 1, vagas_garagem: 1,
    ano_construcao: '', estado_conservacao: 'bom',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: 'Fortaleza', estado: 'CE',
    amenities: [],
};

const initialListing: ListingFormData = {
    modulo: 'hospedagem', preco_base: '', exclusividade: false,
    // Hospedagem
    capacidade_maxima: 4, camas_casal: 1, camas_solteiro: 0,
    tipo_checkin: 'flexivel', preco_fim_semana: '', taxa_limpeza: '',
    desconto_semanal: '', desconto_mensal: '', minimo_noites: 1, maximo_noites: '',
    // Aluguel
    valor_condominio: '', valor_iptu: '', valor_caucao: '',
    garantias_aceitas: [], indice_reajuste: 'IGPM', prazo_minimo_contrato: '12',
    // Venda
    aceita_financiamento: false, aceita_permuta: false, fgts: false,
    entrada_minima_percentual: '', status_obra: 'pronto', construtora: '', incorporadora: '',
};

export default function NewSpaceWizard() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState<WizardStep>('modulo');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orgId, setOrgId] = useState<string | null>(null);
    const [userModule, setUserModule] = useState<TipoModulo | null>(null);

    const [property, setProperty] = useState<PropertyFormData>(initialProperty);
    const [listing, setListing] = useState<ListingFormData>(initialListing);

    // Carrega dados do usuário
    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Tenta buscar do novo schema (organizations via users)
            // Fallback para schema antigo (profiles/tenants)
            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id, tenants(main_module)')
                .eq('user_id', user.id)
                .single();

            if (profile?.tenant_id) {
                setOrgId(profile.tenant_id);
                const tenantModule = (profile as any)?.tenants?.main_module;
                if (tenantModule) {
                    const mapped: Record<string, TipoModulo> = {
                        'hospedagem': 'hospedagem',
                        'alugueis': 'aluguel',
                        'vendas': 'venda',
                    };
                    const mod = mapped[tenantModule] || tenantModule;
                    setUserModule(mod as TipoModulo);
                    setListing(prev => ({ ...prev, modulo: mod as TipoModulo }));
                }
            }
        }
        loadUser();
    }, []);

    const modulo = listing.modulo;
    const config = MODULO_CONFIG[modulo];

    // ---- Step Navigation ----
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === step);

    const goNext = () => {
        const nextIdx = stepIndex + 1;
        if (nextIdx < WIZARD_STEPS.length) {
            setStep(WIZARD_STEPS[nextIdx].id);
        }
    };

    const goBack = () => {
        const prevIdx = stepIndex - 1;
        if (prevIdx >= 0) {
            setStep(WIZARD_STEPS[prevIdx].id);
        }
    };

    const canGoNext = (): boolean => {
        switch (step) {
            case 'modulo': return !!listing.modulo;
            case 'imovel': return !!property.titulo && !!property.tipo_imovel;
            case 'endereco': return !!property.cidade && !!property.estado && !!property.bairro;
            case 'detalhes': return true;
            case 'valores': return !!listing.preco_base;
            case 'fotos': return true;
            case 'revisao': return true;
            default: return false;
        }
    };

    // ---- Submit ----
    const handlePublish = async () => {
        if (!orgId) {
            setError('Organização não identificada. Recarregue a página.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            await ListingService.createFullListing(
                orgId,
                user.id,
                property,
                listing
            );

            console.log('[NovoEspaco] Criado com sucesso (V3)');
            router.push('/dashboard/espacos');

        } catch (err: any) {
            console.error('[NovoEspaco] Erro:', err);
            setError(err.message || 'Erro ao criar o anúncio.');
        } finally {
            setLoading(false);
        }
    };

    // ---- Counter Helper ----
    const Counter = ({ value, onChange, min = 0, max = 99 }: {
        value: number; onChange: (v: number) => void; min?: number; max?: number;
    }) => (
        <div className={styles.counter}>
            <button type="button" className={styles.counterBtn}
                onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
            <span className={styles.counterValue}>{value}</span>
            <button type="button" className={styles.counterBtn}
                onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
        </div>
    );

    // ---- Toggle Helper ----
    const Toggle = ({ checked, onChange, label }: {
        checked: boolean; onChange: (v: boolean) => void; label: string;
    }) => (
        <button type="button"
            className={`${styles.toggle} ${checked ? styles.active : ''}`}
            onClick={() => onChange(!checked)}
        >
            <span className={styles.toggleCheck}>{checked ? '✓' : ''}</span>
            <span className={styles.toggleLabel}>{label}</span>
        </button>
    );

    return (
        <div className={styles.container}>
            {/* Header + Progress */}
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <h1 className={styles.title}>Criar novo anúncio</h1>
                    {step !== 'modulo' && (
                        <span className={styles.moduloBadge}
                            style={{ background: config.lightColor, color: config.color }}>
                            {config.icon} {config.label}
                        </span>
                    )}
                </div>

                <div className={styles.progress}>
                    {WIZARD_STEPS.map((s, i) => (
                        <div key={s.id} style={{ display: 'contents' }}>
                            {i > 0 && (
                                <div className={`${styles.progressLine} ${i <= stepIndex ? styles.progressLineDone : ''}`} />
                            )}
                            <div className={`${styles.progressStep} ${s.id === step ? styles.progressStepActive : ''} ${i < stepIndex ? styles.progressStepDone : ''}`}>
                                <span>{i < stepIndex ? '✓' : s.icon}</span>
                                <span>{s.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </header>

            {/* Content */}
            <div className={styles.content} key={step}>
                {error && (
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)',
                        background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-sm)', fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                {/* ===== STEP 1: MÓDULO ===== */}
                {step === 'modulo' && (
                    <>
                        <h2 className={styles.stepTitle}>O que você quer anunciar?</h2>
                        <p className={styles.stepSubtitle}>
                            {userModule
                                ? `Seu perfil é de ${MODULO_CONFIG[userModule].label}. Escolha o tipo de anúncio.`
                                : 'Escolha a categoria do seu anúncio para começar.'
                            }
                        </p>
                        <div className={styles.moduleGrid}>
                            {(Object.keys(MODULO_CONFIG) as TipoModulo[]).map(mod => {
                                const cfg = MODULO_CONFIG[mod];
                                // Se o usuario tem modulo definido, só mostra o dele
                                if (userModule && userModule !== mod) return null;
                                return (
                                    <button key={mod} type="button"
                                        className={`${styles.moduleCard} ${listing.modulo === mod ? styles.selected : ''}`}
                                        onClick={() => setListing({ ...listing, modulo: mod })}
                                    >
                                        <span className={styles.moduleIcon}>{cfg.icon}</span>
                                        <h3>{cfg.label}</h3>
                                        <p>{cfg.descricao}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ===== STEP 2: IMÓVEL ===== */}
                {step === 'imovel' && (
                    <>
                        <h2 className={styles.stepTitle}>Dados do imóvel</h2>
                        <p className={styles.stepSubtitle}>Descreva seu imóvel para os visitantes.</p>

                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.label}>Título do anúncio *</label>
                                    <input className={styles.input} type="text"
                                        placeholder="Ex: Apartamento com vista mar na Beira Mar"
                                        value={property.titulo}
                                        onChange={e => setProperty({ ...property, titulo: e.target.value })} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tipo de imóvel *</label>
                                    <select className={styles.select} value={property.tipo_imovel}
                                        onChange={e => setProperty({ ...property, tipo_imovel: e.target.value })}>
                                        {TIPOS_IMOVEL[modulo].map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Estado de conservação</label>
                                    <select className={styles.select} value={property.estado_conservacao}
                                        onChange={e => setProperty({ ...property, estado_conservacao: e.target.value })}>
                                        {ESTADOS_CONSERVACAO.map(e => (
                                            <option key={e.value} value={e.value}>{e.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.label}>Descrição</label>
                                    <textarea className={styles.textarea} rows={4}
                                        placeholder="Descreva o que seu imóvel tem de melhor..."
                                        value={property.descricao}
                                        onChange={e => setProperty({ ...property, descricao: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>🏗️ Composição</h3>
                            <div className={styles.formGrid4}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Quartos</label>
                                    <Counter value={property.quartos} onChange={v => setProperty({ ...property, quartos: v })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Suítes</label>
                                    <Counter value={property.suites} onChange={v => setProperty({ ...property, suites: v })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Banheiros</label>
                                    <Counter value={property.banheiros_sociais} onChange={v => setProperty({ ...property, banheiros_sociais: v })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Vagas garagem</label>
                                    <Counter value={property.vagas_garagem} onChange={v => setProperty({ ...property, vagas_garagem: v })} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>📐 Áreas</h3>
                            <div className={styles.formGrid3}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Área total (m²)</label>
                                    <input className={styles.input} type="number" placeholder="0"
                                        value={property.area_total}
                                        onChange={e => setProperty({ ...property, area_total: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Área privativa (m²)</label>
                                    <input className={styles.input} type="number" placeholder="0"
                                        value={property.area_privativa}
                                        onChange={e => setProperty({ ...property, area_privativa: e.target.value })} />
                                </div>
                                {(modulo === 'venda' || modulo === 'aluguel') && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Área terreno (m²)</label>
                                        <input className={styles.input} type="number" placeholder="0"
                                            value={property.area_terreno}
                                            onChange={e => setProperty({ ...property, area_terreno: e.target.value })} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ===== STEP 3: ENDEREÇO ===== */}
                {step === 'endereco' && (
                    <>
                        <h2 className={styles.stepTitle}>Localização do imóvel</h2>
                        <p className={styles.stepSubtitle}>Onde fica o imóvel?</p>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>CEP</label>
                                <input className={styles.input} type="text" placeholder="00000-000"
                                    value={property.cep}
                                    onChange={e => setProperty({ ...property, cep: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Estado *</label>
                                <select className={styles.select} value={property.estado}
                                    onChange={e => setProperty({ ...property, estado: e.target.value })}>
                                    {BRAZILIAN_STATES.map(s => (
                                        <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cidade *</label>
                                <input className={styles.input} type="text" placeholder="Fortaleza"
                                    value={property.cidade}
                                    onChange={e => setProperty({ ...property, cidade: e.target.value })}
                                    list="cidades" />
                                <datalist id="cidades">
                                    {CEARA_CITIES.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Bairro *</label>
                                <input className={styles.input} type="text" placeholder="Meireles"
                                    value={property.bairro}
                                    onChange={e => setProperty({ ...property, bairro: e.target.value })} />
                            </div>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label className={styles.label}>Logradouro</label>
                                <input className={styles.input} type="text" placeholder="Av. Beira Mar"
                                    value={property.logradouro}
                                    onChange={e => setProperty({ ...property, logradouro: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Número</label>
                                <input className={styles.input} type="text" placeholder="123"
                                    value={property.numero}
                                    onChange={e => setProperty({ ...property, numero: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Complemento</label>
                                <input className={styles.input} type="text" placeholder="Apto 401"
                                    value={property.complemento}
                                    onChange={e => setProperty({ ...property, complemento: e.target.value })} />
                            </div>
                        </div>
                    </>
                )}

                {/* ===== STEP 4: DETALHES (Condicional por módulo) ===== */}
                {step === 'detalhes' && (
                    <>
                        <h2 className={styles.stepTitle}>
                            Detalhes de {config.label}
                        </h2>
                        <p className={styles.stepSubtitle}>
                            Informações específicas para anúncios de {config.label.toLowerCase()}.
                        </p>

                        {/* ---- HOSPEDAGEM DETAILS ---- */}
                        {modulo === 'hospedagem' && (
                            <>
                                <div className={styles.formSection}>
                                    <h3 className={styles.formSectionTitle}>🛏️ Capacidade e Camas</h3>
                                    <div className={styles.formGrid4}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Hóspedes máx.</label>
                                            <Counter value={listing.capacidade_maxima}
                                                onChange={v => setListing({ ...listing, capacidade_maxima: v })} min={1} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Camas casal</label>
                                            <Counter value={listing.camas_casal}
                                                onChange={v => setListing({ ...listing, camas_casal: v })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Camas solteiro</label>
                                            <Counter value={listing.camas_solteiro}
                                                onChange={v => setListing({ ...listing, camas_solteiro: v })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Mín. noites</label>
                                            <Counter value={listing.minimo_noites}
                                                onChange={v => setListing({ ...listing, minimo_noites: v })} min={1} />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formSection}>
                                    <h3 className={styles.formSectionTitle}>🔑 Check-in</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Tipo de check-in</label>
                                            <select className={styles.select} value={listing.tipo_checkin}
                                                onChange={e => setListing({ ...listing, tipo_checkin: e.target.value })}>
                                                {TIPOS_CHECKIN.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ---- ALUGUEL DETAILS ---- */}
                        {modulo === 'aluguel' && (
                            <>
                                <div className={styles.formSection}>
                                    <h3 className={styles.formSectionTitle}>📋 Contrato</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Prazo mínimo (meses)</label>
                                            <input className={styles.input} type="number" placeholder="12"
                                                value={listing.prazo_minimo_contrato}
                                                onChange={e => setListing({ ...listing, prazo_minimo_contrato: e.target.value })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Índice de reajuste</label>
                                            <select className={styles.select} value={listing.indice_reajuste}
                                                onChange={e => setListing({ ...listing, indice_reajuste: e.target.value })}>
                                                {INDICES_REAJUSTE.map(i => (
                                                    <option key={i.value} value={i.value}>{i.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formSection}>
                                    <h3 className={styles.formSectionTitle}>🔒 Garantias aceitas</h3>
                                    <div className={styles.amenitiesGrid}>
                                        {GARANTIAS_ALUGUEL.map(g => (
                                            <Toggle key={g.value}
                                                checked={listing.garantias_aceitas.includes(g.value)}
                                                onChange={(checked) => {
                                                    const newList = checked
                                                        ? [...listing.garantias_aceitas, g.value]
                                                        : listing.garantias_aceitas.filter(x => x !== g.value);
                                                    setListing({ ...listing, garantias_aceitas: newList });
                                                }}
                                                label={g.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ---- VENDA DETAILS ---- */}
                        {modulo === 'venda' && (
                            <>
                                <div className={styles.formSection}>
                                    <h3 className={styles.formSectionTitle}>🏗️ Situação do imóvel</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Status da obra</label>
                                            <select className={styles.select} value={listing.status_obra}
                                                onChange={e => setListing({ ...listing, status_obra: e.target.value })}>
                                                {STATUS_OBRA.map(s => (
                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Entrada mínima (%)
                                                <span className={styles.labelHint}>opcional</span>
                                            </label>
                                            <input className={styles.input} type="number" placeholder="20"
                                                value={listing.entrada_minima_percentual}
                                                onChange={e => setListing({ ...listing, entrada_minima_percentual: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formSection}>
                                    <h3 className={styles.formSectionTitle}>💳 Opções de pagamento</h3>
                                    <div className={styles.amenitiesGrid}>
                                        <Toggle checked={listing.aceita_financiamento}
                                            onChange={v => setListing({ ...listing, aceita_financiamento: v })}
                                            label="Aceita financiamento" />
                                        <Toggle checked={listing.aceita_permuta}
                                            onChange={v => setListing({ ...listing, aceita_permuta: v })}
                                            label="Aceita permuta" />
                                        <Toggle checked={listing.fgts}
                                            onChange={v => setListing({ ...listing, fgts: v })}
                                            label="Aceita FGTS" />
                                    </div>
                                </div>

                                <div className={styles.formSection}>
                                    <h3 className={styles.formSectionTitle}>🏢 Construtora / Incorporadora</h3>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Construtora</label>
                                            <input className={styles.input} type="text" placeholder="Nome da construtora"
                                                value={listing.construtora}
                                                onChange={e => setListing({ ...listing, construtora: e.target.value })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Incorporadora</label>
                                            <input className={styles.input} type="text" placeholder="Nome da incorporadora"
                                                value={listing.incorporadora}
                                                onChange={e => setListing({ ...listing, incorporadora: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Amenidades (todos os módulos) */}
                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>✨ Comodidades</h3>
                            <div className={styles.amenitiesGrid}>
                                {AMENIDADES.map(a => (
                                    <Toggle key={a.id}
                                        checked={property.amenities.includes(a.id)}
                                        onChange={(checked) => {
                                            const newList = checked
                                                ? [...property.amenities, a.id]
                                                : property.amenities.filter(x => x !== a.id);
                                            setProperty({ ...property, amenities: newList });
                                        }}
                                        label={`${a.icon} ${a.label}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ===== STEP 5: VALORES ===== */}
                {step === 'valores' && (
                    <>
                        <h2 className={styles.stepTitle}>Precificação</h2>
                        <p className={styles.stepSubtitle}>Defina os valores do seu anúncio.</p>

                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>💰 {config.precoLabel}</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{config.precoLabel} * (R$)</label>
                                    <input className={styles.input} type="text" placeholder="0,00"
                                        value={listing.preco_base}
                                        onChange={e => setListing({ ...listing, preco_base: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Valores extras Hospedagem */}
                        {modulo === 'hospedagem' && (
                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>🏨 Taxas e descontos</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Preço fim de semana (R$)</label>
                                        <input className={styles.input} type="text" placeholder="0,00"
                                            value={listing.preco_fim_semana}
                                            onChange={e => setListing({ ...listing, preco_fim_semana: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Taxa de limpeza (R$)</label>
                                        <input className={styles.input} type="text" placeholder="0,00"
                                            value={listing.taxa_limpeza}
                                            onChange={e => setListing({ ...listing, taxa_limpeza: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Desconto semanal (%)</label>
                                        <input className={styles.input} type="number" placeholder="0"
                                            value={listing.desconto_semanal}
                                            onChange={e => setListing({ ...listing, desconto_semanal: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Desconto mensal (%)</label>
                                        <input className={styles.input} type="number" placeholder="0"
                                            value={listing.desconto_mensal}
                                            onChange={e => setListing({ ...listing, desconto_mensal: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Valores extras Aluguel */}
                        {modulo === 'aluguel' && (
                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>🏠 Custos adicionais</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Condomínio (R$)</label>
                                        <input className={styles.input} type="text" placeholder="0,00"
                                            value={listing.valor_condominio}
                                            onChange={e => setListing({ ...listing, valor_condominio: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>IPTU mensal (R$)</label>
                                        <input className={styles.input} type="text" placeholder="0,00"
                                            value={listing.valor_iptu}
                                            onChange={e => setListing({ ...listing, valor_iptu: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Caução (R$)</label>
                                        <input className={styles.input} type="text" placeholder="0,00"
                                            value={listing.valor_caucao}
                                            onChange={e => setListing({ ...listing, valor_caucao: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.formSection}>
                            <Toggle checked={listing.exclusividade}
                                onChange={v => setListing({ ...listing, exclusividade: v })}
                                label="🔒 Anúncio com exclusividade (este imóvel só será anunciado aqui)"
                            />
                        </div>
                    </>
                )}

                {/* ===== STEP 6: FOTOS ===== */}
                {step === 'fotos' && (
                    <>
                        <h2 className={styles.stepTitle}>Fotos do imóvel</h2>
                        <p className={styles.stepSubtitle}>Adicione fotos para atrair mais visitantes.</p>

                        <div className={styles.uploadArea}>
                            <div className={styles.uploadIcon}>📸</div>
                            <div className={styles.uploadText}>Arraste fotos aqui ou clique para selecionar</div>
                            <div className={styles.uploadHint}>
                                O upload de fotos será implementado em breve via Supabase Storage.
                                <br />Por enquanto, você pode pular essa etapa e adicionar fotos depois.
                            </div>
                        </div>
                    </>
                )}

                {/* ===== STEP 7: REVISÃO ===== */}
                {step === 'revisao' && (
                    <>
                        <h2 className={styles.stepTitle}>Revisão do anúncio</h2>
                        <p className={styles.stepSubtitle}>Confira todas as informações antes de publicar.</p>

                        <div className={styles.reviewSection}>
                            <div className={styles.reviewCard}>
                                <div className={styles.reviewCardTitle}>📋 Informações do anúncio</div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Módulo</span>
                                    <span className={styles.reviewValue}>{config.icon} {config.label}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Título</span>
                                    <span className={styles.reviewValue}>{property.titulo || '—'}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Tipo</span>
                                    <span className={styles.reviewValue}>{property.tipo_imovel}</span>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Preço</span>
                                    <span className={styles.reviewPrice}>
                                        {listing.preco_base ? `R$ ${listing.preco_base}` : '—'}
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--neutral-500)' }}>
                                            {config.precoPeriodo}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className={styles.reviewCard}>
                                <div className={styles.reviewCardTitle}>🏠 Imóvel</div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Composição</span>
                                    <span className={styles.reviewValue}>
                                        {property.quartos} quartos · {property.banheiros_sociais} banheiros · {property.vagas_garagem} vagas
                                    </span>
                                </div>
                                {property.area_total && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Área total</span>
                                        <span className={styles.reviewValue}>{property.area_total} m²</span>
                                    </div>
                                )}
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Conservação</span>
                                    <span className={styles.reviewValue}>{property.estado_conservacao}</span>
                                </div>
                            </div>

                            <div className={styles.reviewCard}>
                                <div className={styles.reviewCardTitle}>📍 Localização</div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Local</span>
                                    <span className={styles.reviewValue}>
                                        {property.bairro}, {property.cidade} - {property.estado}
                                    </span>
                                </div>
                                {property.logradouro && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Endereço</span>
                                        <span className={styles.reviewValue}>{property.logradouro}, {property.numero}</span>
                                    </div>
                                )}
                            </div>

                            {property.amenities.length > 0 && (
                                <div className={styles.reviewCard}>
                                    <div className={styles.reviewCardTitle}>✨ Comodidades ({property.amenities.length})</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {property.amenities.map(id => {
                                            const a = AMENIDADES.find(x => x.id === id);
                                            return a ? (
                                                <span key={id} style={{
                                                    padding: '4px 12px', background: 'var(--primary-50)',
                                                    color: 'var(--primary-700)', borderRadius: 'var(--radius-full)',
                                                    fontSize: 'var(--text-sm)', fontWeight: 500
                                                }}>
                                                    {a.icon} {a.label}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer Navigation */}
            <footer className={styles.footer}>
                <button type="button" className={styles.backBtn}
                    onClick={goBack} disabled={stepIndex === 0 || loading}>
                    ← Voltar
                </button>

                {step === 'revisao' ? (
                    <button type="button" className={styles.publishBtn}
                        onClick={handlePublish} disabled={loading}>
                        {loading ? '⏳ Publicando...' : '🚀 Publicar Anúncio'}
                    </button>
                ) : (
                    <button type="button" className={styles.nextBtn}
                        onClick={goNext} disabled={!canGoNext() || loading}>
                        Continuar →
                    </button>
                )}
            </footer>
        </div>
    );
}
