import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

interface ReportCard {
  id: string;
  student_id: string;
  term: string;
  session: string;
  class: string;
  total_score: number | null;
  average_score: number | null;
  overall_grade: string | null;
  position_in_class: number | null;
  total_students_in_class: number | null;
  is_published: boolean;
  student?: { full_name: string; registration_number: string; stream: string | null };
}

interface ScoreComponent {
  subject: string;
  ca_score: number | null;
  ppt_score: number | null;
  exam_score: number | null;
  total_score: number | null;
  ca_max: number;
  ppt_max: number;
  exam_max: number;
  max_total: number;
}

const TERMS = ['1st Term', '2nd Term', '3rd Term'];
const SESSIONS = ['2024/2025', '2025/2026', '2026/2027'];
const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3'];

export default function ReportCardManager() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => {
    if (selectedTerm && selectedSession && selectedClass) fetchReportCards();
  }, [selectedTerm, selectedSession, selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data } = await supabase.from('students').select('class');
      const unique = Array.from(new Set((data || []).map((s: any) => s.class))).filter(Boolean);
      setClasses(unique as string[]);
    } catch (err) { console.error('Classes error:', err); }
  };

  const fetchReportCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_cards')
        .select(`
          id, student_id, term, session, class,
          total_score, average_score, overall_grade,
          position_in_class, total_students_in_class, is_published,
          student:student_id(full_name, registration_number, stream)
        `)
        .eq('term', selectedTerm)
        .eq('session', selectedSession)
        .eq('class', selectedClass)
        .order('average_score', { ascending: false });

      if (error) throw error;
      setReportCards((data || []).map((rc: any) => ({ ...rc, student: rc.student })));
    } catch (err: any) {
      toast.error('Failed to load report cards: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns score components filtered to only the student's ACTIVE assigned subjects.
   * For non-SSS students, all score components are returned (backward compatible).
   */
  const fetchStudentScores = async (studentId: string, studentClass: string): Promise<ScoreComponent[]> => {
    let subjectFilter: string[] | null = null;
    if (SSS_CLASSES.includes(studentClass)) {
      const { data: assignedSubjects } = await supabase
        .from('student_subjects')
        .select('subject:subject_id(name)')
        .eq('student_id', studentId)
        .eq('is_active', true);
      subjectFilter = (assignedSubjects || []).map((row: any) => row.subject?.name).filter(Boolean);
    }

    const { data: scores, error } = await supabase
      .from('score_components')
      .select('subject, ca_score, ppt_score, exam_score, total_score, ca_max, ppt_max, exam_max, max_total')
      .eq('student_id', studentId)
      .eq('term', selectedTerm)
      .eq('session', selectedSession);

    if (error) throw error;
    let result = scores || [];
    if (subjectFilter !== null) {
      result = result.filter(s => subjectFilter!.includes(s.subject));
    }
    return result;
  };

  const generatePDF = async (reportCardId: string) => {
    setGeneratingPDF(reportCardId);
    try {
      const reportCard = reportCards.find(rc => rc.id === reportCardId);
      if (!reportCard) return;

      const scores = await fetchStudentScores(reportCard.student_id, reportCard.class);
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 20;

      pdf.setFontSize(18);
      pdf.text('GOLDEN STAR SCHOOL', pageWidth / 2, y, { align: 'center' });
      y += 8;
      pdf.setFontSize(12);
      pdf.text('STUDENT REPORT CARD', pageWidth / 2, y, { align: 'center' });
      y += 12;

      pdf.setFontSize(10);
      pdf.text(`Student Name: ${reportCard.student?.full_name || 'N/A'}`, 20, y);
      y += 6;
      pdf.text(`Registration: ${reportCard.student?.registration_number || 'N/A'}`, 20, y);
      y += 6;
      pdf.text(`Class: ${reportCard.class}`, 20, y);
      if (reportCard.student?.stream) {
        pdf.text(`Stream: ${reportCard.student.stream}`, pageWidth - 20, y, { align: 'right' });
      }
      y += 6;
      pdf.text(`Term: ${selectedTerm}`, 20, y);
      pdf.text(`Session: ${selectedSession}`, pageWidth - 20, y, { align: 'right' });
      y += 14;

      autoTable(pdf, {
        head: [['Subject', 'CA', '(Max)', 'PPT', '(Max)', 'Exam', '(Max)', 'Total', '(Max)']],
        body: scores.map(s => [
          s.subject,
          s.ca_score !== null ? s.ca_score.toFixed(1) : '-',
          `(${s.ca_max})`,
          s.ppt_score !== null ? s.ppt_score.toFixed(1) : '-',
          `(${s.ppt_max})`,
          s.exam_score !== null ? s.exam_score.toFixed(1) : '-',
          `(${s.exam_max})`,
          s.total_score !== null ? s.total_score.toFixed(1) : '-',
          `(${s.max_total})`,
        ]),
        startY: y,
        margin: { left: 20, right: 20 },
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [12, 27, 58], textColor: 255 },
        columnStyles: { 0: { cellWidth: 40 } },
      });

      y = (pdf as any).lastAutoTable.finalY + 10;
      pdf.setFontSize(11);
      pdf.text('SUMMARY', 20, y); y += 8;
      pdf.setFontSize(10);
      pdf.text(`Total Score: ${reportCard.total_score ?? 'N/A'}`, 20, y); y += 6;
      pdf.text(`Average Score: ${reportCard.average_score?.toFixed(1) ?? 'N/A'}`, 20, y); y += 6;
      pdf.text(`Overall Grade: ${reportCard.overall_grade ?? 'N/A'}`, 20, y); y += 6;
      pdf.text(`Position: ${reportCard.position_in_class ?? 'N/A'} of ${reportCard.total_students_in_class ?? 'N/A'}`, 20, y);
      y += 12;

      if (remarks[reportCardId]) {
        pdf.setFontSize(11);
        pdf.text('TEACHER REMARKS', 20, y); y += 6;
        pdf.setFontSize(10);
        pdf.text(pdf.splitTextToSize(remarks[reportCardId], pageWidth - 40), 20, y);
      }

      pdf.setFontSize(8);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
      const filename = `${reportCard.student?.registration_number || 'Report'}_${selectedTerm}_${selectedSession}.pdf`;
      pdf.save(filename);
      await supabase.from('report_cards').update({ pdf_url: filename }).eq('id', reportCardId);
      toast.success('PDF downloaded');
    } catch (err: any) {
      toast.error('Failed to generate PDF: ' + err.message);
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handlePublishOne = async (id: string) => {
    setPublishing(id);
    try {
      const { error } = await supabase.from('report_cards')
        .update({ is_published: true, published_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setReportCards(prev => prev.map(rc => rc.id === id ? { ...rc, is_published: true } : rc));
      toast.success('Report card published');
    } catch (err: any) {
      toast.error('Failed: ' + err.message);
    } finally { setPublishing(null); }
  };

  const handlePublishAll = async () => {
    const ids = reportCards.filter(rc => !rc.is_published).map(rc => rc.id);
    if (!ids.length) { toast.info('All already published'); return; }
    setPublishing('all');
    try {
      const { error } = await supabase.from('report_cards')
        .update({ is_published: true, published_at: new Date().toISOString() }).in('id', ids);
      if (error) throw error;
      setReportCards(prev => prev.map(rc => ({ ...rc, is_published: true })));
      toast.success(`Published ${ids.length} report cards`);
    } catch (err: any) {
      toast.error('Failed: ' + err.message);
    } finally { setPublishing(null); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Card Manager</CardTitle>
          <CardDescription>
            Generate and publish student report cards. SSS report cards display only subjects assigned to each student.
            Historical report cards remain unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger><SelectValue placeholder="Select term…" /></SelectTrigger>
                <SelectContent>{TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger><SelectValue placeholder="Select session…" /></SelectTrigger>
                <SelectContent>{SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger><SelectValue placeholder="Select class…" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handlePublishAll}
                disabled={!selectedTerm || !selectedSession || !selectedClass || !reportCards.length || publishing === 'all'}
                className="w-full"
              >
                Publish All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTerm && selectedSession && selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Report Cards</CardTitle>
            <CardDescription>
              {reportCards.length} cards — {reportCards.filter(rc => rc.is_published).length} published
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-6">Loading…</p>
            ) : !reportCards.length ? (
              <p className="text-center text-muted-foreground py-6">No report cards found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg. No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Stream</TableHead>
                      <TableHead className="text-right">Average</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Position</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCards.map(rc => (
                      <TableRow key={rc.id}>
                        <TableCell className="font-mono text-sm">{rc.student?.registration_number || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{rc.student?.full_name || 'N/A'}</TableCell>
                        <TableCell>
                          {rc.student?.stream
                            ? <Badge variant="outline">{rc.student.stream}</Badge>
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{rc.average_score?.toFixed(1) ?? 'N/A'}</TableCell>
                        <TableCell className="text-center font-bold">{rc.overall_grade ?? 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          {rc.position_in_class ? `${rc.position_in_class}/${rc.total_students_in_class}` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            rc.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rc.is_published ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            className="text-xs min-h-0 h-12 resize-none w-36"
                            placeholder="Remarks…"
                            value={remarks[rc.id] || ''}
                            onChange={e => setRemarks(p => ({ ...p, [rc.id]: e.target.value }))}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" variant="outline"
                              onClick={() => generatePDF(rc.id)}
                              disabled={generatingPDF === rc.id}
                              title="Download PDF">
                              <Download className="w-4 h-4" />
                            </Button>
                            {!rc.is_published && (
                              <Button size="sm" variant="outline"
                                onClick={() => handlePublishOne(rc.id)}
                                disabled={publishing === rc.id}>
                                Publish
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
