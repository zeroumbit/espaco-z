'use client';

import { Space } from '@/types';
import { AMENITIES } from '@/lib/constants';
import styles from './AmenityList.module.css';

interface AmenityListProps {
    amenities: string[];
}

export default function AmenityList({ amenities }: AmenityListProps) {
    if (!amenities || amenities.length === 0) return null;

    // Filtrar apenas as amenities que existem na constante global
    const availableAmenities = AMENITIES.filter(a => amenities.includes(a.id));

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>O que esse lugar oferece</h3>
            <div className={styles.grid}>
                {availableAmenities.map((amenity) => (
                    <div key={amenity.id} className={styles.item}>
                        <span className={styles.icon}>{amenity.icon}</span>
                        <span className={styles.label}>{amenity.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
