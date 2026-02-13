'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('GLOBAL ERROR:', error);
    }, [error]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Algo deu errado!</h2>
            <p>{error.message}</p>
            <button
                onClick={() => reset()}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: '#6366F1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Tentar novamente
            </button>
        </div>
    );
}
