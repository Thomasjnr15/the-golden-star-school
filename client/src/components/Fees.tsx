import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FeeRow { class: string; amount: string; }
interface Settings {
  fees_table: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
}

export default function Fees() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    supabase.from('school_settings')
      .select('fees_table,bank_name,account_number,account_name').eq('id', 1).single()
      .then(({ data }) => {
        if (data) {
          setSettings(data);
          try {
            const p = JSON.parse(data.fees_table);
            if (p?.length) setFees(p);
          } catch {}
        }
      });

    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    const el = document.getElementById('fees');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hasPaymentInfo = settings?.bank_name || settings?.account_number || settings?.account_name;

  return (
    <section id="fees" style={{
      padding: '120px clamp(24px,5vw,80px)',
      background: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative arc */}
      <div style={{
        position: 'absolute', bottom: -200, right: -200,
        width: 500, height: 500, borderRadius: '50%',
        border: '1px solid rgba(45,80,22,0.05)', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          marginBottom: 64,
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)',
          transition: 'opacity .7s, transform .7s',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontSize: 11, fontWeight: 600, letterSpacing: '2px',
            textTransform: 'uppercase', color: '#4A7C28', marginBottom: 12,
          }}>
            <div style={{ width: 28, height: 1.5, background: '#4A7C28' }} />
            Tuition & Fees
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(30px,4vw,50px)', fontWeight: 700,
            color: '#1A2E0A', letterSpacing: '-0.5px',
          }}>
            School <em style={{ fontStyle: 'italic', color: '#4A7C28' }}>Fees</em>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40, alignItems: 'start',
        }}>
          {/* Fee table */}
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            border: '1px solid rgba(45,80,22,0.1)',
            boxShadow: '0 4px 40px rgba(45,80,22,0.07)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'opacity .75s .1s, transform .75s .1s',
          }}>
            {/* Table header */}
            <div style={{
              background: 'linear-gradient(135deg, #1A2E0A, #2D5016)',
              padding: '24px 32px',
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, color: '#F7F4EE', fontWeight: 700, marginBottom: 4,
              }}>Fee Schedule</div>
              <div style={{ fontSize: 13, color: 'rgba(247,244,238,0.55)' }}>Per term — inclusive of all charges</div>
            </div>

            {/* Rows */}
            {fees.length > 0 ? (
              fees.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 32px',
                  background: i % 2 === 0 ? '#fff' : '#F9FBF7',
                  borderBottom: i < fees.length - 1 ? '1px solid rgba(45,80,22,0.06)' : 'none',
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0F5EB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#F9FBF7'; }}>
                  <span style={{ fontSize: 15, color: '#1A2E0A', fontWeight: 500 }}>{row.class}</span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22, fontWeight: 700, color: '#2D5016',
                  }}>{row.amount}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 32px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#718096', fontStyle: 'italic' }}>
                  Fee schedule not yet configured.<br />
                  Update in Admin → Settings.
                </p>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 20,
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'opacity .75s .2s, transform .75s .2s',
          }}>
            {/* Payment details — from DB only */}
            {hasPaymentInfo ? (
              <div style={{
                background: '#F0F5EB',
                border: '1px solid rgba(74,124,40,0.18)',
                borderRadius: 20, padding: '28px 32px',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#4A7C28', marginBottom: 20 }}>
                  Payment Details
                </div>
                {[
                  settings?.bank_name && ['Bank', settings.bank_name],
                  settings?.account_name && ['Account Name', settings.account_name],
                  settings?.account_number && ['Account Number', settings.account_number],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={String(label)} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(45,80,22,0.08)',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 13, color: '#718096' }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A2E0A' }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: '#F9FBF7',
                border: '1px dashed rgba(74,124,40,0.2)',
                borderRadius: 20, padding: '28px 32px',
              }}>
                <p style={{ fontSize: 13.5, color: '#718096', lineHeight: 1.7, fontStyle: 'italic' }}>
                  Payment details not yet configured.<br />
                  Update bank name, account name, and account number in Admin → Settings.
                </p>
              </div>
            )}

            {/* Note card */}
            <div style={{
              background: '#1A2E0A',
              borderRadius: 20, padding: '28px 32px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>💡</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20, fontWeight: 700, color: '#A8D878', marginBottom: 10,
              }}>
                Need More Information?
              </div>
              <p style={{ fontSize: 14, color: 'rgba(247,244,238,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
                For fee waivers, payment plans, or bursary information, please contact the school directly.
              </p>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '11px 28px', borderRadius: 100,
                  background: 'transparent',
                  border: '1.5px solid rgba(168,216,120,0.35)',
                  color: '#A8D878',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'all .2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,216,120,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                Contact School →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
