import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { cache } from '../cache';
import { useRouter } from 'next/navigation';

export type DashboardData = {
  profile: any;
  menuUrl: string;
  error: string | null;
  isLoading: boolean;
};

const CACHE_KEYS = {
  PROFILE: 'dashboard_profile',
  MENU: 'dashboard_menu',
};

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    profile: null,
    menuUrl: '',
    error: null,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // Check session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/auth/welcome');
          return;
        }

        // Try to get cached data first
        const cachedProfile = cache.get(CACHE_KEYS.PROFILE);
        const cachedMenu = cache.get(CACHE_KEYS.MENU);

        // Parallel data fetching for non-cached data
        const [profileResult, menuResult] = await Promise.all([
          !cachedProfile ? supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single() : null,
          !cachedMenu ? fetch('/api/getMenuUrl').then(res => res.json()) : null,
        ]);

        // Use cached data or new data
        const profile = cachedProfile || profileResult?.data;
        const menuUrl = cachedMenu || menuResult?.currentMenu?.url;

        if (profile) {
          cache.set(CACHE_KEYS.PROFILE, profile);
        }
        if (menuUrl) {
          cache.set(CACHE_KEYS.MENU, menuUrl);
        }

        setData({
          profile,
          menuUrl,
          error: null,
          isLoading: false,
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setData(prev => ({
          ...prev,
          error: 'Failed to load dashboard data',
          isLoading: false,
        }));
      }
    }

    fetchData();
  }, [router]);

  return data;
} 