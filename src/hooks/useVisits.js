import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useVisits(userId) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchForBusiness = useCallback(async (businessId) => {
    setLoading(true);
    const { data } = await supabase
      .from('visits')
      .select('*')
      .eq('business_id', businessId)
      .order('visit_date', { ascending: false });
    setVisits(data || []);
    setLoading(false);
    return data || [];
  }, []);

  const fetchRecent = useCallback(async (days = 7) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data } = await supabase
      .from('visits')
      .select('*, businesses(name, address, status)')
      .eq('user_id', userId)
      .gte('visit_date', since.toISOString().split('T')[0])
      .order('visit_date', { ascending: false });
    return data || [];
  }, [userId]);

  const addVisit = async (visit) => {
    const { data, error } = await supabase
      .from('visits')
      .insert([{ ...visit, user_id: userId }])
      .select()
      .single();
    if (!error) setVisits(prev => [data, ...prev]);
    return { data, error };
  };

  return { visits, loading, fetchForBusiness, fetchRecent, addVisit };
}
