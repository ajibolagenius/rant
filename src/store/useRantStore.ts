import { useContext } from 'react';
import { RantStoreContext } from './RantStore';

export function useRantStore() {
  const context = useContext(RantStoreContext);
  if (!context) {
    throw new Error('useRantStore must be used within a RantStoreProvider');
  }
  return context;
}
