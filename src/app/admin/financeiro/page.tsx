import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Financeiro — Super Admin',
};

export default function AdminFinancePage() {
    // Simulando dados financeiros
    const stats = {
        totalRevenue: 'R$ 42.580,00',
        monthlyGrowth: '+12,5%',
        activeSubscriptions: 128,
        pendingPayments: 8
    };

    const revenueData = [
        { month: 'Jan/26', revenue: 'R$ 32.450,00' },
        { month: 'Fev/26', revenue: 'R$ 38.720,00' },
        { month: 'Mar/26', revenue: 'R$ 42.580,00' },
    ];

    const recentTransactions = [
        { id: '#001', advertiser: 'Hotéis & Pousadas Silva', plan: 'Plano Pro', amount: 'R$ 299,90', date: '12/02/2026' },
        { id: '#002', advertiser: 'Imobiliária Oliveira', plan: 'Plano Elite', amount: 'R$ 599,90', date: '11/02/2026' },
        { id: '#003', advertiser: 'Aluga Aqui Imóveis', plan: 'Plano Pro', amount: 'R$ 299,90', date: '10/02/2026' },
    ];

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Planos e Receita Global</h1>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statTitle}>Receita Total</span>
                        <div className={styles.statIcon}>💰</div>
                    </div>
                    <span className={styles.statValue}>{stats.totalRevenue}</span>
                    <span className={styles.statGrowth}>{stats.monthlyGrowth} desde o mês passado</span>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statTitle}>Assinaturas Ativas</span>
                        <div className={styles.statIcon}>💳</div>
                    </div>
                    <span className={styles.statValue}>{stats.activeSubscriptions}</span>
                    <span className={styles.statDesc}>Empresas pagando</span>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statTitle}>Pagamentos Pendentes</span>
                        <div className={styles.statIcon}>⏳</div>
                    </div>
                    <span className={styles.statValue}>{stats.pendingPayments}</span>
                    <span className={styles.statDesc}>Necessitam atenção</span>
                </div>
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.chartSection}>
                    <h2 className={styles.sectionTitle}>Evolução de Receita</h2>
                    <div className={styles.chartContainer}>
                        {revenueData.map((data, index) => (
                            <div key={index} className={styles.revenueRow}>
                                <span className={styles.month}>{data.month}</span>
                                <span className={styles.amount}>{data.revenue}</span>
                                <div className={styles.bar} style={{ width: `${(parseFloat(data.revenue.replace(/[^\d,]/g, '').replace(',', '.')) / 50000) * 100}%` }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.transactionsSection}>
                    <h2 className={styles.sectionTitle}>Transações Recentes</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Anunciante</th>
                                    <th>Plano</th>
                                    <th>Valor</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.id}</td>
                                        <td>{transaction.advertiser}</td>
                                        <td><span className={styles.planBadge}>{transaction.plan}</span></td>
                                        <td>{transaction.amount}</td>
                                        <td>{transaction.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
