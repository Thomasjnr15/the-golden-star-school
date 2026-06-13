import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Image } from 'lucide-react';

interface FeeRow { class: string; amount: string; }

interface SchoolSettings {
  // General
  school_name: string;
  tagline: string;
  logo: string;
  academic_session: string;
  founded_year: string;
  // Hero
  hero_heading: string;
  hero_subheading: string;
  hero_image: string;
  hero_image_2: string;
  hero_cta_label: string;
  hero_cta_label2: string;
  students_count: string;
  teachers_count: string;
  awards_count: string;
  years_count: string;
  pass_rate: string;
  // About / Why Choose Us
  about_text: string;
  about_mission: string;
  about_vision: string;
  about_image: string;
  why_quality_title: string;
  why_quality_text: string;
  why_teachers_title: string;
  why_teachers_text: string;
  why_facilities_title: string;
  why_facilities_text: string;
  why_character_title: string;
  why_character_text: string;
  why_holistic_title: string;
  why_holistic_text: string;
  why_results_title: string;
  why_results_text: string;
  // Programs
  programs_heading: string;
  programs_sub: string;
  programs_jss_title: string;
  programs_jss_text: string;
  programs_jss_image: string;
  programs_sss_title: string;
  programs_sss_text: string;
  programs_sss_image: string;
  // Admission & CTA
  admission_text: string;
  cta_heading: string;
  cta_sub: string;
  // Contact
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  school_hours: string;
  // Payment
  bank_name: string;
  account_name: string;
  account_number: string;
  // Social
  facebook: string;
  twitter: string;
  instagram: string;
  whatsapp: string;
  youtube: string;
  // Fees
  fees_table: string;
}

const EMPTY: SchoolSettings = {
  school_name: '', tagline: '', logo: '', academic_session: '', founded_year: '',
  hero_heading: '', hero_subheading: '', hero_image: '', hero_image_2: '',
  hero_cta_label: '', hero_cta_label2: '',
  students_count: '', teachers_count: '', awards_count: '', years_count: '', pass_rate: '',
  about_text: '', about_mission: '', about_vision: '', about_image: '',
  why_quality_title: '', why_quality_text: '',
  why_teachers_title: '', why_teachers_text: '',
  why_facilities_title: '', why_facilities_text: '',
  why_character_title: '', why_character_text: '',
  why_holistic_title: '', why_holistic_text: '',
  why_results_title: '', why_results_text: '',
  programs_heading: '', programs_sub: '',
  programs_jss_title: '', programs_jss_text: '', programs_jss_image: '',
  programs_sss_title: '', programs_sss_text: '', programs_sss_image: '',
  admission_text: '', cta_heading: '', cta_sub: '',
  contact_email: '', contact_phone: '', contact_address: '', school_hours: '',
  bank_name: '', account_name: '', account_number: '',
  facebook: '', twitter: '', instagram: '', whatsapp: '', youtube: '',
  fees_table: '[]',
};

