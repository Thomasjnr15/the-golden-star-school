import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserCog, BookOpen, RefreshCw } from 'lucide-react';

const CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
];
const STREAMS = ['Science', 'Arts', 'Commercial'] as const;
type Stream = typeof STREAMS[number];
const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3'];

interface Student {
  id: string;
  user_id: string | null;
  full_name: string;
  registration_number: string;
  class: string;
  stream: string | null;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  is_active: boolean;
}

interface StudentSubject {
  id: string;
  subject_id: string;
  is_active: boolean;
  assigned_at: string;
  subject?: { name: string };
}

export default function ManageStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStream, setFilterStream] = useState('');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    registrationNumber: '', fullName: '', class: '', stream: '', password: '',
  });

  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [streamStudent, setStreamStudent] = useState<Student | null>(null);
  const [newStream, setNewStream] = useState<Stream | ''>('');
  const [streamChanging, setStreamChanging] = useState(false);

  const [showSubjectsDialog, setShowSubjectsDialog] = useState(false);
  const [subjectsStudent, setSubjectsStudent] = useState<Student | null>(null);
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjectToAdd, setSubjectToAdd] = useState('');
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, user_id, full_name, registration_number, class, stream, created_at')
        .order('class').order('full_name');
      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      toast.error('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (SSS_CLASSES.includes(addForm.class) && !addForm.stream) {
      toast.error('Stream is required for SSS classes');
      return;
    }
    if (!SSS_CLASSES.includes(addForm.class) && addForm.stream) {
      toast.error('Stream must not be set for non-SSS classes');
      return;
    }
    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
        body: JSON.stringify({
          registrationNumber: addForm.registrationNumber,
          fullName: addForm.fullName,
          password: addForm.password,
          class: addForm.class,
          stream: addForm.stream || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student');
      }
      toast.success(`Student added! Login: ${addForm.registrationNumber}`);
      setAddForm({ registrationNumber: '', fullName: '', class: '', stream: '', password: '' });
      setShowAddDialog(false);
      fetchStudents();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const openStreamDialog = (student: Student) => {
    setStreamStudent(student);
    setNewStream((student.stream as Stream) || '');
    setShowStreamDialog(true);
  };

  const handleChangeStream = async () => {
    if (!streamStudent || !newStream) { toast.error('Select a stream'); return; }
    setStreamChanging(true);
    try {
      const { data, error } = await supabase.rpc('change_student_stream', {
        p_student_id: streamStudent.id,
        p_new_stream: newStream,
        p_changed_by: user?.id,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Stream changed to ${newStream}. ${data.subjects_deactivated} incompatible subjects deactivated, ${data.subjects_added} new subjects assigned.`);
      setShowStreamDialog(false);
      fetchStudents();
    } catch (err: any) {
      toast.error('Stream change failed: ' + err.message);
    } finally {
      setStreamChanging(false);
    }
  };

  const openSubjectsDialog = async (student: Student) => {
    setSubjectsStudent(student);
    setShowSubjectsDialog(true);
    setSubjectsLoading(true);
    try {
      const [ssRes, subRes] = await Promise.all([
        supabase
          .from('student_subjects')
          .select('id, subject_id, is_active, assigned_at, subject:subject_id(name)')
          .eq('student_id', student.id)
          .order('assigned_at'),
        supabase.from('subjects').select('id, name, is_active').eq('is_active', true).order('name'),
      ]);
      setStudentSubjects(ssRes.data || []);
      setAllSubjects(subRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load subjects');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleAddSubjectToStudent = async () => {
    if (!subjectsStudent || !subjectToAdd) return;
    const { error } = await supabase.from('student_subjects').insert([{
      student_id: subjectsStudent.id,
      subject_id: subjectToAdd,
      assigned_by: user?.id,
      is_active: true,
    }]);
    if (error) {
      if (error.code === '23505') { toast.error('Subject already assigned'); return; }
      toast.error('Failed to assign: ' + error.message); return;
    }
    toast.success('Subject assigned');
    setSubjectToAdd('');
    openSubjectsDialog(subjectsStudent);
  };

  const handleToggleStudentSubject = async (ss: StudentSubject) => {
    const { error } = await supabase
      .from('student_subjects').update({ is_active: !ss.is_active }).eq('id', ss.id);
    if (error) { toast.error('Failed to update'); return; }
    setStudentSubjects(prev =>
      prev.map(s => s.id === ss.id ? { ...s, is_active: !s.is_active } : s)
    );
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Delete ${student.full_name}? This is permanent.`)) return;
    const { error } = await supabase.from('students').delete().eq('id', student.id);
    if (error) { toast.error('Delete failed: ' + error.message); return; }
    toast.success('Student deleted');
    fetchStudents();
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = !filterClass || s.class === filterClass;
    const matchStream = !filterStream || s.stream === filterStream;
    return matchSearch && matchClass && matchStream;
  });

  const unassignedForStudent = allSubjects.filter(
    sub => !studentSubjects.some(ss => ss.subject_id === sub.id && ss.is_active)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Manage Students</CardTitle>
              <CardDescription>View and manage student records, streams, and subject assignments.</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild><Button>Add Student</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>Create a student account. Stream required for SSS classes.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4 pt-2">
                  <div>
                    <Label>Registration Number</Label>
                    <Input value={addForm.registrationNumber}
                      onChange={e => setAddForm(f => ({ ...f, registrationNumber: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <Input value={addForm.fullName}
                      onChange={e => setAddForm(f => ({ ...f, fullName: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Class</Label>
                    <Select value={addForm.class}
                      onValueChange={v => setAddForm(f => ({
                        ...f, class: v,
                        stream: SSS_CLASSES.includes(v) ? f.stream : '',
                      }))}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {SSS_CLASSES.includes(addForm.class) && (
                    <div>
                      <Label>Stream <span className="text-destructive">*</span></Label>
                      <Select value={addForm.stream}
                        onValueChange={v => setAddForm(f => ({ ...f, stream: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                        <SelectContent>
                          {STREAMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Initial Password</Label>
                    <Input type="password" placeholder="Min 6 characters"
                      value={addForm.password}
                      onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} required />
                    <p className="text-xs text-muted-foreground mt-1">
                      Student logs in with registration number + this password.
                    </p>
                  </div>
                  <Button type="submit" className="w-full">Add Student</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Input placeholder="Search name or reg number..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 min-w-48" />
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStream} onValueChange={setFilterStream}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Streams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Streams</SelectItem>
                {STREAMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-6">Loading...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No students found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.registration_number}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>
                        {student.stream ? (
                          <Badge variant="outline">{student.stream}</Badge>
                        ) : SSS_CLASSES.includes(student.class) ? (
                          <Badge variant="destructive" className="text-xs">Unassigned</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {SSS_CLASSES.includes(student.class) && (
                            <Button size="sm" variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => openStreamDialog(student)}>
                              <RefreshCw className="w-3 h-3" /> Stream
                            </Button>
                          )}
                          <Button size="sm" variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => openSubjectsDialog(student)}>
                            <BookOpen className="w-3 h-3" /> Subjects
                          </Button>
                          <Button size="sm" variant="destructive"
                            onClick={() => handleDeleteStudent(student)}>
                            Delete
                          </Button>
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

      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Stream</DialogTitle>
            <DialogDescription>
              {streamStudent?.full_name} — {streamStudent?.class}. Changing stream will deactivate incompatible subjects but preserve historical records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>New Stream</Label>
              <Select value={newStream} onValueChange={v => setNewStream(v as Stream)}>
                <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                <SelectContent>
                  {STREAMS.map(s => (
                    <SelectItem key={s} value={s}>
                      {s} {s === streamStudent?.stream ? '(current)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <p className="font-semibold">Important</p>
              <p>Subjects not in {newStream || 'the new'} stream will be deactivated. Historical exam scores and report cards are preserved.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowStreamDialog(false)}>Cancel</Button>
              <Button onClick={handleChangeStream} disabled={streamChanging || !newStream || newStream === streamStudent?.stream}>
                {streamChanging ? 'Changing...' : 'Change Stream'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubjectsDialog} onOpenChange={setShowSubjectsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" /> Subject Assignments
            </DialogTitle>
            <DialogDescription>
              {subjectsStudent?.full_name} — {subjectsStudent?.class}
              {subjectsStudent?.stream && ` (${subjectsStudent.stream})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {subjectsLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <Select value={subjectToAdd} onValueChange={setSubjectToAdd}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Assign optional subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedForStudent.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddSubjectToStudent} disabled={!subjectToAdd}>Assign</Button>
                </div>

                {studentSubjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No subjects assigned yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead className="text-center">Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentSubjects.map(ss => (
                        <TableRow key={ss.id}>
                          <TableCell>{ss.subject?.name || ss.subject_id}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ss.assigned_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={ss.is_active}
                              onCheckedChange={() => handleToggleStudentSubject(ss)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
