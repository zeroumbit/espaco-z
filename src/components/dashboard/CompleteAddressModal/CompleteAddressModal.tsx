'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buscarEnderecoPorCep } from '@/lib/location';
import { Loader2, MapPin, X, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './CompleteAddressModal.module.css';

interface CompleteAddressModalProps {
    tenantId: string;
    onComplete: () => void;
}

export default function CompleteAddressModal({ tenantId, onComplete }: CompleteAddressModalProps) {
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        cep: '',
        address: '',
        number: '',
        neighborhood: '',
        complement: ''
    });

    const [geoData, setGeoData] = useState<{ lat?: number; lng?: number } | null>(null);

    // Máscara de CEP
    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 8);
        const formatted = value.replace(/(\d{5})(\d)/, '$1-$2');
        setFormData(prev => ({ ...prev, cep: formatted }));
        setError('');

        if (value.length === 8) {
            setLoading(true);
            try {
                const data = await buscarEnderecoPorCep(value);
                if (data) {
                    setFormData(prev => ({
                        ...prev,
                        address: data.street || prev.address,
                        neighborhood: data.neighborhood || prev.neighborhood,
                    }));
                    if (data.latitude && data.longitude) {
                        setGeoData({ lat: data.latitude, lng: data.longitude });
                    }
                } else {
                    setError('CEP não encontrado. Por favor, digite manualmente.');
                }
            } catch (err) {
                setError('Erro ao buscar CEP. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação básica
        if (!formData.cep || !formData.address || !formData.number || !formData.neighborhood) {
            setError('Todos os campos obrigatórios (*) devem ser preenchidos.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const { error: updateError } = await supabase
                .from('tenants')
                .update({
                    cep: formData.cep.replace(/\D/g, ''),
                    address: formData.address,
                    number: formData.number,
                    neighborhood: formData.neighborhood,
                    complement: formData.complement,
                    latitude: geoData?.lat,
                    longitude: geoData?.lng,
                    address_completed: true
                })
                .eq('id', tenantId);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                onComplete();
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
                            <div className={styles.field} style={{ gridColumn: 'span 1' }}>
                                <label>CEP *</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="00000-000"
                                        value={formData.cep}
                                        onChange={handleCepChange}
                                        className={styles.input}
                                        required
                                    />
                                    {loading && <Loader2 className={styles.spinner} size={18} />}
                                </div>
                            </div>

                            <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                                <label>Logradouro / Rua *</label>
                                <input
                                    type="text"
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
                            <button type="submit" className={styles.submitBtn} disabled={saving || loading}>
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
