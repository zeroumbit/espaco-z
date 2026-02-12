import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Super Admin — Espaço Z',
};

export default function AdminDashboardPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Painel Global (Super Admin)</h1>
                    <p className={styles.welcome}>Visão geral de toda a plataforma Espaço Z.</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏢</div>
                    <div>
                        <div className={styles.statLabel}>Total de Anunciantes</div>
                        <div className={styles.statValue}>42</div>
                        <div className={styles.statTrend}>+4 este mês</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏠</div>
                    <div>
                        <div className={styles.statLabel}>Espaços Ativos</div>
                        <div className={styles.statValue}>128</div>
                        <div className={styles.statTrend}>95% em Fortaleza</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div>
                        <div className={styles.statLabel}>Faturamento (MRR)</div>
                        <div className={styles.statValue}>R$ 12.450</div>
                        <div className={styles.statTrend}>+15% vs jan/26</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📍</div>
                    <div>
                        <div className={styles.statLabel}>Anunciantes "Perto de Você"</div>
                        <div className={styles.statValue}>15</div>
                        <div className={styles.statAlert}>3 aguardando aprovação</div>
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* Recent Activity / Tenants */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Anunciantes Recentes</h2>
                    <div className={styles.tableCard}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Anunciante</th>
                                    <th>Cidade</th>
                                    <th>Plano</th>
                                    <th>Espaços</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Marina Flat Service</strong></td>
                                    <td>Fortaleza - CE</td>
                                    <td>Pro (10 espaços)</td>
                                    <td>8/10</td>
                                    <td><span className={styles.statusActive}>Ativo</span></td>
                                    <td><button className={styles.actionBtn}>Detalhes</button></td>
                                </tr>
                                <tr>
                                    <td><strong>Corretora Silva</strong></td>
                                    <td>Juazeiro do Norte - CE</td>
                                    <td>Elite (Ilimitado)</td>
                                    <td>45</td>
                                    <td><span className={styles.statusActive}>Ativo</span></td>
                                    <td><button className={styles.actionBtn}>Detalhes</button></td>
                                </tr>
                                <tr>
                                    <td><strong>Pousada do Sol</strong></td>
                                    <td>Jericoacoara - CE</td>
                                    <td>Trial (1 espaço)</td>
                                    <td>1/1</td>
                                    <td><span className={styles.statusWarning}>Vencendo</span></td>
                                    <td><button className={styles.actionBtn}>Detalhes</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Local Advertisers Pending */}
                <aside className={styles.sidebarSection}>
                    <h2 className={styles.sectionTitle}>Moderação Local</h2>
                    <div className={styles.miniList}>
                        <div className={styles.miniItem}>
                            <div className={styles.miniIcon}>🛒</div>
                            <div className={styles.miniContent}>
                                <p className={styles.miniName}>Supermercado Preço Baixo</p>
                                <p className={styles.miniMeta}>Aguardando aprovação de raio de exibição</p>
                            </div>
                        </div>
                        <div className={styles.miniItem}>
                            <div className={styles.miniIcon}>💊</div>
                            <div className={styles.miniContent}>
                                <p className={styles.miniName}>Farmácia Mais Saúde</p>
                                <p className={styles.miniMeta}>Nova solicitação de Plano Prime</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
