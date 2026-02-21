'use client';

import { useState, useEffect } from 'react';
import { buscarEstadosIBGE, buscarCidadesPorEstadoIBGE } from '@/lib/location';
import { IBGEState, IBGECity } from '@/types/location';
import { Loader2, MapPin } from 'lucide-react';
import styles from './StateCitySelect.module.css';

interface StateCitySelectProps {
    selectedState: string;
    selectedCity: string;
    onStateChange: (state: string) => void;
    onCityChange: (city: string) => void;
    error?: string;
    labelState?: string;
    labelCity?: string;
}

export default function StateCitySelect({
    selectedState,
    selectedCity,
    onStateChange,
    onCityChange,
    error,
    labelState = "Estado (UF)",
    labelCity = "Cidade"
}: StateCitySelectProps) {
    const [states, setStates] = useState<IBGEState[]>([]);
    const [cities, setCities] = useState<IBGECity[]>([]);
    const [loadingStates, setLoadingStates] = useState(true);
    const [loadingCities, setLoadingCities] = useState(false);

    // Carregar estados ao montar
    useEffect(() => {
        async function loadStates() {
            setLoadingStates(true);
            const data = await buscarEstadosIBGE();
            setStates(data);
            setLoadingStates(false);
        }
        loadStates();
    }, []);

    // Carregar cidades quando o estado muda
    useEffect(() => {
        async function loadCities() {
            if (!selectedState) {
                setCities([]);
                return;
            }
            setLoadingCities(true);
            const data = await buscarCidadesPorEstadoIBGE(selectedState);
            setCities(data);
            setLoadingCities(false);
        }
        loadCities();
    }, [selectedState]);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newState = e.target.value;
        onStateChange(newState);
        onCityChange(''); // Limpa a cidade ao mudar o estado
    };

    return (
        <div className={styles.container}>
            <div className={styles.selectGroup}>
                <div className={styles.field}>
                    <label className={styles.label}>{labelState}</label>
                    <div className={styles.selectWrapper}>
                        <select
                            value={selectedState}
                            onChange={handleStateChange}
                            className={`${styles.select} ${error ? styles.selectError : ''}`}
                            disabled={loadingStates}
                        >
                            <option value="">Selecione seu Estado</option>
                            {states.map((s) => (
                                <option key={s.id} value={s.sigla}>
                                    {s.nome} ({s.sigla})
                                </option>
                            ))}
                        </select>
                        {loadingStates && <Loader2 className={styles.spinner} size={18} />}
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{labelCity}</label>
                    <div className={styles.selectWrapper}>
                        <select
                            value={selectedCity}
                            onChange={(e) => onCityChange(e.target.value)}
                            className={`${styles.select} ${error ? styles.selectError : ''}`}
                            disabled={loadingCities || !selectedState}
                        >
                            <option value="">
                                {!selectedState ? "Selecione o estado antes" : "Selecione sua Cidade"}
                            </option>
                            {cities.map((c) => (
                                <option key={c.id} value={c.nome}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>
                        {loadingCities && <Loader2 className={styles.spinner} size={18} />}
                        {!loadingCities && <MapPin className={styles.inputIcon} size={18} />}
                    </div>
                </div>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
}
