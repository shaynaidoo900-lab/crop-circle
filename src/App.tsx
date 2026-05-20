import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FieldsPage } from '@/pages/FieldsPage';
import { FieldDetailPage } from '@/pages/FieldDetailPage';
import { AIInsightsPage } from '@/pages/AIInsightsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { MobileNav } from '@/components/MobileNav';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import './index.css';

function AuthHandler() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(data);
      }
    });
  }, [setUser]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthHandler />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fields" element={<FieldsPage />} />
        <Route path="/fields/:id" element={<FieldDetailPage />} />
        <Route path="/fields/new" element={<FieldDetailPage />} />
        <Route path="/ai-insights" element={<AIInsightsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Mobile bottom navigation - shows on authenticated pages */}
      <MobileNav />
    </BrowserRouter>
  );
}

export default App;