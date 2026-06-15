import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState('The Golden Star School');

  useEffect(() => {
    supabase
      .from('school_settings')
      .select('logo,school_name')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.logo) setSchoolLogo(data.logo);
        if (data?.school_name) setSchoolName(data.school_name);
      });
  }, []);

  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.user && result.user.role === 'admin') {
        toast.success('Welcome back!');
        setLocation('/admin/dashboard');
      } else {
        toast.error('Invalid credentials or insufficient permissions.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans',system-ui,sans-serif" }}>

      {/* LEFT PANEL */}
      <div
        style={{
          width: '42%',
          background: '#1A2E0A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 40% 40%, rgba(74,124,40,.25) 0%, transparent 65%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '200px', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#F7F4EE' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#2D5016,#4A7C28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(45,80,22,.5)',
            }}
          >
            {schoolLogo ? (
              <img src={schoolLogo} alt={schoolName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : '⭐'}
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 32, fontWeight: 700, lineHeight: 1.15, marginBottom: 12 }}>
            Admin<br />
            <em style={{ fontStyle: 'italic', color: '#A8D878' }}>Portal</em>
          </h1>

          <p style={{ fontSize: 14, color: 'rgba(247,244,238,.5)', lineHeight: 1.7, maxWidth: 240, margin: '0 auto 36px' }}>
            School management tools for administrators only.
          </p>

          {[
            ['👥', 'Manage Students & Admissions'],
            ['📋', 'Create & Manage Exams'],
            ['💳', 'Track Payments'],
            ['⚙️', 'Configure School Settings'],
          ].map(([icon, label]) => (
            <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,216,120,.1)', border: '1px solid rgba(168,216,120,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                {icon}
              </div>
              <span style={{ fontSize: 13.5, color: 'rgba(247,244,238,.65)', fontWeight: 400 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div className="flex lg:hidden" style={{ justifyContent: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#2D5016,#4A7C28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              {schoolLogo ? (
                <img src={schoolLogo} alt={schoolName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : '⭐'}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#4A7C28', marginBottom: 8 }}>
              <Shield size={12} />
              Administrator Access
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 34, fontWeight: 700, color: '#1A2E0A', lineHeight: 1.1, marginBottom: 6 }}>
              Admin Sign In
            </h2>
            <p style={{ fontSize: 14, color: '#718096' }}>Enter your admin email and password</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <Label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2D3748', marginBottom: 6 }}>
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.edu.ng"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ borderColor: 'rgba(45,80,22,.2)', borderRadius: 10, padding: '11px 14px', fontSize: 14, transition: 'all .2s' }}
                className="gss-input"
              />
            </div>

            <div>
              <Label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2D3748', marginBottom: 6 }}>
                Password
              </Label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ borderColor: 'rgba(45,80,22,.2)', borderRadius: 10, padding: '11px 44px 11px 14px', fontSize: 14, transition: 'all .2s', width: '100%' }}
                  className="gss-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#718096', padding: 2, display: 'flex', cursor: 'pointer' }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLoading}
              className="gss-btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading || isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="animate-spin-slow" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' }} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              onClick={() => setLocation('/')}
              style={{ fontSize: 13, color: '#718096', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Back to main website
            </button>
          </div>

        </div>
      </div>
    </div>
  );
  }
