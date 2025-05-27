import { useState, useEffect } from 'react';
import { Rant } from '@/lib/types/rant';
import { supabase } from '@/lib/supabase';

export const useRelatedRants = (rant: Rant, isModalOpen: boolean) => {
    const [relatedRants, setRelatedRants] = useState<Rant[]>([]);

    useEffect(() => {
        if (!isModalOpen) return;

        const fetchRelatedRants = async () => {
            const { data } = await supabase
                .from('rants')
                .select('*')
                .eq('mood', rant.mood)
                .neq('id', rant.id)
                .order('created_at', { ascending: false })
                .limit(4);

            setRelatedRants(data || []);
        };

        fetchRelatedRants();
    }, [rant, isModalOpen]);

    return relatedRants;
};