// Helper to render an image upload + URL input pair
function ImageField({
  label, hint, value, onChange, uploadPath, bucket = 'images',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  uploadPath: string;
  bucket?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${uploadPath}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(urlData.publicUrl);
      toast.success('Image uploaded! Click Save to apply.');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex gap-3 items-start flex-wrap">
        {/* Preview */}
        <div className="flex-shrink-0 w-24 h-16 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
          {value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <Image className="w-6 h-6 text-muted-foreground/30" />
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-48">
          <Input
            placeholder="Paste image URL or upload below"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="w-3 h-3 mr-1" />
              {uploading ? 'Uploading…' : 'Upload File'}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} className="text-destructive">
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [formData, setFormData] = useState<SchoolSettings>(EMPTY);
  const [feeRows, setFeeRows] = useState<FeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('school_settings').select('*').eq('id', 1).single();
      if (error) { toast.error('Failed to load settings'); return; }
      if (data) {
        setFormData({ ...EMPTY, ...data });
        try {
          const parsed = typeof data.fees_table === 'string' ? JSON.parse(data.fees_table) : data.fees_table;
          if (Array.isArray(parsed)) setFeeRows(parsed);
        } catch { setFeeRows([]); }
      }
    } finally { setLoading(false); }
  };

  const set = (k: keyof SchoolSettings, v: string) => setFormData(p => ({ ...p, [k]: v }));

  // Logo upload
  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `school-logo.${ext}`;
      const { error: upErr } = await supabase.storage.from('logos').upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      set('logo', urlData.publicUrl);
      toast.success('Logo uploaded! Click Save to apply.');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally { setLogoUploading(false); }
  };

  // Fees editor
  const addFeeRow = () => setFeeRows(r => [...r, { class: '', amount: '' }]);
  const removeFeeRow = (i: number) => setFeeRows(r => r.filter((_, idx) => idx !== i));
  const updateFeeRow = (i: number, key: 'class' | 'amount', val: string) =>
    setFeeRows(r => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

  // Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        fees_table: JSON.stringify(feeRows.filter(r => r.class.trim() && r.amount.trim())),
      };
      const { error } = await supabase.from('school_settings').update(payload).eq('id', 1);
      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error('Failed to save: ' + err.message);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading settings…</div>;

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="content">About & Programs</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        {/* ── GENERAL ─────────────────────────────── */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>School identity, name, logo, and contact info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Logo */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">School Logo</Label>
                <p className="text-xs text-muted-foreground">Shown in the navbar, footer, login pages, and dashboards.</p>
                <div className="flex gap-6 items-start flex-wrap">
                  <div className="flex-shrink-0 w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Image className="w-8 h-8 mx-auto text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground/40 mt-1 block">No logo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 min-w-48">
                    <Input placeholder="Logo URL" value={formData.logo} onChange={e => set('logo', e.target.value)} />
                    <div className="flex gap-2">
                      <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                      <Button type="button" variant="outline" size="sm" onClick={() => logoFileRef.current?.click()} disabled={logoUploading}>
                        <Upload className="w-3 h-3 mr-1" />{logoUploading ? 'Uploading…' : 'Upload Logo'}
                      </Button>
                      {formData.logo && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => set('logo', '')} className="text-destructive">Remove</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">School Identity</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>School Name</Label>
                    <Input value={formData.school_name} onChange={e => set('school_name', e.target.value)} placeholder="e.g. The Golden Star School" />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input value={formData.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Excellence in Education" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Founded Year</Label>
                    <Input value={formData.founded_year} onChange={e => set('founded_year', e.target.value)} placeholder="e.g. 2005" />
                  </div>
                  <div>
                    <Label>Academic Session</Label>
                    <Input value={formData.academic_session} onChange={e => set('academic_session', e.target.value)} placeholder="e.g. 2025/2026" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">Contact Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input type="email" value={formData.contact_email} onChange={e => set('contact_email', e.target.value)} />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={formData.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea value={formData.contact_address} onChange={e => set('contact_address', e.target.value)} rows={2} />
                </div>
                <div>
                  <Label>School Hours</Label>
                  <Input placeholder="e.g. Mon – Fri: 7:30 AM – 3:30 PM" value={formData.school_hours} onChange={e => set('school_hours', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HERO ────────────────────────────────── */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>The first thing visitors see on the homepage. All fields are optional — sensible defaults are used when left blank.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">Heading & Text</p>
                <div>
                  <Label>Main Headline</Label>
                  <p className="text-xs text-muted-foreground mb-1">Use a newline to split into two lines. The second line appears in gold.</p>
                  <Textarea rows={2} placeholder="e.g. Nurturing Minds.&#10;Building Futures." value={formData.hero_heading} onChange={e => set('hero_heading', e.target.value)} />
                </div>
                <div>
                  <Label>Subheading / Description</Label>
                  <Textarea rows={2} placeholder="A brief description shown under the headline" value={formData.hero_subheading} onChange={e => set('hero_subheading', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Label</Label>
                    <Input placeholder="Apply for Admission" value={formData.hero_cta_label} onChange={e => set('hero_cta_label', e.target.value)} />
                  </div>
                  <div>
                    <Label>Secondary Button Label</Label>
                    <Input placeholder="Learn More" value={formData.hero_cta_label2} onChange={e => set('hero_cta_label2', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">Hero Photo</p>
                <ImageField
                  label="Hero Background Image"
                  hint="Shown on the right side of the hero section. Recommended: 800×600px landscape photo of students or school building."
                  value={formData.hero_image}
                  onChange={v => set('hero_image', v)}
                  uploadPath="hero-main"
                  bucket="images"
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">Stats (shown only if filled)</p>
                <p className="text-xs text-muted-foreground">Leave blank to hide that stat entirely — never show fake numbers.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Students Count</Label>
                    <Input placeholder="e.g. 500+" value={formData.students_count} onChange={e => set('students_count', e.target.value)} />
                  </div>
                  <div>
                    <Label>Qualified Teachers</Label>
                    <Input placeholder="e.g. 30+" value={formData.teachers_count} onChange={e => set('teachers_count', e.target.value)} />
                  </div>
                  <div>
                    <Label>Awards Won</Label>
                    <Input placeholder="e.g. 20+" value={formData.awards_count} onChange={e => set('awards_count', e.target.value)} />
                  </div>
                  <div>
                    <Label>Years of Excellence</Label>
                    <Input placeholder="e.g. 15+" value={formData.years_count} onChange={e => set('years_count', e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ABOUT & PROGRAMS ─────────────────────── */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>About, Why Choose Us & Programs</CardTitle>
              <CardDescription>All sections on the homepage below the hero. Every field is shown to visitors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* About */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground border-b pb-2">About Section</p>
                <div>
                  <Label>About Us Text</Label>
                  <Textarea rows={4} placeholder="Describe the school's story and values" value={formData.about_text} onChange={e => set('about_text', e.target.value)} />
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-semibold text-muted-foreground">Why Choose Us — 6 Cards</p>
                <p className="text-xs text-muted-foreground">Each card has a title and description. Edit to match your school's actual strengths.</p>
                {[
                  ['quality',    'Quality Education',     '1'],
                  ['teachers',   'Experienced Teachers',  '2'],
                  ['facilities', 'Modern Facilities',     '3'],
                  ['character',  'Character Building',    '4'],
                  ['holistic',   'Holistic Development',  '5'],
                  ['results',    'Proven Results',        '6'],
                ].map(([key, defaultTitle, num]) => (
                  <div key={key} className="grid grid-cols-2 gap-3 p-3 border rounded-lg">
                    <div>
                      <Label>Card {num} Title</Label>
                      <Input
                        placeholder={defaultTitle}
                        value={(formData as any)[`why_${key}_title`]}
                        onChange={e => set(`why_${key}_title` as keyof SchoolSettings, e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Card {num} Description</Label>
                      <Input
                        placeholder="Short description..."
                        value={(formData as any)[`why_${key}_text`]}
                        onChange={e => set(`why_${key}_text` as keyof SchoolSettings, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Programs */}
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-semibold text-muted-foreground">Our Programs Section</p>
                <div>
                  <Label>Section Heading</Label>
                  <Input placeholder="Strong Foundations. Bright Futures." value={formData.programs_heading} onChange={e => set('programs_heading', e.target.value)} />
                </div>
                <div>
                  <Label>Section Description</Label>
                  <Textarea rows={2} placeholder="Brief description of your curriculum approach" value={formData.programs_sub} onChange={e => set('programs_sub', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3 p-3 border rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">JSS Card</p>
                    <div>
                      <Label>Title</Label>
                      <Input placeholder="Junior Secondary School" value={formData.programs_jss_title} onChange={e => set('programs_jss_title', e.target.value)} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea rows={2} placeholder="What JSS offers" value={formData.programs_jss_text} onChange={e => set('programs_jss_text', e.target.value)} />
                    </div>
                    <ImageField
                      label="JSS Photo"
                      hint="Photo shown on the JSS card. 400×300px recommended."
                      value={formData.programs_jss_image}
                      onChange={v => set('programs_jss_image', v)}
                      uploadPath="programs-jss"
                      bucket="images"
                    />
                  </div>
                  <div className="space-y-3 p-3 border rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SSS Card</p>
                    <div>
                      <Label>Title</Label>
                      <Input placeholder="Senior Secondary School" value={formData.programs_sss_title} onChange={e => set('programs_sss_title', e.target.value)} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea rows={2} placeholder="What SSS offers" value={formData.programs_sss_text} onChange={e => set('programs_sss_text', e.target.value)} />
                    </div>
                    <ImageField
                      label="SSS Photo"
                      hint="Photo shown on the SSS card. 400×300px recommended."
                      value={formData.programs_sss_image}
                      onChange={v => set('programs_sss_image', v)}
                      uploadPath="programs-sss"
                      bucket="images"
                    />
                  </div>
                </div>
              </div>

              {/* Admission & CTA */}
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-semibold text-muted-foreground">Admission Section</p>
                <div>
                  <Label>Admission Section Text</Label>
                  <Textarea rows={3} placeholder="Description shown above the admission form" value={formData.admission_text} onChange={e => set('admission_text', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Banner Heading</Label>
                    <Input placeholder="Begin Your Child's Journey With Us Today" value={formData.cta_heading} onChange={e => set('cta_heading', e.target.value)} />
                  </div>
                  <div>
                    <Label>CTA Banner Subtext</Label>
                    <Input placeholder="Admissions are open for 2025/2026" value={formData.cta_sub} onChange={e => set('cta_sub', e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FEES ────────────────────────────────── */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>School Fees Schedule</CardTitle>
                  <CardDescription>
                    Shown privately to each student on their dashboard. Not visible on the public website.
                  </CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addFeeRow}>
                  <Plus className="w-4 h-4 mr-1" /> Add Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {feeRows.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                  <p className="mb-3">No fee rows yet.</p>
                  <Button type="button" variant="outline" size="sm" onClick={addFeeRow}>
                    <Plus className="w-4 h-4 mr-1" /> Add First Row
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-sm font-medium text-muted-foreground px-1">
                    <span>Class / Level</span><span>Fee Amount (per term)</span><span></span>
                  </div>
                  {feeRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                      <Input placeholder="e.g. SSS 1 – 3" value={row.class} onChange={e => updateFeeRow(i, 'class', e.target.value)} />
                      <Input placeholder="e.g. ₦50,000" value={row.amount} onChange={e => updateFeeRow(i, 'amount', e.target.value)} />
                      <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeFeeRow(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground mt-4">
                    💡 Use ranges like <strong>Primary 1 – 3</strong> or individual classes like <strong>SSS 1</strong>.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PAYMENT ─────────────────────────────── */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Bank account details shown to students alongside their fee. Leave blank to hide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bank Name</Label>
                <Input value={formData.bank_name} onChange={e => set('bank_name', e.target.value)} placeholder="e.g. First Bank Nigeria" />
              </div>
              <div>
                <Label>Account Name</Label>
                <Input value={formData.account_name} onChange={e => set('account_name', e.target.value)} placeholder="e.g. Golden Star School" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input value={formData.account_number} onChange={e => set('account_number', e.target.value)} placeholder="e.g. 0123456789" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SOCIAL ──────────────────────────────── */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Links shown in the footer. Leave blank to hide the icon.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ['facebook',  'Facebook URL',  'https://facebook.com/…'],
                ['twitter',   'Twitter / X URL', 'https://twitter.com/…'],
                ['instagram', 'Instagram URL', 'https://instagram.com/…'],
                ['youtube',   'YouTube URL',   'https://youtube.com/…'],
              ].map(([k, label, ph]) => (
                <div key={k}>
                  <Label>{label}</Label>
                  <Input placeholder={ph} value={(formData as any)[k] || ''} onChange={e => set(k as keyof SchoolSettings, e.target.value)} />
                </div>
              ))}
              <div>
                <Label>WhatsApp Number</Label>
                <Input placeholder="e.g. 2348012345678 (country code + digits only)" value={formData.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Nigeria = 234. No spaces, dashes or plus sign.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={saving} className="w-full text-base py-5">
        {saving ? 'Saving…' : '💾 Save All Settings'}
      </Button>
    </form>
  );
}
