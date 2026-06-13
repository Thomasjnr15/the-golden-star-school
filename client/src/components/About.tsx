import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AboutSettings {
  about_text: string | null;
  about_mission: string | null;
  about_vision: string | null;
  about_image: string | null;
  why_quality_title: string | null;
  why_quality_text: string | null;
  why_teachers_title: string | null;
  why_teachers_text: string | null;
  why_facilities_title: string | null;
  why_facilities_text: string | null;
  why_character_title: string | null;
  why_character_text: string | null;
  why_holistic_title: string | null;
  why_holistic_text: string | null;
  why_results_title: string | null;
  why_results_text: string | null;
  programs_heading: string | null;
  programs_sub: string | null;
  programs_jss_title: string | null;
  programs_jss_text: string | null;
  programs_jss_image: string | null;
  programs_sss_title: string | null;
  programs_sss_text: string | null;
  programs_sss_image: string | null;
}

const FOREST = '#1B4332';
const GOLD = '#B08D3C';
const LIGHT_GREEN = '#2D6A4F';

export default function About() {
  const [s, setS] = useState<AboutSettings | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    supabase.from('school_settings')
      .select([
        'about_text,about_mission,about_vision,about_image',
        'why_quality_title,why_quality_text,why_teachers_title,why_teachers_text',
        'why_facilities_title,why_facilities_text,why_character_title,why_character_text',
        'why_holistic_title,why_holistic_text,why_results_title,why_results_text',
        'programs_heading,programs_sub,programs_jss_title,programs_jss_text,programs_jss_image',
        'programs_sss_title,programs_sss_text,programs_sss_image',
      ].join(','))
      .eq('id', 1).single()
      .then(({ data }) => { if (data) setS(data as AboutSettings); });

    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    const el = document.getElementById('about');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const reveal = (delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(24px)',
    transition: `opacity .7s ease ${delay}s, transform .7s ease ${delay}s`,
  });

  const whyCards = [
    { icon: '🛡', title: s?.why_quality_title || 'Quality Education', text: s?.why_quality_text || 'We deliver a solid educational foundation that prepares students for the future.' },
    { icon: '👨‍🏫', title: s?.why_teachers_title || 'Experienced Teachers', text: s?.why_teachers_text || 'Our teachers are passionate, qualified, and committed to student success.' },
    { icon: '🏛', title: s?.why_facilities_title || 'Modern Facilities', text: s?.why_facilities_text || 'Learning in a safe, modern, and technology-driven environment.' },
    { icon: '🤝', title: s?.why_character_title || 'Character Building', text: s?.why_character_text || 'We nurture discipline, integrity, leadership, and strong values.' },
    { icon: '🌍', title: s?.why_holistic_title || 'Holistic Development', text: s?.why_holistic_text || 'We support academics, sports, creativity, and extra-curricular excellence.' },
    { icon: '🏆', title: s?.why_results_title || 'Proven Results', text: s?.why_results_text || 'Consistent outstanding performance in examinations and competitions.' },
  ];

  return (
    <>
      {/* ── WHY CHOOSE US ─────────────────────────────── */}
      <section id="about" style={{
        padding: '96px clamp(20px,5vw,72px)',
        background: '#fff',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ ...reveal(0), textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: LIGHT_GREEN, marginBottom: 10 }}>
              Why Choose Us
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700,
              color: FOREST, lineHeight: 1.15,
              marginBottom: 8,
            }}>
              Excellence in Every Detail
            </h2>
            <div style={{ width: 40, height: 3, background: GOLD, borderRadius: 4, margin: '0 auto', marginTop: 12 }} />
          </div>

          {/* 6-card grid */}
          <div style={{
            ...reveal(0.1),
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
          }}>
            {whyCards.map((c, i) => (
              <div key={i} style={{
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '28px 20px',
                textAlign: 'center',
                transition: 'box-shadow .25s, transform .25s',
                background: '#fff',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = '0 8px 32px rgba(27,67,50,0.1)';
                  el.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = 'none';
                  el.style.transform = 'none';
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#f0f7f3', margin: '0 auto 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: FOREST, marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.65 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ──────────────────────────────────── */}
      <section style={{
        padding: '96px clamp(20px,5vw,72px)',
        background: '#F9FAFB',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 56, alignItems: 'center' }}
          className="programs-grid">

          {/* Left */}
          <div style={reveal(0)}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: LIGHT_GREEN, marginBottom: 12 }}>
              Our Programs
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700,
              color: FOREST, lineHeight: 1.15, marginBottom: 16,
            }}>
              {s?.programs_heading || 'Strong Foundations.\nBright Futures.'}
            </h2>
            <div style={{ width: 40, height: 3, background: GOLD, borderRadius: 4, marginBottom: 20 }} />
            <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.75, marginBottom: 28 }}>
              {s?.programs_sub || 'We offer a balanced curriculum that meets national standards while preparing students for global opportunities.'}
            </p>
            <button
              onClick={() => document.getElementById('admission')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '12px 28px', borderRadius: 6,
                background: FOREST, color: '#fff',
                border: 'none', fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', transition: 'background .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = LIGHT_GREEN; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = FOREST; }}
            >
              Explore Academics →
            </button>
          </div>

          {/* Right: program cards */}
          <div style={{ ...reveal(0.1), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              {
                img: s?.programs_jss_image || null,
                icon: '📖',
                title: s?.programs_jss_title || 'Junior Secondary School',
                text: s?.programs_jss_text || 'Building a strong academic foundation with the right values and discipline.',
              },
              {
                img: s?.programs_sss_image || null,
                icon: '🎓',
                title: s?.programs_sss_title || 'Senior Secondary School',
                text: s?.programs_sss_text || 'Preparing future leaders for university, careers, and lifelong success.',
              },
            ].map((p, i) => (
              <div key={i} style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid #E2E8F0',
                background: '#fff',
                transition: 'box-shadow .25s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(27,67,50,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                {/* Image area */}
                <div style={{ height: 160, position: 'relative', background: '#e8f5e9', overflow: 'hidden' }}>
                  {p.img ? (
                    <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36, color: FOREST, background: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
                    }}>{p.icon}</div>
                  )}
                  {/* icon badge */}
                  <div style={{
                    position: 'absolute', bottom: 12, left: 12,
                    width: 40, height: 40, borderRadius: '50%',
                    background: FOREST,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>{p.icon}</div>
                </div>
                <div style={{ padding: '16px 18px 20px' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: FOREST, marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.65, marginBottom: 12 }}>{p.text}</div>
                  <button
                    onClick={() => document.getElementById('admission')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{
                      background: 'none', border: 'none', color: LIGHT_GREEN,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
                    }}
                  >
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          .programs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
