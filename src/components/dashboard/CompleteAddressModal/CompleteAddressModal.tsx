'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, MapPin, X, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './CompleteAddressModal.module.css';

interface CompleteAddressModalProps {
    tenantId: string;
}

export default function CompleteAddressModal({ tenantId }: CompleteAddressModalProps) {
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        address: '',
        number: '',
        neighborhood: '',
        complement: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação básica
        if (!formData.address || !formData.number || !formData.neighborhood) {
            setError('Todos os campos obrigatórios (*) devem ser preenchidos.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const { error: updateError } = await supabase
                .from('tenants')
                .update({
                    address: formData.address,
                    number: formData.number,
                    neighborhood: formData.neighborhood,
                    complement: formData.complement,
                    address_completed: true
                })
                .eq('id', tenantId);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                // Redireciona para o perfil para completar os demais dados
                window.location.href = '/dashboard/perfil';
            }, 2000);
        } catch (err: any) {
            console.error('[Modal] Erro ao salvar endereço:', err);
            setError('Não foi possível salvar os dados. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={() => setIsOpen(false)} title="Fechar e lembrar depois">
                    <X size={20} />
                </button>

                <header className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <MapPin size={24} className={styles.headerIcon} />
                    </div>
                    <h2>Complete o endereço da sua empresa</h2>
                    <p>Precisamos desses dados para que seus clientes saibam onde você está localizado.</p>
                </header>

                {success ? (
                    <div className={styles.successState}>
                        <CheckCircle2 size={48} className={styles.successIcon} />
                        <h3>Endereço salvo com sucesso!</h3>
                        <p>Redirecionando para o painel...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.alertError}>
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className={styles.grid}>
                            <div className={styles.field} style={{ gridColumn: 'span 3' }}>
                                <label>Logradouro / Rua *</label>
                                <input
                                    type="text"
                                    placeholder="Digite o nome da rua..."
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Número *</label>
                                <input
                                    type="text"
                                    placeholder="Digite o número..."
                                    value={formData.number}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Bairro *</label>
                                <input
                                    type="text"
                                    placeholder="Digite o bairro..."
                                    value={formData.neighborhood}
                                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                                <label>Complemento (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.complement}
                                    onChange={e => setFormData({ ...formData, complement: e.target.value })}
                                    placeholder="Ex: Sala 101, Ao lado do mercado..."
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <footer className={styles.footer}>
                            <p className={styles.helpText}>* Campos obrigatórios</p>
                            <button type="submit" className={styles.submitBtn} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className={styles.spinner} size={18} />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar e continuar'
                                )}
                            </button>
                        </footer>
                    </form>
                )}
            </div>
        </div>
    );
}
