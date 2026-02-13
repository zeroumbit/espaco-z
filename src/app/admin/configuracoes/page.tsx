import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Configurações — Super Admin',
};

export default function AdminSettingsPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Configurações da Plataforma</h1>
                <p className={styles.subtitle}>Ajustes globais, taxas e políticas do sistema.</p>
            </header>

            <div className={styles.settingsGrid}>
                <div className={styles.settingCard}>
                    <div className={styles.settingHeader}>
                        <h2 className={styles.settingTitle}>Taxas e Comissões</h2>
                        <div className={styles.settingIcon}>%</div>
                    </div>
                    <div className={styles.settingContent}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Taxa de hospedagem</label>
                            <input
                                type="number"
                                className={styles.input}
                                defaultValue="12.5"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className={styles.helperText}>Taxa cobrada sobre cada reserva de hospedagem (%)</span>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Taxa de aluguel</label>
                            <input
                                type="number"
                                className={styles.input}
                                defaultValue="8.0"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className={styles.helperText}>Taxa cobrada sobre cada contrato de aluguel (%)</span>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Taxa de venda</label>
                            <input
                                type="number"
                                className={styles.input}
                                defaultValue="2.5"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className={styles.helperText}>Taxa cobrada sobre cada venda de imóvel (%)</span>
                        </div>
                    </div>
                    <div className={styles.settingFooter}>
                        <button className={styles.saveBtn}>Salvar Configurações</button>
                    </div>
                </div>

                <div className={styles.settingCard}>
                    <div className={styles.settingHeader}>
                        <h2 className={styles.settingTitle}>Políticas da Plataforma</h2>
                        <div className={styles.settingIcon}>📋</div>
                    </div>
                    <div className={styles.settingContent}>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" className={styles.checkbox} defaultChecked />
                                <span>Permitir novos cadastros de anunciantes</span>
                            </label>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" className={styles.checkbox} defaultChecked />
                                <span>Exigir aprovação para anúncios de "Perto de Você"</span>
                            </label>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" className={styles.checkbox} />
                                <span>Enviar notificações por e-mail</span>
                            </label>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" className={styles.checkbox} defaultChecked />
                                <span>Ativar sistema de avaliações</span>
                            </label>
                        </div>
                    </div>
                    <div className={styles.settingFooter}>
                        <button className={styles.saveBtn}>Salvar Políticas</button>
                    </div>
                </div>

                <div className={styles.settingCard}>
                    <div className={styles.settingHeader}>
                        <h2 className={styles.settingTitle}>Integrações</h2>
                        <div className={styles.settingIcon}>🔗</div>
                    </div>
                    <div className={styles.settingContent}>
                        <div className={styles.integrationItem}>
                            <div className={styles.integrationInfo}>
                                <h3 className={styles.integrationTitle}>Mercado Pago</h3>
                                <p className={styles.integrationDesc}>Sistema de pagamentos e assinaturas</p>
                            </div>
                            <div className={styles.integrationStatus}>
                                <span className={`${styles.statusBadge} ${styles.statusActive}`}>Ativo</span>
                            </div>
                        </div>
                        <div className={styles.integrationItem}>
                            <div className={styles.integrationInfo}>
                                <h3 className={styles.integrationTitle}>Google Analytics</h3>
                                <p className={styles.integrationDesc}>Análise de tráfego e comportamento</p>
                            </div>
                            <div className={styles.integrationStatus}>
                                <span className={`${styles.statusBadge} ${styles.statusInactive}`}>Inativo</span>
                            </div>
                        </div>
                        <div className={styles.integrationItem}>
                            <div className={styles.integrationInfo}>
                                <h3 className={styles.integrationTitle}>Twilio</h3>
                                <p className={styles.integrationDesc}>Sistema de mensagens SMS</p>
                            </div>
                            <div className={styles.integrationStatus}>
                                <span className={`${styles.statusBadge} ${styles.statusActive}`}>Ativo</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.settingFooter}>
                        <button className={styles.manageBtn}>Gerenciar Integrações</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
