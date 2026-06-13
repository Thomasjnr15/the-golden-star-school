import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowRight, History, GraduationCap } from 'lucide-react';

const CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
] as const;

const STREAMS = ['Science', 'Arts', 'Commercial'] as const;
type Stream = typeof STREAMS[number];

const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3'];

// Map each class to valid promotion targets
const PROMOTION_MAP: Record<string, string[]> = {
  'Nursery 1': ['Nursery 2'],
  'Nursery 2': ['Primary 1'],
  'Primary 1': ['Primary 2'],
  'Primary 2': ['Primary 3'],
  'Primary 3': ['Primary 4'],
  'Primary 4': ['Primary 5'],
  'Primary 5': ['Primary 6'],
  'Primary 6': ['JSS 1'],
  'JSS 1': ['JSS 2'],
  'JSS 2': ['JSS 3'],
  'JSS 3': ['SSS 1'],
  'SSS 1': ['SSS 2'],
  'SSS 2': ['SSS 3'],
  'SSS 3': [], // final class
};

interface Student {
  id: string;
  full_name: string;
  registration_number: string;
  class: string;
  stream: string | null;
}

interface PromotionHistory {
  id: string;
  from_class: string;
  to_class: string;
  from_stream: string | null;
  to_stream: string | null;
  promoted_at: string;
  notes: string | null;
  student?: { full_name: string; registration_number: string };
}

