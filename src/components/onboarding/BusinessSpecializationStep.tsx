'use client';

import type { SpecializationData, MainModule } from '@/types/onboarding';
import { ATUACAO_OPTIONS } from '@/types/onboarding';
import styles from './BusinessSpecializationStep.module.css';

interface BusinessSpecializationStepProps {
    data: SpecializationData;
    onChange: (data: SpecializationData) => void;
    errors: Record<string, string>;
}

const MODULE_CONFIG: Record<MainModule, { label: string; icon: string; color: string; description: string }> = {
    hospedagem: {
        label: 'Hospedagem',
        icon: '🏨',
        color: '#6366F1',
        description: 'Diárias e temporada para hóspedes',
    },
    alugueis: {
        label: 'Aluguel',
        icon: '🏠',
        color: '#0EA5E9',
        description: 'Locação residencial e comercial',
    },
    vendas: {
        label: 'Vendas',
        icon: '🏡',
        color: '#10B981',
        description: 'Venda de imóveis e terrenos',
    },
};

export default function BusinessSpecializationStep({ data, onChange, errors }: BusinessSpecializationStepProps) {
    const handleModuleChange = (mod: MainModule) => {
        onChange({
            mainModule: mod,
            atuacaoEspecifica: [], // Reset subcategories on module change
        });
    };

    const handleToggleAtuacao = (value: string) => {
        const current = data.atuacaoEspecifica;
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onChange({ ...data, atuacaoEspecifica: next });
    };

    const handleSelectAll = () => {
        const options = ATUACAO_OPTIONS[data.mainModule];
        const allSelected = options.every((o) => data.atuacaoEspecifica.includes(o.value));
        onChange({
            ...data,
            atuacaoEspecifica: allSelected ? [] : options.map((o) => o.value),
        });
    };

    const selectedModule = MODULE_CONFIG[data.mainModule];
    const options = ATUACAO_OPTIONS[data.mainModule];
    const allSelected = options.every((o) => data.atuacaoEspecifica.includes(o.value));

    return (
        <div className={styles.step}>
            <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Sua Especialização</h2>
                <p className={styles.stepSubtitle}>
                    Defina seu módulo principal e quais tipos de espaços você anuncia.
                </p>
            </div>

            {/* Módulo Principal */}
            <div className={styles.section}>
                <h3 className={styles.sectionLabel}>Módulo Principal</h3>
                <div className={styles.moduleGrid}>
                    {(Object.keys(MODULE_CONFIG) as MainModule[]).map((mod) => {
                        const cfg = MODULE_CONFIG[mod];
                        const isSelected = data.mainModule === mod;
                        return (
                            <button
                                key={mod}
                                type="button"
                                className={`${styles.moduleCard} ${isSelected ? styles.moduleSelected : ''}`}
                                onClick={() => handleModuleChange(mod)}
                                style={{
                                    '--module-color': cfg.color,
                                    '--module-color-light': `${cfg.color}15`,
                                } as React.CSSProperties}
                            >
                                <span className={styles.moduleRadio}>
                                    {isSelected && <span className={styles.moduleRadioDot} />}
                                </span>
                                <span className={styles.moduleIcon}>{cfg.icon}</span>
                                <div className={styles.moduleInfo}>
                                    <strong>{cfg.label}</strong>
                                    <small>{cfg.description}</small>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Atuação Específica */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionLabel}>
                        Atuação Específica
                        <span className={styles.badge}>
                            {data.atuacaoEspecifica.length}/{options.length}
                        </span>
                    </h3>
                    <button
                        type="button"
                        className={styles.selectAllBtn}
                        onClick={handleSelectAll}
                    >
                        {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                    </button>
                </div>

                <p className={styles.sectionHint}>
                    Selecione os tipos de espaços que você anuncia dentro de <strong>{selectedModule.label}</strong>.
                </p>

                {errors.atuacaoEspecifica && (
                    <span className={styles.errorText}>{errors.atuacaoEspecifica}</span>
                )}

                <div className={styles.checkboxGrid}>
                    {options.map((opt) => {
                        const isChecked = data.atuacaoEspecifica.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                className={`${styles.checkboxCard} ${isChecked ? styles.checkboxChecked : ''}`}
                                onClick={() => handleToggleAtuacao(opt.value)}
                                style={{
                                    '--module-color': selectedModule.color,
                                } as React.CSSProperties}
                            >
                                <span className={styles.checkboxIcon}>{opt.icon}</span>
                                <span className={styles.checkboxLabel}>{opt.label}</span>
                                <span className={styles.checkmark}>
                                    {isChecked ? '✓' : ''}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
