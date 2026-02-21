'use client';

import { useState, useEffect } from 'react';
import { buscarEnderecoPorCep } from '@/lib/location';
import { LocationData } from '@/types/location';
import { Loader2, Search, MapPin, Navigation } from 'lucide-react';
import styles from './AddressForm.module.css';

interface AddressFormProps {
    onAddressChange: (data: LocationData) => void;
    initialData?: Partial<LocationData>;
    showMapRef?: boolean;
}

export default function AddressForm({ onAddressChange, initialData }: AddressFormProps) {
    const [loading, setLoading] = useState(false);
    const [cep, setCep] = useState(initialData?.cep || '');
    const [error, setError] = useState('');
    
    const [address, setAddress] = useState<LocationData>({
        cep: initialData?.cep || '',
        street: initialData?.street || '',
        neighborhood: initialData?.neighborhood || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        number: initialData?.number || '',
        complement: initialData?.complement || '',
        latitude: initialData?.latitude,
        longitude: initialData?.longitude
    });

    // Máscara de CEP 00000-000
    const applyCepMask = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 9);
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedValue = applyCepMask(e.target.value);
        setCep(maskedValue);
        setError('');
        
        // Se completou o CEP (8 dígitos + hífen)
        if (maskedValue.replace(/\D/g, '').length === 8) {
            handleFetchAddress(maskedValue);
        }
    };

    const handleFetchAddress = async (cepInput: string) => {
        setLoading(true);
        setError('');
        
        const data = await buscarEnderecoPorCep(cepInput);
        
        if (data) {
            const updatedAddress = {
                ...address,
                ...data,
                cep: cepInput.replace(/\D/g, '')
            };
            setAddress(updatedAddress);
            onAddressChange(updatedAddress);
        } else {
            setError('CEP não encontrado. Verifique os números.');
        }
        setLoading(false);
    };

    const handleFieldChange = (field: keyof LocationData, value: string) => {
        const updatedAddress = { ...address, [field]: value };
        setAddress(updatedAddress);
        onAddressChange(updatedAddress);
    };

    return (
        <div className={styles.container}>
            <div className={styles.sectionTitle}>
                <h3>📍 Localização do Imóvel</h3>
                <p>O endereço completo ajuda na valorização do seu anúncio.</p>
            </div>

            <div className={styles.addressGrid}>
                {/* Linha 1: CEP */}
                <div className={styles.field} style={{ gridColumn: 'span 1' }}>
                    <label className={styles.label}>CEP</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            value={cep}
                            onChange={handleCepChange}
                            placeholder="00000-000"
                            className={`${styles.input} ${error ? styles.inputError : ''}`}
                            disabled={loading}
                        />
                        {loading ? (
                            <Loader2 className={styles.spinner} size={18} />
                        ) : (
                            <Search className={styles.inputIcon} size={18} />
                        )}
                    </div>
                    {error && <span className={styles.errorText}>{error}</span>}
                </div>

                {/* Linha 2: Rua */}
                <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.label}>Logradouro / Rua</label>
                    <input
                        type="text"
                        value={address.street}
                        onChange={(e) => handleFieldChange('street', e.target.value)}
                        placeholder="Rua, Avenida, etc"
                        className={styles.input}
                        disabled={loading}
                    />
                </div>

                {/* Linha 3: Número e Complemento */}
                <div className={styles.field}>
                    <label className={styles.label}>Número</label>
                    <input
                        type="text"
                        value={address.number}
                        onChange={(e) => handleFieldChange('number', e.target.value)}
                        placeholder="123"
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Complemento</label>
                    <input
                        type="text"
                        value={address.complement}
                        onChange={(e) => handleFieldChange('complement', e.target.value)}
                        placeholder="Apt, Bloco, etc"
                        className={styles.input}
                    />
                </div>

                {/* Linha 4: Bairro */}
                <div className={styles.field} style={{ gridColumn: 'span 1' }}>
                    <label className={styles.label}>Bairro</label>
                    <input
                        type="text"
                        value={address.neighborhood}
                        onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                        className={styles.input}
                        disabled={loading}
                    />
                </div>

                {/* Linha 4: Cidade e UF (ReadOnly preenchido pelo CEP) */}
                <div className={styles.field}>
                    <label className={styles.label}>Cidade / UF</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            value={address.city ? `${address.city} - ${address.state}` : ''}
                            readOnly
                            placeholder="Automático pelo CEP"
                            className={`${styles.input} ${styles.inputReadOnly}`}
                        />
                        <Navigation className={styles.inputIcon} size={18} />
                    </div>
                </div>
            </div>

            {address.latitude && (
                <div className={styles.geoBadge}>
                    <MapPin size={14} />
                    <span>Coordenadas capturadas com sucesso (BrasilAPI)</span>
                </div>
            )}
        </div>
    );
}
