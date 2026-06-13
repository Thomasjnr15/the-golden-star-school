import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import About from '@/components/About';
import News from '@/components/News';
import Admission from '@/components/Admission';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

interface SchoolSettings {
  school_name: string;
  tagline: string;
  logo: string | null;
}


// ── CTA BANNER ──────────────────────────────────────────────────────────
function CtaBanner({ settings, onApply }: { settings: SchoolSettings | null; onApply: () => void }) {
  const [cta, setCta] = useState<{ cta_heading: string | null; cta_sub: string | null } | null>(null);
  
  useEffect(() => {
    supabase.from('school_settings')
      .select('cta_heading,cta_sub')
      .eq('id', 1).single()
      .then(({ data }) => { if (data) setCta(data); });
  }, []);

  const FOREST = '#1B4332';
  const GOLD = '#B08D3C';
  
  return (
    <section style={{
      background: FOREST,
      padding: '56px clamp(20px,5vw,72px)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(176,141,60,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>🎓</div>
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(18px,3vw,28px)', fontWeight: 700,
              color: '#fff', lineHeight: 1.2, marginBottom: 4,
            }}>
              {cta?.cta_heading || "Begin Your Child\'s Journey With Us Today"}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              {cta?.cta_sub || 'Admission is open for the 2025/2026 academic session.'}
            </p>
          </div>
        </div>
        <button
          onClick={onApply}
          style={{
            padding: '14px 36px', borderRadius: 6,
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'transparent', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all .2s', flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.6)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)';
          }}
        >
          Apply for Admission →
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    supabase.from('school_settings')
      .select('school_name, tagline, logo')
      .eq('id', 1).single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 30);
      setShowTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home',      id: 'hero-top' },
    { label: 'About',     id: 'about' },
    { label: 'Academics', id: 'about' },
    { label: 'Admissions',id: 'admission' },
    { label: 'News',      id: 'news' },
    { label: 'Contact',   id: 'contact' },
  ];

  const schoolName = settings?.school_name || 'The Golden Star School';

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", background: '#fff', margin: 0, padding: 0 }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 clamp(20px,5vw,72px)',
        height: scrolled ? '64px' : '76px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(90,72,40,0.12)' : 'none',
        boxShadow: scrolled ? '0 2px 32px rgba(0,0,0,0.07)' : 'none',
        transition: 'all .4s ease',
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #2D5016, #4A7C28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 3px 14px rgba(45,80,22,0.35)',
            overflow: 'hidden',
          }}>
            {settings?.logo
              ? <img src={settings.logo} alt="School logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : '⭐'}
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 17, fontWeight: 700,
              color: '#1A2E0A',
              letterSpacing: 0.3, transition: 'color .3s',
            }}>
              {schoolName}
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10, fontWeight: 400,
              color: '#7C6540',
              letterSpacing: '1.8px', textTransform: 'uppercase',
              transition: 'color .3s',
            }}>
              {settings?.tagline || 'Excellence in Education'}
            </div>
          </div>
        </a>

        {/* Desktop links */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: 2, listStyle: 'none', margin: 0, padding: 0 }}
          className="hidden md:flex">
          {navLinks.map(l => (
            <li key={l.id}>
              <button onClick={() => scrollTo(l.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(26,46,10,0.7)',
                fontSize: 13.5, fontWeight: 500,
                padding: '7px 15px', borderRadius: 8,
                transition: 'all .2s',
              }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.color = '#2D5016';
                  (e.target as HTMLElement).style.background = 'rgba(45,80,22,0.08)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.color = 'rgba(26,46,10,0.7)';
                  (e.target as HTMLElement).style.background = 'none';
                }}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setLocation('/student-login')} style={{
            padding: '8px 18px', borderRadius: 100,
            border: '1.5px solid rgba(45,80,22,0.4)',
            color: '#2D5016',
            background: 'transparent',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
            cursor: 'pointer', transition: 'all .25s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = scrolled ? 'rgba(45,80,22,0.08)' : 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            Login
          </button>
          <button onClick={() => scrollTo('admission')} style={{
            padding: '9px 22px', borderRadius: 100,
            background: '#2D5016',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 3px 16px rgba(45,80,22,0.4)',
            transition: 'all .25s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#4A7C28';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#2D5016';
              (e.currentTarget as HTMLElement).style.transform = 'none';
            }}>
            Apply Now
          </button>
          {/* Hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              gap: 5, padding: '4px 6px', marginLeft: 2,
            }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', height: 2, borderRadius: 2,
                background: '#2D5016',
                transition: 'all .3s',
                width: i === 2 ? 14 : 22,
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
                  : i === 1 ? 'rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 2 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99,
        background: '#F7F4EE',
        display: 'flex', flexDirection: 'column',
        padding: '100px 32px 40px',
        gap: 4,
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
      }}>
        {navLinks.map((l, i) => (
          <button key={l.id} onClick={() => scrollTo(l.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Cormorant Garamond', serif",
            color: '#1A2E0A', fontSize: 32, fontWeight: 700,
            padding: '14px 0', textAlign: 'left',
            borderBottom: '1px solid rgba(45,80,22,0.1)',
            transition: 'color .2s',
            animationDelay: `${i * 0.05}s`,
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = '#2D5016'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = '#1A2E0A'; }}>
            {l.label}
          </button>
        ))}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => { setLocation('/student-login'); setMenuOpen(false); }} style={{
            padding: '15px', borderRadius: 100,
            border: '1.5px solid rgba(45,80,22,0.4)',
            color: '#2D5016', background: 'transparent',
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Student Login</button>
          <button onClick={() => scrollTo('admission')} style={{
            padding: '15px', borderRadius: 100,
            background: '#2D5016', color: '#fff',
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
            border: 'none', cursor: 'pointer',
          }}>Apply Now</button>
        </div>
      </div>

      {/* ── PAGE SECTIONS ── */}
      <main>
        <Hero />
        <About />
        <News />
        <Admission />
        <Contact />
        <CtaBanner settings={settings} onApply={() => scrollTo('admission')} />
      </main>
      <Footer />

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 99,
          width: 48, height: 48, borderRadius: '50%',
          background: '#2D5016',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(45,80,22,0.4)',
          fontSize: 18, color: '#fff',
          transition: 'all .3s',
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? 'auto' : 'none',
          transform: showTop ? 'scale(1)' : 'scale(0.8)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
        ↑
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #F7F4EE; }
      `}</style>
    </div>
  );
}
