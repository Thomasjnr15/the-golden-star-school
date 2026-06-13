import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6',
  'JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3',
];
const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3'];
const STREAMS = ['Science', 'Arts', 'Commercial'];

const STEPS = [
  ['01','Fill the Online Form',       'Complete the two-step application form with your child\'s and parent details.'],
  ['02','Admin Reviews Application',  'Our admissions team reviews every application within 3 working days.'],
  ['03','Receive Login Credentials',  'Upon approval, you receive your child\'s registration number and password.'],
  ['04','Access Student Dashboard',   'Log in to view exams, results, report cards and more.'],
];

type FormData = {
  full_name: string; date_of_birth: string; gender: string;
  class_applying: string; requested_stream: string; previous_school: string;
  parent_name: string; parent_phone: string;
  parent_email: string; home_address: string; additional_info: string;
};

const EMPTY: FormData = {
  full_name:'', date_of_birth:'', gender:'', class_applying:'', requested_stream:'',
  previous_school:'', parent_name:'', parent_phone:'',
  parent_email:'', home_address:'', additional_info:'',
};

export default function Admission() {
  const [admissionText, setAdmissionText] = useState('');
  const [form, setForm]   = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [step, setStep]   = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from('school_settings').select('admission_text').eq('id',1).single()
      .then(({ data }) => { if (data?.admission_text) setAdmissionText(data.admission_text); });
  }, []);

  const isSSS = SSS_CLASSES.includes(form.class_applying);

  const up = (k: keyof FormData, v: string) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // Clear stream if class changes to non-SSS
      if (k === 'class_applying' && !SSS_CLASSES.includes(v)) {
        next.requested_stream = '';
      }
      return next;
    });
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validateStep1 = () => {
    const e: Partial<FormData> = {};
    if (!form.full_name.trim())      e.full_name      = 'Required';
    if (!form.class_applying)        e.class_applying = 'Required';
    if (!form.gender)                e.gender         = 'Required';
    // Stream is encouraged but not strictly required (admin has final authority)
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Partial<FormData> = {};
    if (!form.parent_name.trim())  e.parent_name  = 'Required';
    if (!form.parent_phone.trim()) e.parent_phone = 'Required';
    else if (!/^[0-9+\s\-()]{7,15}$/.test(form.parent_phone.trim())) e.parent_phone = 'Enter a valid phone number';
    if (form.parent_email && !/\S+@\S+\.\S+/.test(form.parent_email)) e.parent_email = 'Enter a valid email';
    if (!form.home_address.trim()) e.home_address = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    const payload: Record<string, string> = {
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      class_applying: form.class_applying,
      previous_school: form.previous_school,
      parent_name: form.parent_name,
      parent_phone: form.parent_phone,
      parent_email: form.parent_email,
      home_address: form.home_address,
      additional_info: form.additional_info,
      status: 'pending',
    };
    // Only include stream if SSS and provided
    if (isSSS && form.requested_stream) {
      payload.requested_stream = form.requested_stream;
    }
    const { error } = await supabase.from('registration_requests').insert([payload]);
    if (error) {
      setErrors({ additional_info: 'Submission failed — please try again or contact the school directly.' });
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  const inputStyle = (field: keyof FormData): React.CSSProperties => ({
    width: '100%', padding: '11px 16px',
    border: `1.5px solid ${errors[field] ? '#DC2626' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 10, fontFamily: "'DM Sans',sans-serif",
    fontSize: 14, color: '#0C1B3A', background: '#fff',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12.5, fontWeight: 600,
    color: '#0C1B3A', marginBottom: 7,
  };

  const errStyle: React.CSSProperties = { fontSize: 12, color: '#DC2626', marginTop: 4 };

  return (
    <section id="admission" style={{
      padding: '100px clamp(20px,5vw,80px)',
      background: 'linear-gradient(160deg,#0C1B3A 0%,#1A2E5A 100%)',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#F5D978', marginBottom: 12 }}>
            Join Our School
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Start Your Child's<br/>
            <span style={{ background: 'linear-gradient(135deg,#C9960A,#F5D978)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Golden Journey
            </span>
          </h2>
          <div style={{ width: 56, height: 3, background: 'linear-gradient(to right,#1B4332,#4A7C28)', borderRadius: 4, marginBottom: 16, opacity: .7 }} />
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.7, maxWidth: 520 }}>
            {admissionText || 'Applications are open. Give your child the best foundation for a bright future.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64 }}>

          {/* Left — process steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {STEPS.map(([num, title, desc]) => (
              <div key={num} style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                padding: 24, borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: 'linear-gradient(135deg,#C9960A,#F5D978)',
                  borderRadius: 10, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontFamily: "'DM Mono',monospace",
                  fontSize: 13, fontWeight: 600, color: '#0C1B3A',
                }}>{num}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — form card */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>

            {/* SUCCESS SCREEN */}
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: '#0C1B3A', marginBottom: 12 }}>
                  Application Submitted!
                </h3>
                <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.8, marginBottom: 8 }}>
                  Thank you, <strong>{form.parent_name || 'Parent'}</strong>.<br/>
                  We have received your application for <strong>{form.full_name}</strong>.
                </p>
                <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.7, marginBottom: 32 }}>
                  Our admissions team will review your application and contact you within <strong>3 working days</strong>.
                </p>
                <div style={{ background: '#FDFBF5', border: '1px solid rgba(201,150,10,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Application Summary</div>
                  {[
                    ['Student', form.full_name],
                    ['Class',   form.class_applying],
                    ...(isSSS && form.requested_stream ? [['Stream', form.requested_stream]] : []),
                    ['Contact', form.parent_phone],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4A5568', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontWeight: 600, color: '#0C1B3A' }}>{l}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setForm(EMPTY); setStep(1); setSubmitted(false); }} style={{
                  padding: '12px 32px', borderRadius: 12,
                  border: '1.5px solid rgba(201,150,10,0.4)',
                  background: 'transparent', color: '#2D6A4F',
                  fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Submit Another Application
                </button>
              </div>

            ) : (
              <>
                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  {[1, 2].map(n => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, transition: 'all .3s',
                        background: step >= n ? 'linear-gradient(135deg,#C9960A,#E8B020)' : '#F5F5F5',
                        color: step >= n ? '#0C1B3A' : '#A0AEC0',
                      }}>{n}</div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: step === n ? '#0C1B3A' : '#A0AEC0' }}>
                        {n === 1 ? 'Student Info' : 'Parent Info'}
                      </span>
                      {n < 2 && <div style={{ width: 32, height: 2, background: step > 1 ? '#2D6A4F' : '#E2E8F0', borderRadius: 2 }} />}
                    </div>
                  ))}
                </div>

                {/* STEP 1 — Student Info */}
                {step === 1 && (
                  <form onSubmit={handleNext} noValidate>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: '#0C1B3A', marginBottom: 20 }}>
                      Student Information
                    </h3>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Student Full Name *</label>
                      <input style={inputStyle('full_name')} value={form.full_name} onChange={e => up('full_name', e.target.value)} placeholder="e.g. Amara Johnson"/>
                      {errors.full_name && <div style={errStyle}>⚠ {errors.full_name}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                      <div>
                        <label style={labelStyle}>Date of Birth</label>
                        <input type="date" style={inputStyle('date_of_birth')} value={form.date_of_birth} onChange={e => up('date_of_birth', e.target.value)}/>
                      </div>
                      <div>
                        <label style={labelStyle}>Gender *</label>
                        <select style={{ ...inputStyle('gender'), appearance: 'none', cursor: 'pointer' }} value={form.gender} onChange={e => up('gender', e.target.value)}>
                          <option value="">Select...</option>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                        {errors.gender && <div style={errStyle}>⚠ {errors.gender}</div>}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Class Applying For *</label>
                      <select style={{ ...inputStyle('class_applying'), appearance: 'none', cursor: 'pointer' }} value={form.class_applying} onChange={e => up('class_applying', e.target.value)}>
                        <option value="">Select class...</option>
                        {CLASSES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      {errors.class_applying && <div style={errStyle}>⚠ {errors.class_applying}</div>}
                    </div>

                    {/* Stream selector — only shown for SSS classes */}
                    {isSSS && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>
                          Preferred Stream
                          <span style={{ fontWeight: 400, color: '#A0AEC0', marginLeft: 6, fontSize: 12 }}>(optional — admin has final authority)</span>
                        </label>
                        <select
                          style={{ ...inputStyle('requested_stream'), appearance: 'none', cursor: 'pointer' }}
                          value={form.requested_stream}
                          onChange={e => up('requested_stream', e.target.value)}
                        >
                          <option value="">Select preferred stream...</option>
                          {STREAMS.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                          Science, Arts, or Commercial. The admissions team will confirm your stream upon approval.
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: 24 }}>
                      <label style={labelStyle}>Previous School <span style={{ fontWeight: 400, color: '#A0AEC0' }}>(optional)</span></label>
                      <input style={inputStyle('previous_school')} value={form.previous_school} onChange={e => up('previous_school', e.target.value)} placeholder="e.g. ABC Primary School"/>
                    </div>

                    <button type="submit" style={{
                      width: '100%', padding: 14,
                      background: 'linear-gradient(135deg,#C9960A,#E8B020)',
                      color: '#0C1B3A', fontWeight: 700,
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 15, border: 'none', borderRadius: 12, cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(201,150,10,0.3)',
                    }}>
                      Next: Parent Information →
                    </button>
                  </form>
                )}

                {/* STEP 2 — Parent Info */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} noValidate>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <button type="button" onClick={() => setStep(1)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#2D6A4F', fontSize: 13, fontWeight: 600,
                        fontFamily: "'DM Sans',sans-serif", padding: 0,
                      }}>← Back</button>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: '#0C1B3A', margin: 0 }}>
                        Parent / Guardian
                      </h3>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Full Name *</label>
                      <input style={inputStyle('parent_name')} value={form.parent_name} onChange={e => up('parent_name', e.target.value)} placeholder="e.g. Mr. Emmanuel Johnson"/>
                      {errors.parent_name && <div style={errStyle}>⚠ {errors.parent_name}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                      <div>
                        <label style={labelStyle}>Phone Number *</label>
                        <input type="tel" style={inputStyle('parent_phone')} value={form.parent_phone} onChange={e => up('parent_phone', e.target.value)} placeholder="08012345678"/>
                        {errors.parent_phone && <div style={errStyle}>⚠ {errors.parent_phone}</div>}
                      </div>
                      <div>
                        <label style={labelStyle}>Email <span style={{ fontWeight: 400, color: '#A0AEC0' }}>(optional)</span></label>
                        <input type="email" style={inputStyle('parent_email')} value={form.parent_email} onChange={e => up('parent_email', e.target.value)} placeholder="parent@email.com"/>
                        {errors.parent_email && <div style={errStyle}>⚠ {errors.parent_email}</div>}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Home Address *</label>
                      <textarea style={{ ...inputStyle('home_address'), resize: 'vertical' } as React.CSSProperties} rows={2} value={form.home_address} onChange={e => up('home_address', e.target.value)} placeholder="5 School Lane, Lagos"/>
                      {errors.home_address && <div style={errStyle}>⚠ {errors.home_address}</div>}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label style={labelStyle}>Additional Information <span style={{ fontWeight: 400, color: '#A0AEC0' }}>(optional)</span></label>
                      <textarea style={{ ...inputStyle('additional_info'), resize: 'vertical' } as React.CSSProperties} rows={2} value={form.additional_info} onChange={e => up('additional_info', e.target.value)} placeholder="Anything else you'd like us to know..."/>
                      {errors.additional_info && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 6, padding: 10, background: '#FEE2E2', borderRadius: 8 }}>⚠ {errors.additional_info}</div>}
                    </div>

                    <div style={{ background: '#FDFBF5', border: '1px solid rgba(201,150,10,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 12.5, color: '#718096', lineHeight: 1.6 }}>
                      📌 By submitting, you confirm that the information provided is accurate. The school will review your application and contact you within 3 working days.
                    </div>

                    <button type="submit" disabled={loading} style={{
                      width: '100%', padding: 14,
                      background: loading ? '#d4a017' : 'linear-gradient(135deg,#C9960A,#E8B020)',
                      color: '#0C1B3A', fontWeight: 700,
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 15, border: 'none', borderRadius: 12,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.8 : 1,
                      boxShadow: '0 4px 16px rgba(201,150,10,0.3)',
                    }}>
                      {loading ? 'Submitting...' : 'Submit Application 🎉'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
