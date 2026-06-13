import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Settings {
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  school_hours: string | null;
  facebook: string | null;
  instagram: string | null;
  whatsapp: string | null;
}

export default function Contact() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.from('school_settings')
      .select('contact_email,contact_phone,contact_address,school_hours,facebook,instagram,whatsapp')
      .eq('id', 1).single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);

  const up = (k: keyof typeof form, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = 'Please enter your name';
    if (!form.email.trim())   e.email   = 'Please enter your email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.message.trim()) e.message = 'Please write a message';
    else if (form.message.trim().length < 10) e.message = 'Message is too short (minimum 10 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert([{
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    }]);
    if (error) {
      toast.error('Failed to send. Please try again or call us directly.');
    } else {
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    }
    setLoading(false);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '11px 16px',
    border: `1.5px solid ${errors[field] ? '#DC2626' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 10,
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 14, color: '#0C1B3A',
    background: '#fff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color .2s',
  });

  const contactCards = [
    {
      icon: '📧', label: 'Email Address',
      value: settings?.contact_email || null,
      fallback: 'Not set — update in Admin Settings',
      href: settings?.contact_email ? `mailto:${settings.contact_email}` : null,
    },
    {
      icon: '📞', label: 'Phone Number',
      value: settings?.contact_phone || null,
      fallback: 'Not set — update in Admin Settings',
      href: settings?.contact_phone ? `tel:${settings.contact_phone}` : null,
    },
    {
      icon: '📍', label: 'Address',
      value: settings?.contact_address || null,
      fallback: 'Not set — update in Admin Settings',
      href: null,
    },
    {
      icon: '⏰', label: 'School Hours',
      value: settings?.school_hours || null,
      fallback: 'Mon – Fri: 7:30 AM – 3:30 PM',
      href: null,
    },
  ];

  const socials = [
    { icon: '📘', label: 'Facebook',  href: settings?.facebook  || null },
    { icon: '📸', label: 'Instagram', href: settings?.instagram || null },
    {
      icon: '💬', label: 'WhatsApp',
      // FIX: Proper WhatsApp deep link — not href="#"
      href: settings?.whatsapp
        ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`
        : null,
    },
  ].filter(s => s.href);

  return (
    <section id="contact" style={{ padding: '100px clamp(20px,5vw,80px)', background: '#FDFBF5', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#2D6A4F', marginBottom: 12 }}>Get In Touch</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#0C1B3A', marginBottom: 16 }}>
            We'd Love to <span style={{ color: '#1B4332' }}>Hear From You</span>
          </h2>
          <div style={{ width: 56, height: 3, background: 'linear-gradient(to right,#1B4332,#4A7C28)', borderRadius: 4 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 60 }}>

          {/* Left — contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {contactCards.map(c => (
              <div key={c.label} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                padding: 20, borderRadius: 16, background: '#fff',
                border: '1px solid rgba(201,150,10,0.15)', transition: 'all .25s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(27,67,50,0.25)'; el.style.transform = 'translateX(4px)'; el.style.boxShadow = '0 4px 20px rgba(201,150,10,0.1)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(27,67,50,0.12)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}>
                <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: 'linear-gradient(135deg,#f0f7f3,rgba(45,80,22,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {c.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 4 }}>{c.label}</div>
                  {c.href ? (
                    <a href={c.href} style={{ fontSize: 15, fontWeight: 500, color: '#0C1B3A', textDecoration: 'none', wordBreak: 'break-all' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = '#C9960A'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = '#0C1B3A'; }}>
                      {c.value}
                    </a>
                  ) : (
                    <div style={{ fontSize: 15, fontWeight: c.value ? 500 : 400, color: c.value ? '#0C1B3A' : '#A0AEC0', fontStyle: c.value ? 'normal' : 'italic' }}>
                      {c.value || c.fallback}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Social links — only shown if configured */}
            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                {socials.map(s => (
                  <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', borderRadius: 10,
                    border: '1.5px solid rgba(201,150,10,0.15)',
                    fontSize: 13, fontWeight: 500, color: '#0C1B3A',
                    textDecoration: 'none', background: '#fff', transition: 'all .2s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#FDF8E7'; el.style.borderColor = 'rgba(27,67,50,0.35)'; el.style.color = '#C9960A'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#fff'; el.style.borderColor = 'rgba(27,67,50,0.12)'; el.style.color = '#0C1B3A'; }}>
                    {s.icon} {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right — message form or success */}
          <div style={{ background: '#fff', border: '1px solid rgba(201,150,10,0.15)', borderRadius: 24, padding: 36, boxShadow: '0 4px 32px rgba(201,150,10,0.1)' }}>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 800, color: '#0C1B3A', marginBottom: 12 }}>
                  Message Received!
                </h3>
                <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.7, marginBottom: 28 }}>
                  Thank you for reaching out. We will get back to you as soon as possible.
                </p>
                <button onClick={() => setSent(false)} style={{
                  padding: '12px 32px', borderRadius: 12, border: '1.5px solid rgba(201,150,10,0.4)',
                  background: 'transparent', color: '#2D6A4F', fontFamily: "'DM Sans',sans-serif",
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Send Another Message</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 800, color: '#0C1B3A', marginBottom: 24 }}>
                  Send Us a Message
                </h3>
                <form onSubmit={handleSubmit} noValidate>
                  {/* Name */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0C1B3A', marginBottom: 7 }}>Your Name *</label>
                    <input style={inputStyle('name')} value={form.name} onChange={e => up('name', e.target.value)} placeholder="Full name" />
                    {errors.name && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }}>⚠ {errors.name}</div>}
                  </div>
                  {/* Email */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#0C1B3A', marginBottom: 7 }}>Email Address *</label>
                    <input type="email" style={inputStyle('email')} value={form.email} onChange={e => up('email', e.target.value)} placeholder="your@email.com" />
                    {errors.email && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }}>⚠ {errors.email}</div>}
                  </div>
                  {/* Message */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0C1B3A' }}>Message *</label>
                      <span style={{ fontSize: 11, color: form.message.length > 400 ? '#DC2626' : '#A0AEC0' }}>{form.message.length}/500</span>
                    </div>
                    <textarea
                      style={{ ...inputStyle('message'), resize: 'vertical' }}
                      rows={5}
                      maxLength={500}
                      value={form.message}
                      onChange={e => up('message', e.target.value)}
                      placeholder="Write your message here..."
                    />
                    {errors.message && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }}>⚠ {errors.message}</div>}
                  </div>
                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: 14,
                    background: loading ? '#2D5016' : '#1B4332',
                    color: '#fff', fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
                    fontSize: 15, border: 'none', borderRadius: 12,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all .25s', opacity: loading ? 0.8 : 1,
                    boxShadow: '0 4px 16px rgba(27,67,50,0.3)',
                  }}>
                    {loading ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
