'use client';

import type { LegalEntityData } from '@/types/onboarding';
import styles from './LegalEntityStep.module.css';

interface LegalEntityStepProps {
    data: LegalEntityData;
    onChange: (data: LegalEntityData) => void;
    errors: Record<string, string>;
}

// ---- Máscaras ----
function formatCPF(value: string): string {
    const nums = value.replace(/\D/g, '').substring(0, 11);
    return nums
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCNPJ(value: string): string {
    const nums = value.replace(/\D/g, '').substring(0, 14);
    return nums
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export default function LegalEntityStep({ data, onChange, errors }: LegalEntityStepProps) {
    const isPF = data.businessType === 'PF';

    const handleDocumentChange = (value: string) => {
        const formatted = isPF ? formatCPF(value) : formatCNPJ(value);
        onChange({ ...data, document: formatted });
    };

    const handleTypeChange = (type: 'PF' | 'PJ') => {
        onChange({
            ...data,
            businessType: type,
            document: '', // Limpa documento ao trocar tipo
        });
    };

    return (
        <div className={styles.step}>
            <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Dados da Empresa</h2>
                <p className={styles.stepSubtitle}>
                    Informe os dados do responsável pelo anúncio.
                </p>
            </div>

            {/* Toggle PF/PJ */}
            <div className={styles.toggleContainer}>
                <button
                    type="button"
                    className={`${styles.toggleBtn} ${isPF ? styles.toggleActive : ''}`}
                    onClick={() => handleTypeChange('PF')}
                >
                    <span className={styles.toggleIcon}>👤</span>
                    <span className={styles.toggleText}>
                        <strong>Pessoa Física</strong>
                        <small>Anuncie com seu CPF</small>
                    </span>
                </button>
                <button
                    type="button"
                    className={`${styles.toggleBtn} ${!isPF ? styles.toggleActive : ''}`}
                    onClick={() => handleTypeChange('PJ')}
                >
                    <span className={styles.toggleIcon}>🏢</span>
                    <span className={styles.toggleText}>
                        <strong>Pessoa Jurídica</strong>
                        <small>Anuncie com seu CNPJ</small>
                    </span>
                </button>
            </div>

            <div className={styles.fields}>
                {/* Documento (CPF ou CNPJ) */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="onb-document">
                        {isPF ? 'CPF' : 'CNPJ'}
                    </label>
                    <input
                        id="onb-document"
                        type="text"
                        className={`${styles.input} ${errors.document ? styles.inputError : ''}`}
                        placeholder={isPF ? '000.000.000-00' : '00.000.000/0000-00'}
                        value={data.document}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                        autoFocus
                    />
                    {errors.document && <span className={styles.errorText}>{errors.document}</span>}
                </div>

                {/* Nome Fantasia */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="onb-company-name">
                        {isPF ? 'Nome Público' : 'Nome Fantasia'}
                    </label>
                    <input
                        id="onb-company-name"
                        type="text"
                        className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`}
                        placeholder={isPF ? 'Como você quer ser encontrado' : 'Ex: Pousada Sol & Mar'}
                        value={data.companyName}
                        onChange={(e) => onChange({ ...data, companyName: e.target.value })}
                    />
                    {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
                    <span className={styles.hint}>
                        Este nome será exibido publicamente nos seus anúncios.
                    </span>
                </div>
            </div>
        </div>
    );
}
