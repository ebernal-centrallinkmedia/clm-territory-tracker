import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBusinesses(userId) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setBusinesses(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (business) => {
    const { data, error } = await supabase
      .from('businesses')
      .insert([{ ...business, user_id: userId }])
      .select()
      .single();
    if (!error) setBusinesses(prev => [data, ...prev]);
    return { data, error };
  };

  const update = async (id, updates) => {
    const { data, error } = await supabase
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error) setBusinesses(prev => prev.map(b => b.id === id ? data : b));
    return { data, error };
  };

  const remove = async (id) => {
    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (!error) setBusinesses(prev => prev.filter(b => b.id !== id));
    return { error };
  };

  return { businesses, loading, error, refetch: fetch, add, update, remove };
}
