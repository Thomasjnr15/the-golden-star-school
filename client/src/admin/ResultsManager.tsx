import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Download, Upload } from 'lucide-react';

interface ExamResult {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  total: number;
  percentage: number;
  is_published: boolean;
  student?: { full_name: string; registration_number: string };
  exam?: { title: string; subject: string };
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
}

export default function ResultsManager() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchResults(selectedExam);
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('id, title, subject, class')
        .order('date', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    }
  };

  const fetchResults = async (examId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          id,
          student_id,
          exam_id,
          score,
          total,
          percentage,
          is_published,
          students:student_id(full_name, registration_number),
          exams:exam_id(title, subject)
        `)
        .eq('exam_id', examId)
        .order('percentage', { ascending: false });

      if (error) throw error;

      // Transform data to flatten nested objects
      const transformedData = (data || []).map((result: any) => ({
        ...result,
        student: result.students,
        exam: result.exams,
      }));

      setResults(transformedData);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResult = async (resultId: string) => {
    setPublishing(resultId);
    try {
      const { error } = await supabase
        .from('exam_results')
        .update({ is_published: true, published_at: new Date().toISOString() })
        .eq('id', resultId);

      if (error) throw error;

      setResults(results.map(r => r.id === resultId ? { ...r, is_published: true } : r));
      toast.success('Result published successfully');
    } catch (error) {
      console.error('Error publishing result:', error);
      toast.error('Failed to publish result');
    } finally {
      setPublishing(null);
    }
  };

  const handlePublishAll = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }

    setPublishing('all');
    try {
      const unpublishedIds = results.filter(r => !r.is_published).map(r => r.id);

      if (unpublishedIds.length === 0) {
        toast.info('All results are already published');
        setPublishing(null);
        return;
      }

      const { error } = await supabase
        .from('exam_results')
        .update({ is_published: true, published_at: new Date().toISOString() })
        .in('id', unpublishedIds);

      if (error) throw error;

      setResults(results.map(r => ({ ...r, is_published: true })));
      toast.success(`Published ${unpublishedIds.length} results`);
    } catch (error) {
      console.error('Error publishing results:', error);
      toast.error('Failed to publish results');
    } finally {
      setPublishing(null);
    }
  };

  const handleExportToExcel = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const exportData = results.map(r => ({
      'Registration Number': r.student?.registration_number || 'N/A',
      'Student Name': r.student?.full_name || 'N/A',
      'Score': r.score,
      'Total': r.total,
      'Percentage': `${r.percentage}%`,
      'Grade': getGrade(r.percentage),
      'Published': r.is_published ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

    const exam = exams.find(e => e.id === selectedExam);
    const filename = `${exam?.subject || 'Results'}_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.success('Results exported successfully');
  };

  const handleImportFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate and import data
      let imported = 0;
      for (const row of jsonData as any[]) {
        const registrationNumber = row['Registration Number'];
        const score = parseInt(row['Score']);
        const total = parseInt(row['Total']);

        if (!registrationNumber || !score || !total) {
          console.warn('Skipping invalid row:', row);
          continue;
        }

        // Find student by registration number
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('registration_number', registrationNumber)
          .single();

        if (!students) {
          console.warn('Student not found:', registrationNumber);
          continue;
        }

        // Update or create result
        const { error } = await supabase
          .from('exam_results')
          .upsert({
            student_id: students.id,
            exam_id: selectedExam,
            score,
            total,
          }, { onConflict: 'student_id,exam_id' });

        if (!error) imported++;
      }

      toast.success(`Imported ${imported} results`);
      fetchResults(selectedExam);
    } catch (error) {
      console.error('Error importing results:', error);
      toast.error('Failed to import results');
    }
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Results Manager</CardTitle>
          <CardDescription>Manage exam results, publish scores, and export data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exam-select">Select Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger id="exam-select">
                  <SelectValue placeholder="Choose an exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.subject} - {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handlePublishAll} disabled={!selectedExam || publishing === 'all'}>
                Publish All Results
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={handleExportToExcel} disabled={!selectedExam || results.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="import-file">Import Results from Excel</Label>
            <Input
              id="import-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportFromExcel}
              disabled={!selectedExam}
            />
          </div>
        </CardContent>
      </Card>

      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results.length} results | {results.filter(r => r.is_published).length} published
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground">Loading results...</div>
            ) : results.length === 0 ? (
              <div className="text-center text-muted-foreground">No results found for this exam.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(result => (
                      <TableRow key={result.id}>
                        <TableCell className="font-mono text-sm">
                          {result.student?.registration_number || 'N/A'}
                        </TableCell>
                        <TableCell>{result.student?.full_name || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {result.score}/{result.total}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {result.percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {getGrade(result.percentage)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            result.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.is_published ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {!result.is_published && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublishResult(result.id)}
                              disabled={publishing === result.id}
                            >
                              Publish
                            </Button>
                          )}
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