export default function PromoteStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [history, setHistory] = useState<PromotionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [promotionForm, setPromotionForm] = useState({
    to_class: '',
    to_stream: '' as Stream | '',
    notes: '',
  });
  const [promoting, setPromoting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchHistory();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, registration_number, class, stream')
        .order('class')
        .order('full_name');
      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      toast.error('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('promotion_history')
        .select(`
          id, from_class, to_class, from_stream, to_stream, promoted_at, notes,
          student:student_id(full_name, registration_number)
        `)
        .order('promoted_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error('History error:', err);
    }
  };

  const openPromotionDialog = (student: Student) => {
    const validTargets = PROMOTION_MAP[student.class] || [];
    setSelectedStudent(student);
    setPromotionForm({
      to_class: validTargets[0] || '',
      to_stream: student.stream as Stream | '',
      notes: '',
    });
    setShowDialog(true);
  };

  const requiresStream = (toClass: string) => SSS_CLASSES.includes(toClass);

  const isJSS3toSSS1 = (fromClass: string, toClass: string) =>
    fromClass === 'JSS 3' && toClass === 'SSS 1';

  const handlePromote = async () => {
    if (!selectedStudent || !promotionForm.to_class) return;

    // Validation
    if (requiresStream(promotionForm.to_class)) {
      if (isJSS3toSSS1(selectedStudent.class, promotionForm.to_class) && !promotionForm.to_stream) {
        toast.error('Stream is required when promoting from JSS 3 to SSS 1');
        return;
      }
    }

    setPromoting(true);
    try {
      const { data, error } = await supabase.rpc('promote_student', {
        p_student_id: selectedStudent.id,
        p_to_class: promotionForm.to_class,
        p_to_stream: promotionForm.to_stream || null,
        p_promoted_by: user?.id || null,
        p_notes: promotionForm.notes || null,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(
        `${selectedStudent.full_name} promoted to ${promotionForm.to_class}` +
        (data?.stream ? ` (${data.stream})` : '')
      );
      setShowDialog(false);
      fetchStudents();
      fetchHistory();
    } catch (err: any) {
      toast.error('Promotion failed: ' + err.message);
    } finally {
      setPromoting(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = !filterClass || s.class === filterClass;
    return matchSearch && matchClass;
  });

  const validTargets = selectedStudent ? (PROMOTION_MAP[selectedStudent.class] || []) : [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="promote">
        <TabsList>
          <TabsTrigger value="promote" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Promote Students
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" /> Promotion History
          </TabsTrigger>
        </TabsList>

        {/* Promote Tab */}
        <TabsContent value="promote">
          <Card>
            <CardHeader>
              <CardTitle>Student Promotion</CardTitle>
              <CardDescription>
                Manually promote students to the next class. JSS 3 → SSS 1 requires stream selection.
                SSS promotions carry forward the existing stream (admin can override).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 flex-wrap">
                <Input
                  placeholder="Search by name or reg. number…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-48"
                />
                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {loading ? (
                <p className="text-center text-muted-foreground py-6">Loading students…</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No students found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. No.</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Current Class</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead>Promote To</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(student => {
                        const targets = PROMOTION_MAP[student.class] || [];
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-mono text-sm">{student.registration_number}</TableCell>
                            <TableCell className="font-medium">{student.full_name}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>
                              {student.stream ? (
                                <Badge variant="outline">{student.stream}</Badge>
                              ) : SSS_CLASSES.includes(student.class) ? (
                                <Badge variant="destructive" className="text-xs">No stream</Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {targets.length > 0 ? (
                                <span className="flex items-center gap-1 text-sm">
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                  {targets[0]}
                                  {requiresStream(targets[0]) && !student.stream && targets[0] !== 'SSS 1' && (
                                    <span className="text-xs text-muted-foreground">(stream carries)</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Final class</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {targets.length > 0 && (
                                <Button
                                  size="sm"
                                  onClick={() => openPromotionDialog(student)}
                                >
                                  Promote
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Promotion History</CardTitle>
              <CardDescription>Full audit trail of all student promotions.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No promotion history yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Stream Change</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map(h => (
                        <TableRow key={h.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(h.promoted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{(h.student as any)?.full_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{(h.student as any)?.registration_number}</p>
                            </div>
                          </TableCell>
                          <TableCell>{h.from_class}</TableCell>
                          <TableCell className="font-semibold">{h.to_class}</TableCell>
                          <TableCell>
                            {h.from_stream || h.to_stream ? (
                              <span className="text-sm">
                                {h.from_stream || '—'} → {h.to_stream || '—'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">No stream</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{h.notes || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Promotion Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Student</DialogTitle>
            <DialogDescription>
              {selectedStudent?.full_name} — currently in {selectedStudent?.class}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 pt-2">
              {/* Target class */}
              <div>
                <Label>Promote To Class</Label>
                <Select
                  value={promotionForm.to_class}
                  onValueChange={v => {
                    // Auto carry stream for SSS->SSS, clear for JSS3->SSS1
                    const newStream = isJSS3toSSS1(selectedStudent.class, v)
                      ? ''
                      : (SSS_CLASSES.includes(v) ? (selectedStudent.stream as Stream || '') : '');
                    setPromotionForm(f => ({ ...f, to_class: v, to_stream: newStream as Stream | '' }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {validTargets.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Stream selector — shown only for SSS target */}
              {requiresStream(promotionForm.to_class) && (
                <div>
                  <Label>
                    Stream
                    {isJSS3toSSS1(selectedStudent.class, promotionForm.to_class)
                      ? <span className="text-destructive ml-1">*</span>
                      : <span className="text-muted-foreground ml-1 text-xs">(carries forward — override optional)</span>
                    }
                  </Label>
                  <Select
                    value={promotionForm.to_stream}
                    onValueChange={v => setPromotionForm(f => ({ ...f, to_stream: v as Stream }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select stream…" /></SelectTrigger>
                    <SelectContent>
                      {STREAMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {isJSS3toSSS1(selectedStudent.class, promotionForm.to_class) && !promotionForm.to_stream && (
                    <p className="text-xs text-destructive mt-1">Stream is required for SSS 1 admission.</p>
                  )}
                </div>
              )}

              {/* Summary preview */}
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p className="font-semibold">Promotion Summary</p>
                <p>{selectedStudent.class} → <strong>{promotionForm.to_class || '…'}</strong></p>
                {requiresStream(promotionForm.to_class) && (
                  <p>Stream: <strong>{promotionForm.to_stream || 'Not selected'}</strong></p>
                )}
                {requiresStream(promotionForm.to_class) && promotionForm.to_stream && (
                  <p className="text-xs text-muted-foreground">
                    Compulsory subjects for {promotionForm.to_stream} will be auto-assigned.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="e.g. End of session promotion"
                  value={promotionForm.notes}
                  onChange={e => setPromotionForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button
                  onClick={handlePromote}
                  disabled={promoting || !promotionForm.to_class ||
                    (isJSS3toSSS1(selectedStudent.class, promotionForm.to_class) && !promotionForm.to_stream)
                  }
                >
                  {promoting ? 'Promoting…' : 'Confirm Promotion'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
