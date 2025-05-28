import React from 'react';
import { useRantStore } from './RantStore';
import { RantStoreContext } from './RantStoreContext';

export const RantStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const rantStore = useRantStore();
    return (
        <RantStoreContext.Provider value={rantStore}>
            {children}
        </RantStoreContext.Provider>
    );
};
