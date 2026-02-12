'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type Step = 'modulo' | 'basico' | 'detalhes' | 'fotos';

export default function NewSpaceWizard() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('modulo');
    const [formData, setFormData] = useState({
        module: '',
        title: '',
        propertyType: '',
        city: '',
        price: '',
        description: '',
    });

    const handleNext = () => {
        if (step === 'modulo') setStep('basico');
        else if (step === 'basico') setStep('detalhes');
        else if (step === 'detalhes') setStep('fotos');
        else {
            // Submit logic (mock)
            console.log('Submitting:', formData);
            router.push('/dashboard/espacos');
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
                                    value={formData.propertyType}
                                    onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="casa">Casa</option>
                                    <option value="kitnet">Kitnet</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Cidade</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Ex: Fortaleza"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
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
                    </div>
                )}

                {step === 'fotos' && (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Fotos do espaço</h2>
                        <div className={styles.uploadArea}>
                            <div className={styles.uploadPlaceholder}>
                                <span>📸</span>
                                <p>Arraste fotos aqui ou clique para selecionar</p>
                                <button className={styles.uploadBtn}>Escolher arquivos</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className={styles.footer}>
                <button
                    className={styles.backBtn}
                    onClick={handleBack}
                    disabled={step === 'modulo'}
                >
                    Voltar
                </button>
                <button
                    className={styles.nextBtn}
                    onClick={handleNext}
                    disabled={step === 'modulo' && !formData.module}
                >
                    {step === 'fotos' ? 'Publicar Anúncio' : 'Continuar'}
                </button>
            </footer>
        </div>
    );
}
