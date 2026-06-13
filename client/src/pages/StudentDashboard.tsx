import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { LogOut, BookOpen, CreditCard, ClipboardList, User } from 'lucide-react';

interface Exam {
  id: string; title: string; subject: string; date: string;
  start_time: string; duration: number; class: string; exam_type: string; term: string;
}
interface StudentInfo { id: string; registration_number: string; class: string; stream: string | null; }
interface FeeInfo { class: string; amount: string; }
interface Payment { id: string; amount: number; date_paid: string; status: 'paid' | 'pending'; }

const SSS_CLASSES = ['SSS 1','SSS 2','SSS 3'];
const C = { forest:'#1A2E0A', mid:'#2D5016', light:'#4A7C28', sage:'#A8D878', sageTint:'#F0F5EB', muted:'#718096', white:'#fff', ivory:'#F7F4EE' };

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignedSubjectNames, setAssignedSubjectNames] = useState<string[]>([]);
  const [feeInfo, setFeeInfo] = useState<FeeInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankInfo, setBankInfo] = useState<{ bank_name:string|null; account_name:string|null; account_number:string|null }|null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams'|'fees'|'results'>('exams');
  const [schoolName, setSchoolName] = useState('Golden Star School');

  useEffect(() => {
    if (!user) { setLocation('/student-login'); return; }
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const { data: student, error: studentError } = await supabase
        .from('students').select('id,registration_number,class,stream').eq('user_id', user!.id).single();
      if (studentError || !student) { toast.error('Failed to load student information'); return; }
      setStudentInfo(student);

      let subjectNames: string[] = [];
      if (SSS_CLASSES.includes(student.class)) {
        const { data: subjectsData } = await supabase
          .from('student_subjects').select('subject:subject_id(name)').eq('student_id', student.id).eq('is_active', true);
        subjectNames = (subjectsData || []).map((r: any) => r.subject?.name).filter(Boolean);
        setAssignedSubjectNames(subjectNames);
      }

      const { data: allExams } = await supabase
        .from('exams').select('id,title,subject,date,start_time,duration,class,exam_type,term')
        .eq('class', student.class).eq('is_active', true).order('date', { ascending: true });
      let filtered = allExams || [];
      if (SSS_CLASSES.includes(student.class)) {
        filtered = subjectNames.length > 0 ? filtered.filter(e => subjectNames.includes(e.subject)) : [];
      }
      setExams(filtered);

      const { data: settingsData } = await supabase
        .from('school_settings').select('fees_table,bank_name,account_name,account_number,school_name').eq('id', 1).single();
      if (settingsData) {
        if (settingsData.school_name) setSchoolName(settingsData.school_name);
        setBankInfo({ bank_name: settingsData.bank_name, account_name: settingsData.account_name, account_number: settingsData.account_number });
        try {
          const feesArr: FeeInfo[] = typeof settingsData.fees_table === 'string'
            ? JSON.parse(settingsData.fees_table) : settingsData.fees_table;
          const match = (feesArr || []).find(f =>
            f.class === student.class ||
            student.class.toLowerCase().includes(f.class.toLowerCase().split(/[-–]/)[0].trim().toLowerCase())
          );
          if (match) setFeeInfo(match);
        } catch {}
      }

      const { data: payData } = await supabase
        .from('payments').select('id,amount,date_paid,status').eq('student_id', student.id).order('date_paid', { ascending: false });
      if (payData) setPayments(payData);
    } catch { toast.error('An error occurred loading your dashboard'); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await logout(); setLocation('/'); toast.success('Logged out'); } catch { toast.error('Logout failed'); }
  };

  const isExamAvailable = (exam: Exam) => {
    const now = new Date();
    const examDate = new Date(`${exam.date}T${exam.start_time}`);
    const examEnd = new Date(examDate.getTime() + exam.duration * 60000);
    return now >= examDate && now <= examEnd;
  };

  const isSSSWithNoSubjects = studentInfo && SSS_CLASSES.includes(studentInfo.class) && assignedSubjectNames.length === 0;

  const tabStyle = (id: string): React.CSSProperties => ({
    padding:'10px 20px', borderRadius:100, border:'none', cursor:'pointer',
    fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, transition:'all .2s',
    background: activeTab===id ? C.mid : 'transparent',
    color: activeTab===id ? '#fff' : C.muted,
    boxShadow: activeTab===id ? '0 4px 16px rgba(45,80,22,.25)' : 'none',
  });

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff', flexDirection:'column', gap:16, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:44, height:44, border:'3px solid #F0F5EB', borderTop:`3px solid ${C.mid}`, borderRadius:'50%' }} className="animate-spin-slow" />
      <p style={{ color:C.muted, fontSize:14 }}>Loading your dashboard…</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F7F4EE', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'1px solid rgba(45,80,22,.1)', position:'sticky', top:0, zIndex:30, boxShadow:'0 2px 12px rgba(0,0,0,.05)' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${C.mid},${C.light})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⭐</div>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:16, fontWeight:700, color:C.forest, lineHeight:1.2 }}>{schoolName}</div>
              <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px' }}>Student Portal</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ textAlign:'right' }} className="hidden sm:block">
              <div style={{ fontSize:13, fontWeight:600, color:C.forest }}>{user?.full_name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{studentInfo?.registration_number}</div>
            </div>
            <div style={{ width:38, height:38, borderRadius:'50%', background:`linear-gradient(135deg,${C.mid},${C.light})`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:700, flexShrink:0 }}>
              {user?.full_name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:100, border:`1.5px solid rgba(45,80,22,.2)`, background:'transparent', color:C.mid, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(229,62,62,.06)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(229,62,62,.3)'; (e.currentTarget as HTMLElement).style.color='#C53030'; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.borderColor='rgba(45,80,22,.2)'; (e.currentTarget as HTMLElement).style.color=C.mid; }}>
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingTop:32, paddingBottom:48 }}>
        {/* Welcome banner */}
        <div style={{ background:`linear-gradient(135deg,${C.forest},${C.mid})`, borderRadius:20, padding:'24px 28px', marginBottom:28, color:'#F7F4EE', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(168,216,120,.08)' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(168,216,120,.8)', marginBottom:6 }}>Welcome back</div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:28, fontWeight:700, lineHeight:1.15, marginBottom:12 }}>
              {user?.full_name || 'Student'} 👋
            </h1>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {[
                studentInfo?.class && { label:'Class', value:studentInfo.class },
                studentInfo?.stream && { label:'Stream', value:`${studentInfo.stream} Stream` },
                studentInfo?.registration_number && { label:'Reg. No.', value:studentInfo.registration_number },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} style={{ background:'rgba(255,255,255,.1)', borderRadius:100, padding:'5px 14px', display:'flex', gap:6, alignItems:'center' }}>
                  <span style={{ fontSize:10, color:'rgba(247,244,238,.55)', textTransform:'uppercase', letterSpacing:'1px' }}>{item.label}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:16, marginBottom:28 }}>
          {[
            { icon:ClipboardList, label:'Available Exams', value:String(exams.length), color:'#A8D878' },
            { icon:BookOpen, label:'Subjects', value: SSS_CLASSES.includes(studentInfo?.class||'') ? String(assignedSubjectNames.length) : '—', color:'#7BBFEA' },
            { icon:CreditCard, label:'Fee Amount', value: feeInfo?.amount || '—', color:'#F6AD55' },
            { icon:User, label:'Payments Made', value: String(payments.filter(p=>p.status==='paid').length), color:'#68D391' },
          ].map(({ icon:Icon, label, value, color }) => (
            <div key={label} style={{ background:'#fff', borderRadius:16, padding:'18px 20px', border:'1px solid rgba(45,80,22,.08)', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }} className="gss-card animate-fade-up">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', fontWeight:500 }}>{label}</span>
                <div style={{ width:30, height:30, borderRadius:8, background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:30, fontWeight:700, color:C.forest, lineHeight:1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* SSS warning */}
        {isSSSWithNoSubjects && (
          <div style={{ background:'#FFFBEB', border:'1px solid rgba(214,158,46,.3)', borderRadius:14, padding:'16px 20px', marginBottom:24, display:'flex', gap:12, alignItems:'flex-start' }}>
            <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:'#744210', marginBottom:3 }}>Subjects not yet assigned</div>
              <div style={{ fontSize:13, color:'#92400E', lineHeight:1.6 }}>Your stream and subjects have not been set up. Exams will appear once your administrator assigns your subjects.</div>
            </div>
          </div>
        )}

        {/* Tab nav */}
        <div style={{ display:'flex', gap:6, marginBottom:24, background:'#fff', borderRadius:100, padding:4, border:'1px solid rgba(45,80,22,.1)', width:'fit-content', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
          {[
            { id:'exams', label:'Exams', icon:ClipboardList },
            { id:'fees',  label:'Fees & Payments', icon:CreditCard },
          ].map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)} style={tabStyle(id)}>
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Icon size={14} />
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* EXAMS TAB */}
        {activeTab === 'exams' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {exams.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:20, padding:'48px 24px', textAlign:'center', border:'1px solid rgba(45,80,22,.08)' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:700, color:C.forest, marginBottom:8 }}>No exams available</div>
                <p style={{ fontSize:14, color:C.muted, maxWidth:280, margin:'0 auto' }}>
                  {isSSSWithNoSubjects ? 'Exams will appear once your subjects are assigned by admin.' : 'No exams have been scheduled for your class yet. Check back later.'}
                </p>
              </div>
            ) : exams.map(exam => {
              const available = isExamAvailable(exam);
              return (
                <div key={exam.id} style={{ background:'#fff', borderRadius:20, border:`1px solid ${available ? 'rgba(74,124,40,.3)' : 'rgba(45,80,22,.08)'}`, overflow:'hidden', boxShadow: available ? '0 4px 24px rgba(45,80,22,.1)' : '0 2px 8px rgba(0,0,0,.04)', transition:'all .25s' }} className="gss-card">
                  {available && <div style={{ height:4, background:`linear-gradient(to right,${C.mid},#6AAF30)` }} />}
                  <div style={{ padding:'20px 24px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:8 }}>
                      <div>
                        <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:20, fontWeight:700, color:C.forest, marginBottom:4 }}>{exam.title}</div>
                        <div style={{ fontSize:13, color:C.muted }}>{exam.subject}</div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                        <span className="gss-badge-forest">{exam.exam_type?.toUpperCase()}</span>
                        <span className="gss-badge-forest">{exam.term}</span>
                        {available && <span className="gss-badge-sage">● Available Now</span>}
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))', gap:12, marginBottom:18 }}>
                      {[['Date',exam.date],['Time',exam.start_time],['Duration',`${exam.duration} mins`]].map(([l,v]) => (
                        <div key={l} style={{ background:C.ivory, borderRadius:10, padding:'10px 14px' }}>
                          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:3 }}>{l}</div>
                          <div style={{ fontSize:13.5, fontWeight:600, color:C.forest }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setLocation(`/student/exam/${exam.id}`)}
                      disabled={!available}
                      className="gss-btn-primary"
                      style={{ width:'100%', padding:'12px', fontSize:14 }}>
                      {available ? 'Start Exam →' : 'Not Available Yet'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FEES TAB */}
        {activeTab === 'fees' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
              {/* Fee card */}
              <div style={{ background:'#fff', borderRadius:20, border:'1px solid rgba(45,80,22,.1)', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ background:`linear-gradient(135deg,${C.forest},${C.mid})`, padding:'20px 24px' }}>
                  <div style={{ fontSize:10, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(168,216,120,.7)', marginBottom:4 }}>Your Class Fee</div>
                  <div style={{ fontSize:12, color:'rgba(247,244,238,.5)' }}>Per term · {studentInfo?.class}</div>
                </div>
                <div style={{ padding:'24px' }}>
                  {feeInfo ? (
                    <>
                      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:48, fontWeight:800, color:C.mid, lineHeight:1, marginBottom:6 }}>{feeInfo.amount}</div>
                      <div style={{ fontSize:12, color:C.muted }}>per term · {feeInfo.class}</div>
                    </>
                  ) : (
                    <p style={{ fontSize:14, color:C.muted, fontStyle:'italic' }}>Fee not yet configured for your class. Contact your administrator.</p>
                  )}
                </div>
              </div>

              {/* Payment details */}
              <div style={{ background:'#fff', borderRadius:20, border:'1px solid rgba(45,80,22,.1)', padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px', color:C.light, marginBottom:16 }}>Payment Details</div>
                {bankInfo?.bank_name ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[
                      ['Bank', bankInfo.bank_name, false],
                      bankInfo.account_name && ['Account Name', bankInfo.account_name, false],
                      bankInfo.account_number && ['Account Number', bankInfo.account_number, true],
                    ].filter(Boolean).map((item: any) => (
                      <div key={item[0]} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(45,80,22,.07)' }}>
                        <span style={{ fontSize:13, color:C.muted }}>{item[0]}</span>
                        <span style={{ fontSize:14, fontWeight:700, color: item[2] ? C.mid : C.forest, fontFamily: item[2] ? "'DM Mono',monospace" : 'inherit' }}>{item[1]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize:14, color:C.muted, fontStyle:'italic' }}>Payment details not yet configured. Contact your administrator.</p>
                )}
              </div>
            </div>

            {/* Payment history */}
            <div style={{ background:'#fff', borderRadius:20, border:'1px solid rgba(45,80,22,.1)', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(45,80,22,.08)' }}>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:20, fontWeight:700, color:C.forest }}>Payment History</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>All recorded payments for your account</div>
              </div>
              <div style={{ padding:'8px 0' }}>
                {payments.length === 0 ? (
                  <div style={{ padding:'36px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:12 }}>💳</div>
                    <div style={{ fontSize:14, color:C.muted }}>No payment records found.</div>
                  </div>
                ) : payments.map(p => (
                  <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px', borderBottom:'1px solid rgba(45,80,22,.05)', transition:'background .15s' }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='#F9FBF7'; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; }}>
                    <div>
                      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:20, fontWeight:700, color:C.forest }}>₦{p.amount.toLocaleString()}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{new Date(p.date_paid).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>
                    </div>
                    <span className={p.status==='paid' ? 'gss-badge-sage' : 'gss-badge-amber'}>
                      {p.status==='paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
