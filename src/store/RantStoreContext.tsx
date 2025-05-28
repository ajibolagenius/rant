import { createContext, useContext } from 'react';
import { useRantStore } from './RantStore';

export const RantStoreContext = createContext<ReturnType<typeof useRantStore> | null>(null);

export const useRantStoreContext = () => {
    const context = useContext(RantStoreContext);
    if (!context) {
        throw new Error('useRantStoreContext must be used within a RantStoreProvider');
    }
    return context;
};
