import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FooterSettings {
  school_name: string | null;
  tagline: string | null;
  logo: string | null;
  founded_year: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  whatsapp: string | null;
  about_text: string | null;
}

export default function Footer() {
  const [s, setS] = useState<FooterSettings | null>(null);

  useEffect(() => {
    supabase.from('school_settings')
      .select('school_name,tagline,logo,founded_year,contact_email,contact_phone,contact_address,facebook,instagram,twitter,youtube,whatsapp,about_text')
      .eq('id', 1).single()
      .then(({ data }) => { if (data) setS(data); });
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const schoolName  = s?.school_name  || 'The Golden Star School';
  const tagline     = s?.tagline      || 'Excellence in Education';
  const currentYear = new Date().getFullYear();

  const FOREST = '#1B4332';
  const SAGE   = '#A8D878';

  const socialLinks = [
    s?.facebook  && { label: 'f',  href: s.facebook,  title: 'Facebook' },
    s?.instagram && { label: '◈', href: s.instagram, title: 'Instagram' },
    s?.twitter   && { label: '𝕏', href: s.twitter,   title: 'Twitter / X' },
    s?.youtube   && { label: '▶', href: s.youtube,   title: 'YouTube' },
    s?.whatsapp  && { label: 'W',  href: `https://wa.me/${(s.whatsapp || '').replace(/\D/g, '')}`, title: 'WhatsApp' },
  ].filter(Boolean) as { label: string; href: string; title: string }[];

  const lnk: React.CSSProperties = {
    background: 'none', border: 'none', padding: 0,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13.5, color: 'rgba(255,255,255,0.55)',
    cursor: 'pointer', textAlign: 'left',
    transition: 'color .2s', textDecoration: 'none', display: 'block',
  };

  const SocialBtn = ({ label, href, title }: { label: string; href: string; title: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: 'rgba(255,255,255,0.7)',
        textDecoration: 'none', transition: 'all .2s',
        fontWeight: 700,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(168,216,120,0.2)';
        el.style.borderColor = 'rgba(168,216,120,0.4)';
        el.style.color = SAGE;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(255,255,255,0.07)';
        el.style.borderColor = 'rgba(255,255,255,0.1)';
        el.style.color = 'rgba(255,255,255,0.7)';
      }}
    >
      {label}
    </a>
  );

  return (
    <footer style={{
      background: '#0C1C10',
      padding: '72px clamp(24px,5vw,80px) 0',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle dot pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.025,
        backgroundImage: 'radial-gradient(rgba(168,216,120,1) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Top 4-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.4fr',
          gap: 48,
          paddingBottom: 56,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
          className="footer-grid">

          {/* ── Col 1: Brand ── */}
          <div>
            {/* Logo */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2D5016, #4A7C28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 18,
              boxShadow: '0 4px 20px rgba(45,80,22,0.5)',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {s?.logo
                ? <img src={s.logo} alt="School logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : '⭐'}
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
              {schoolName}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
              {tagline}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.8, marginBottom: 22 }}>
              {s?.about_text
                ? s.about_text.slice(0, 140) + (s.about_text.length > 140 ? '…' : '')
                : `Raising a generation of leaders through excellence in education and strong moral values.${s?.founded_year ? ` Est. ${s.founded_year}.` : ''}`}
            </p>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {socialLinks.map(sl => <SocialBtn key={sl.title} {...sl} />)}
              </div>
            )}
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', color: SAGE, marginBottom: 22 }}>
              Quick Links
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'About Us',    id: 'about' },
                { label: 'Academics',   id: 'about' },
                { label: 'Admissions',  id: 'admission' },
                { label: 'News',        id: 'news' },
                { label: 'Contact Us',  id: 'contact' },
              ].map(l => (
                <li key={l.label}>
                  <button onClick={() => scrollTo(l.id)} style={lnk}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = SAGE; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Programs ── */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', color: SAGE, marginBottom: 22 }}>
              Programs
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Junior Secondary',
                'Senior Secondary',
                'Co-Curricular',
                'Clubs & Societies',
                'School Life',
              ].map(l => (
                <li key={l}>
                  <button onClick={() => scrollTo('about')} style={lnk}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = SAGE; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}>
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Contact ── */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', color: SAGE, marginBottom: 22 }}>
              Contact Us
            </div>
            {[
              s?.contact_address && { icon: '📍', value: s.contact_address, href: null },
              s?.contact_phone   && { icon: '📞', value: s.contact_phone,   href: `tel:${s.contact_phone}` },
              s?.contact_email   && { icon: '✉',  value: s.contact_email,   href: `mailto:${s.contact_email}` },
            ].filter(Boolean).map((c: any) => (
              <div key={c.value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
                {c.href ? (
                  <a href={c.href} style={{ ...lnk, fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = SAGE; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}>
                    {c.value}
                  </a>
                ) : (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{c.value}</span>
                )}
              </div>
            ))}
            {!s?.contact_address && !s?.contact_phone && !s?.contact_email && (
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                Set contact details in<br />Admin → Settings → General
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '24px 0',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.22)' }}>
            © {currentYear} {schoolName}. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy Policy', 'Terms of Use'].map(label => (
              <button key={label} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12.5, color: 'rgba(255,255,255,0.22)',
                fontFamily: "'DM Sans', sans-serif", padding: 0,
                transition: 'color .2s',
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.22)'; }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
