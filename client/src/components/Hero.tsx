import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface HeroSettings {
  hero_heading: string;
  hero_subheading: string;
  hero_image: string | null;
  hero_image_2: string | null;
  hero_cta_label: string | null;
  hero_cta_label2: string | null;
  students_count: string | null;
  teachers_count: string | null;
  years_count: string | null;
  awards_count: string | null;
}

export default function Hero() {
  const [s, setS] = useState<HeroSettings | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from('school_settings')
      .select('hero_heading,hero_subheading,hero_image,hero_image_2,hero_cta_label,hero_cta_label2,students_count,teachers_count,years_count,awards_count')
      .eq('id', 1).single()
      .then(({ data }) => { if (data) setS(data); setLoaded(true); });
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    s?.students_count ? { num: s.students_count, label: 'Students' } : null,
    s?.teachers_count ? { num: s.teachers_count, label: 'Qualified Teachers' } : null,
    s?.awards_count   ? { num: s.awards_count,   label: 'Awards Won' } : null,
  ].filter(Boolean) as { num: string; label: string }[];

  // Split heading at period or newline for the gold-line effect
  const heading = s?.hero_heading || 'Nurturing Minds.\nBuilding Futures.';
  const lines = heading.split(/\n/);

  const FOREST = '#1B4332';
  const GOLD   = '#B08D3C';

  return (
    <section style={{
      minHeight: '90vh',
      paddingTop: 76,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
      background: '#fff',
    }}>
      {/* Content grid */}
      <div style={{
        flex: 1,
        maxWidth: 1240,
        margin: '0 auto',
        width: '100%',
        padding: '60px clamp(20px,5vw,72px) 48px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}
        className="hero-grid"
      >
        {/* LEFT: text */}
        <div style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'none' : 'translateY(28px)',
          transition: 'opacity .8s ease, transform .8s ease',
        }}>
          {/* Eyebrow */}
          <div style={{
            fontSize: 12, fontWeight: 600, color: FOREST,
            letterSpacing: '2.5px', textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Welcome to Golden Star School
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(40px,5.5vw,72px)',
            fontWeight: 700,
            lineHeight: 1.08,
            color: FOREST,
            marginBottom: 24,
            letterSpacing: '-1px',
          }}>
            {lines.map((line, i) => (
              <span key={i} style={{ display: 'block', color: i === 1 ? GOLD : FOREST }}>
                {line}
              </span>
            ))}
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 16,
            color: '#4A5568',
            lineHeight: 1.8,
            fontWeight: 300,
            marginBottom: 40,
            maxWidth: 480,
          }}>
            {s?.hero_subheading ||
              'A great place to learn, a better place to grow. Empowering students to excel academically, lead confidently, and impact the world.'}
          </p>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 52 }}>
            <button
              onClick={() => document.getElementById('admission')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '13px 32px', borderRadius: 6,
                background: FOREST, color: '#fff',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                transition: 'background .2s',
                letterSpacing: '0.2px',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2D6A4F'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = FOREST; }}
            >
              {s?.hero_cta_label || 'Apply for Admission'} →
            </button>
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '12px 28px', borderRadius: 6,
                border: `1.5px solid ${FOREST}`,
                background: 'transparent',
                color: FOREST,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 500,
                cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f7f3'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {s?.hero_cta_label2 || 'Learn More'}
            </button>
          </div>

          {/* Stats — only shown if admin configured them */}
          {stats.length > 0 && (
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {stats.map((st, i) => (
                <div key={st.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#f0f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {i === 0 ? '🎓' : i === 1 ? '📖' : '🏆'}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 26, fontWeight: 700, color: FOREST, lineHeight: 1,
                    }}>{st.num}</div>
                    <div style={{ fontSize: 11, color: '#718096', letterSpacing: '0.5px', marginTop: 2 }}>{st.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: hero image */}
        <div style={{
          position: 'relative',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'none' : 'translateY(28px)',
          transition: 'opacity .9s ease .15s, transform .9s ease .15s',
        }}>
          <div style={{
            borderRadius: 12,
            overflow: 'hidden',
            aspectRatio: '4/3',
            background: '#e8f5e9',
            position: 'relative',
          }}>
            {s?.hero_image ? (
              <img
                src={s.hero_image}
                alt="School hero"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
                color: FOREST, fontSize: 14, fontWeight: 600,
                gap: 10,
              }}>
                <div style={{ fontSize: 48 }}>🏫</div>
                <div>Add hero image in Admin → Settings → Content</div>
              </div>
            )}

            {/* Floating badge */}
            {s?.hero_image && (
              <div style={{
                position: 'absolute', bottom: 20, left: 20,
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 10, padding: '10px 16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: FOREST }}>Admissions Open 2025/2026</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @media(max-width:768px){
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
