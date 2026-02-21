import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'Termos de Uso — Espaço Z',
    description: 'Termos e diretrizes para utilização da plataforma Espaço Z.',
};

export default function TermosPage() {
    const lastUpdate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>Z</div>
                    <span className={styles.logoText}>espaço<strong>Z</strong></span>
                </Link>
                <h1 className={styles.title}>Termos de Uso</h1>
                <p className={styles.lastUpdate}>Última atualização: {lastUpdate}</p>
            </header>

            <main className={styles.content}>
                <section className={styles.section}>
                    <h2>1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar e utilizar a plataforma Espaço Z, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                        Estes termos regem o uso do nosso marketplace de hospedagem, aluguéis e vendas de imóveis. Se você não concordar 
                        com qualquer parte destes termos, não deverá utilizar nossos serviços.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>2. Descrição dos Serviços</h2>
                    <p>
                        O Espaço Z é uma plataforma tecnológica que atua como intermediária entre Anunciantes (Proprietários, Imobiliárias e Corretores) 
                        e Interessados (Hóspedes e Compradores). Nós fornecemos as ferramentas para que imóveis sejam listados, visualizados e 
                        negociados, mas não somos proprietários nem gerenciaiamos diretamente as propriedades listadas.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>3. Responsabilidades do Anunciante</h2>
                    <p>O Anunciante compromete-se a:</p>
                    <ul>
                        <li>Fornecer informações precisas, atualizadas e completas sobre os imóveis.</li>
                        <li>Garantir que possui todos os direitos e autorizações necessários para anunciar o imóvel.</li>
                        <li>Manter a veracidade das fotos, preços e disponibilidade.</li>
                        <li>Responder prontamente às solicitações e mensagens dos interessados.</li>
                        <li>Cumprir com a legislação local pertinente a locações e vendas de imóveis.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>4. Responsabilidades do Usuário/Interessado</h2>
                    <p>O Usuário compromete-se a:</p>
                    <ul>
                        <li>Utilizar a plataforma de boa-fé e para finalidades lícitas.</li>
                        <li>Respeitar as regras de convivência e do imóvel estabelecidas pelos anunciantes.</li>
                        <li>Fornecer dados reais para a realização de cadastros e reservas.</li>
                        <li>Não utilizar ferramentas automáticas para coletar dados da plataforma.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>5. Regras para Hospedagem e Aluguéis</h2>
                    <p>
                        Para o módulo de <strong>Hospedagem</strong>, as reservas são confirmadas mediante as regras de cada anúncio. 
                        O Espaço Z não se responsabiliza por cancelamentos feitos fora das políticas estabelecidas no anúncio. 
                        Para <strong>Aluguéis Mensais/Anuais</strong>, o contrato final de locação é de responsabilidade das partes envolvidas.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>6. Propriedade Intelectual</h2>
                    <p>
                        Todo o conteúdo presente na plataforma (logotipo, layout, códigos, gráficos) é de propriedade exclusiva do Espaço Z. 
                        O uso não autorizado de qualquer material da plataforma poderá resultar em sanções civis e criminais.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>7. Limitação de Responsabilidade</h2>
                    <p>
                        O Espaço Z empenha-se em manter a segurança da plataforma, porém não se responsabiliza por:
                    </p>
                    <ul>
                        <li>Interrupções temporárias do serviço devido a manutenções ou falhas técnicas de terceiros.</li>
                        <li>Divergências entre o anúncio e o estado real do imóvel (responsabilidade total do Anunciante).</li>
                        <li>Eventuais danos morais ou materiais decorrentes das negociações entre as partes.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>8. Modificações dos Termos</h2>
                    <p>
                        Reservamo-nos o direito de atualizar estes termos a qualquer momento. Alterações significativas serão notificadas 
                        diretamente na plataforma ou por e-mail. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
                    </p>
                </section>

                <div className={styles.contactCard}>
                    <h3>Dúvidas ou Suporte?</h3>
                    <p>Estamos à disposição para ajudar você através dos nossos canais oficiais:</p>
                    <div className={styles.contactInfo}>
                        <span>📧 E-mail: zeroumbit@gmail.com</span>
                        <span>📱 WhatsApp: (85) 9 9727-7128</span>
                    </div>
                </div>

                <Link href="/anunciar" className={styles.backLink}>
                    ← Voltar para o Cadastro
                </Link>
            </main>
        </div>
    );
}
