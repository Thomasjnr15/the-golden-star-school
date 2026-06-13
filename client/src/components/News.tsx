import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface NewsItem { id: number; title: string; description: string; date: string; image_url: string | null; }

const EMOJIS = ['📣','🏆','📚','🎓','💻','👨‍👩‍👧'];
const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    supabase.from('news').select('*').order('date', { ascending: false }).limit(3)
      .then(({ data }) => { if (data?.length) setNews(data); });

    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    const el = document.getElementById('news');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);



  if (news.length === 0) return null;

  return (
    <section id="news" style={{
      padding: '120px clamp(24px,5vw,80px)',
      background: '#F0F5EB',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -80, left: -80,
        width: 300, height: 300, borderRadius: '50%',
        border: '1px solid rgba(74,124,40,0.1)', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: -40, left: -40,
        width: 180, height: 180, borderRadius: '50%',
        border: '1px solid rgba(74,124,40,0.08)', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 56, flexWrap: 'wrap', gap: 20,
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
          transition: 'opacity .7s, transform .7s',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 600, letterSpacing: '2px',
              textTransform: 'uppercase', color: '#4A7C28', marginBottom: 12,
            }}>
              <div style={{ width: 28, height: 1.5, background: '#4A7C28' }} />
              Latest News
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(30px,4vw,50px)', fontWeight: 700,
              color: '#1A2E0A', letterSpacing: '-0.5px', lineHeight: 1.1,
            }}>
              School <em style={{ fontStyle: 'italic', color: '#4A7C28' }}>Updates</em>
            </h2>
          </div>
        </div>

        {/* News grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {news.map((item, i) => (
            <article key={item.id} style={{
              background: '#fff',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(45,80,22,0.08)',
              transition: 'transform .3s, box-shadow .3s',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transitionDelay: `${i * 0.1}s`,
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(45,80,22,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}>
              {/* Top band */}
              <div style={{
                height: 6,
                background: i === 0
                  ? 'linear-gradient(to right, #2D5016, #6AAF30)'
                  : i === 1
                  ? 'linear-gradient(to right, #7C6540, #C9960A)'
                  : 'linear-gradient(to right, #4A2E1A, #9C6040)',
              }} />
              <div style={{ padding: '28px 28px 32px' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>
                  {item.image_url
                    ? <img src={item.image_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10 }} />
                    : EMOJIS[i % EMOJIS.length]}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '1.5px', color: '#4A7C28', marginBottom: 10,
                }}>
                  {fmt(item.date)}
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 700, color: '#1A2E0A',
                  lineHeight: 1.25, marginBottom: 12,
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.7, fontWeight: 300 }}>
                  {item.description.length > 160
                    ? item.description.slice(0, 160) + '…'
                    : item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
