'use client';

import { useState } from 'react';
import CompleteAddressModal from './CompleteAddressModal/CompleteAddressModal';

interface OnboardingWrapperProps {
    tenant: {
        id: string;
        address_completed: boolean;
    } | null;
}

export default function OnboardingWrapper({ tenant }: OnboardingWrapperProps) {
    const [showModal, setShowModal] = useState(tenant !== null && !tenant.address_completed);

    if (!showModal || !tenant) return null;

    return (
        <CompleteAddressModal 
            tenantId={tenant.id} 
            onComplete={() => setShowModal(false)} 
        />
    );
}
