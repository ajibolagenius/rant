import create from 'zustand';

interface AdminState {
    filter: string;
    setFilter: (filter: string) => void;
    // Add more admin-only state/actions as needed
}

export const useAdminStore = create<AdminState>((set) => ({
    filter: '',
    setFilter: (filter) => set({ filter }),
}));
