import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, FlaskConical,
  Brain, BarChart2, FileText, Newspaper, CreditCard, Settings2,
  GraduationCap, ChevronRight, LogOut, Menu, X, TrendingUp,
} from 'lucide-react';

import ManageStudents from '@/admin/ManageStudents';
import ManageExams from '@/admin/ManageExams';
import ManageNews from '@/admin/ManageNews';
import ManagePayments from '@/admin/ManagePayments';
import RegistrationRequests from '@/admin/RegistrationRequests';
import Settings from '@/admin/Settings';
import ResultsManager from '@/admin/ResultsManager';
import ReportCardManager from '@/admin/ReportCardManager';
import AIQuestionGenerator from '@/admin/AIQuestionGenerator';
import ManageSubjects from '@/admin/ManageSubjects';
import PromoteStudents from '@/admin/PromoteStudents';

const NAV = [
  { id: 'overview',       label: 'Overview',         icon: LayoutDashboard },
  { id: 'registrations',  label: 'Admissions',        icon: ClipboardList },
  { id: 'students',       label: 'Students',          icon: Users },
  { id: 'promotions',     label: 'Promotions',        icon: TrendingUp },
  { id: 'subjects',       label: 'Subjects',          icon: BookOpen },
  { id: 'exams',          label: 'Exams',             icon: FlaskConical },
  { id: 'questions',      label: 'AI Questions',      icon: Brain },
  { id: 'results',        label: 'Results',           icon: BarChart2 },
  { id: 'reports',        label: 'Report Cards',      icon: FileText },
  { id: 'news',           label: 'News',              icon: Newspaper },
  { id: 'payments',       label: 'Payments',          icon: CreditCard },
  { id: 'settings',       label: 'Settings',          icon: Settings2 },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, role, isLoading = false } = useAuth();
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ students: '…', exams: '…', pending: '…', payments: '…' });
  const [schoolName, setSchoolName] = useState('Golden Star School');

  // Guard: wait for auth to resolve before checking role to avoid race condition
  if (isLoading || role === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTop: '3px solid #1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: '#718096' }}>Loading dashboard…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (role !== 'admin') { setLocation('/'); return null; }

  useEffect(() => {
    const fetchStats = async () => {
      const [s, e, p, pay, sett] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('school_settings').select('school_name').eq('id', 1).single(),
      ]);
      const total = (pay.data || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
      setStats({
        students: String(s.count ?? 0),
        exams: String(e.count ?? 0),
        pending: String(p.count ?? 0),
        payments: `₦${total.toLocaleString()}`,
      });
      if (sett.data?.school_name) setSchoolName(sett.data.school_name);
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try { await logout(); setLocation('/'); toast.success('Logged out'); }
    catch { toast.error('Logout failed'); }
  };

  const navItem = (item: typeof NAV[0], mobile = false) => {
    const Icon = item.icon;
    const isActive = active === item.id;
    return (
      <button
        key={item.id}
        onClick={() => { setActive(item.id); if (mobile) setMobileSidebarOpen(false); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', padding: sidebarOpen ? '10px 16px' : '10px 0',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          borderRadius: 10, border: 'none', cursor: 'pointer',
          background: isActive ? 'rgba(168,216,120,0.15)' : 'transparent',
          color: isActive ? '#A8D878' : 'rgba(247,244,238,0.55)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13.5, fontWeight: isActive ? 600 : 400,
          transition: 'all .2s', textAlign: 'left',
          borderLeft: isActive ? '3px solid #A8D878' : '3px solid transparent',
          marginLeft: sidebarOpen ? 0 : 0,
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#F7F4EE'; }}
        onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(247,244,238,0.55)'; } }}
        title={!sidebarOpen ? item.label : undefined}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
        {(sidebarOpen || mobile) && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
        {sidebarOpen && isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
      </button>
    );
  };

  // Sidebar content shared between desktop + mobile
  const sidebarContent = (mobile = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2D5016,#4A7C28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⭐</div>
          {(sidebarOpen || mobile) && (
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: '#F7F4EE', lineHeight: 1.2 }}>{schoolName}</div>
              <div style={{ fontSize: 10, color: 'rgba(247,244,238,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Admin Portal</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => navItem(item, mobile))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {(sidebarOpen || mobile) && (
          <div style={{ padding: '8px 10px', marginBottom: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#F7F4EE', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Administrator'}</div>
            <div style={{ fontSize: 11, color: 'rgba(247,244,238,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '9px 10px',
          justifyContent: (sidebarOpen || mobile) ? 'flex-start' : 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(247,244,238,0.45)', borderRadius: 8, transition: 'all .2s',
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,50,50,0.1)'; (e.currentTarget as HTMLElement).style.color = '#FC8181'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(247,244,238,0.45)'; }}>
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {(sidebarOpen || mobile) && 'Logout'}
        </button>
      </div>
    </div>
  );

  const SIDEBAR_W = sidebarOpen ? 240 : 64;

  const overviewCards = [
    { label: 'Total Students',     value: stats.students, icon: Users,        color: '#A8D878' },
    { label: 'Active Exams',        value: stats.exams,    icon: FlaskConical, color: '#7BBFEA' },
    { label: 'Pending Admissions',  value: stats.pending,  icon: ClipboardList,color: '#F6AD55' },
    { label: 'Fees Collected',      value: stats.payments, icon: CreditCard,   color: '#F687B3' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F4EE', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0,
        background: '#0F1F06',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        transition: 'width .25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
        className="hidden md:flex">
        {sidebarContent()}
      </aside>

      {/* ── MOBILE OVERLAY SIDEBAR ── */}
      {mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileSidebarOpen(false)} />
          <aside style={{
            width: 260, background: '#0F1F06',
            position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column',
          }}>
            <button onClick={() => setMobileSidebarOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(247,244,238,0.5)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft: SIDEBAR_W, flex: 1, minWidth: 0, transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)' }}
        className="md:block">

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(247,244,238,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(45,80,22,0.1)',
          padding: '0 24px',
          height: 60, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2D5016' }}
              className="md:hidden">
              <Menu size={22} />
            </button>
            {/* Desktop sidebar toggle */}
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#4A7C28' }}
              className="hidden md:block"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: '#1A2E0A', lineHeight: 1.2 }}>
                {NAV.find(n => n.id === active)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#4A7C28', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <GraduationCap size={14} />
            {user?.full_name || 'Admin'}
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '28px 24px', minHeight: 'calc(100vh - 60px)' }}>
          {active === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {overviewCards.map(({ label, value, icon: Icon, color }) => (
                  <Card key={label} style={{ border: '1px solid rgba(45,80,22,0.1)', borderRadius: 16, overflow: 'hidden' }}>
                    <CardHeader style={{ paddingBottom: 8 }}>
                      <CardTitle style={{ fontSize: 12, color: '#718096', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {label}
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: '#1A2E0A', lineHeight: 1 }}>{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card style={{ border: '1px solid rgba(45,80,22,0.1)', borderRadius: 16 }}>
                <CardContent style={{ padding: 28 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#1A2E0A', marginBottom: 6 }}>Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'} 👋</p>
                  <p style={{ color: '#718096', fontSize: 14 }}>Select a module from the sidebar to get started. All school management tools are accessible from the left panel.</p>
                </CardContent>
              </Card>
            </div>
          )}
          {active === 'registrations' && <RegistrationRequests />}
          {active === 'students'      && <ManageStudents />}
          {active === 'promotions'    && <PromoteStudents />}
          {active === 'subjects'      && <ManageSubjects />}
          {active === 'exams'         && <ManageExams />}
          {active === 'questions'     && <AIQuestionGenerator />}
          {active === 'results'       && <ResultsManager />}
          {active === 'reports'       && <ReportCardManager />}
          {active === 'news'          && <ManageNews />}
          {active === 'payments'      && <ManagePayments />}
          {active === 'settings'      && <Settings />}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}
