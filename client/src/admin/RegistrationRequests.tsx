import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3'];
const STREAMS = ['Science', 'Arts', 'Commercial'] as const;

interface RegistrationRequest {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  class_applying: string;
  requested_stream: string | null;
  previous_school: string | null;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  home_address: string | null;
  additional_info: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

export default function RegistrationRequests() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');

  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    registrationNumber: '',
    password: '',
    assignedClass: '',
    assignedStream: '',
  });
  const [approving, setApproving] = useState(false);

  useEffect(() => { fetchRequests(); }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('registration_requests')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (filterStatus === 'pending') q = q.eq('status', 'pending');
      const { data, error } = await q;
      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      toast.error('Failed to load requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (req: RegistrationRequest) => {
    setSelectedRequest(req);
    setApprovalForm({
      registrationNumber: '',
      password: '',
      assignedClass: req.class_applying,
      assignedStream: req.requested_stream || '',
    });
    setShowDetailsDialog(true);
  };

  const handleApproveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    // Validate
    if (!approvalForm.registrationNumber.trim()) { toast.error('Registration number required'); return; }
    if (!approvalForm.password.trim()) { toast.error('Initial password required'); return; }
    if (SSS_CLASSES.includes(approvalForm.assignedClass) && !approvalForm.assignedStream) {
      toast.error('Stream is required for SSS classes');
      return;
    }

    setApproving(true);
    try {
      // ⚠️ SECURITY: VITE_SUPABASE_SERVICE_KEY is visible in the browser bundle.
      // For production, move student creation to a Supabase Edge Function.
      // See supabase/README.md for instructions.
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
      if (!serviceKey) { toast.error('VITE_SUPABASE_SERVICE_KEY not configured'); setApproving(false); return; }

      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(
        import.meta.env.VITE_SUPABASE_URL, serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const email = `gss_${approvalForm.registrationNumber.replace(/\//g, '_')}@goldenstarschool.internal`;
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: approvalForm.password,
        email_confirm: true,
        user_metadata: { role: 'student', full_name: selectedRequest.full_name },
      });

      if (authError) { toast.error('Auth error: ' + authError.message); setApproving(false); return; }

      // 2. Call approve_registration function (creates student record + auto-assigns subjects)
      const { data: result, error: fnError } = await supabase.rpc('approve_registration', {
        p_request_id: selectedRequest.id,
        p_registration_number: approvalForm.registrationNumber,
        p_class: approvalForm.assignedClass,
        p_user_id: authData.user.id,
        p_stream: approvalForm.assignedStream || null,
      });

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      toast.success(
        `${selectedRequest.full_name} approved! Login: ${email}`
      );
      setShowDetailsDialog(false);
      fetchRequests();
    } catch (err: any) {
      toast.error('Approval failed: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectRequest = async (id: string, name: string) => {
    if (!confirm(`Reject registration request for ${name}?`)) return;
    const { error } = await supabase
      .from('registration_requests')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { toast.error('Failed to reject: ' + error.message); return; }
    toast.success('Request rejected');
    fetchRequests();
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Registration Requests</CardTitle>
            <CardDescription>Review and approve new student admission applications.</CardDescription>
          </div>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Only</SelectItem>
              <SelectItem value="all">All Requests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-6">Loading requests…</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            {filterStatus === 'pending' ? 'No pending requests.' : 'No requests found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class Applying</TableHead>
                  <TableHead>Stream Requested</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(req.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{req.full_name}</TableCell>
                    <TableCell>{req.class_applying}</TableCell>
                    <TableCell>
                      {req.requested_stream ? (
                        <Badge variant="outline">{req.requested_stream}</Badge>
                      ) : SSS_CLASSES.includes(req.class_applying) ? (
                        <span className="text-xs text-muted-foreground">Not specified</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{req.parent_name}</p>
                        <p className="text-xs text-muted-foreground">{req.parent_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell className="text-center">
                      {req.status === 'pending' && (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" onClick={() => openReviewDialog(req)}>Review</Button>
                          <Button size="sm" variant="destructive"
                            onClick={() => handleRejectRequest(req.id, req.full_name)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Details/Approval Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Registration Request</DialogTitle>
              <DialogDescription>Approve or reject this student admission application.</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Student info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Student Name</p><p className="font-semibold">{selectedRequest.full_name}</p></div>
                  <div><p className="text-muted-foreground">Gender</p><p className="font-semibold">{selectedRequest.gender || '—'}</p></div>
                  <div><p className="text-muted-foreground">Date of Birth</p><p className="font-semibold">{selectedRequest.date_of_birth || '—'}</p></div>
                  <div><p className="text-muted-foreground">Class Applying</p><p className="font-semibold">{selectedRequest.class_applying}</p></div>
                  {selectedRequest.requested_stream && (
                    <div><p className="text-muted-foreground">Requested Stream</p><p className="font-semibold">{selectedRequest.requested_stream}</p></div>
                  )}
                  <div><p className="text-muted-foreground">Previous School</p><p className="font-semibold">{selectedRequest.previous_school || '—'}</p></div>
                  <div><p className="text-muted-foreground">Parent Name</p><p className="font-semibold">{selectedRequest.parent_name}</p></div>
                  <div><p className="text-muted-foreground">Parent Phone</p><p className="font-semibold">{selectedRequest.parent_phone}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground">Parent Email</p><p className="font-semibold">{selectedRequest.parent_email}</p></div>
                  {selectedRequest.home_address && (
                    <div className="col-span-2"><p className="text-muted-foreground">Address</p><p className="font-semibold">{selectedRequest.home_address}</p></div>
                  )}
                </div>

                {/* Approval form */}
                <form onSubmit={handleApproveRequest} className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Approve Admission</h3>

                  <div>
                    <Label>Registration Number</Label>
                    <Input placeholder="e.g. GSS/2026/001"
                      value={approvalForm.registrationNumber}
                      onChange={e => setApprovalForm(f => ({ ...f, registrationNumber: e.target.value }))}
                      required />
                  </div>

                  <div>
                    <Label>Assign Class <span className="text-muted-foreground text-xs">(admin may override)</span></Label>
                    <Select value={approvalForm.assignedClass}
                      onValueChange={v => setApprovalForm(f => ({
                        ...f, assignedClass: v,
                        assignedStream: SSS_CLASSES.includes(v) ? f.assignedStream : '',
                      }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Nursery 1','Nursery 2','Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6',
                          'JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {SSS_CLASSES.includes(approvalForm.assignedClass) && (
                    <div>
                      <Label>
                        Stream <span className="text-destructive">*</span>
                        {selectedRequest.requested_stream && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            (applicant requested: {selectedRequest.requested_stream})
                          </span>
                        )}
                      </Label>
                      <Select value={approvalForm.assignedStream}
                        onValueChange={v => setApprovalForm(f => ({ ...f, assignedStream: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select stream…" /></SelectTrigger>
                        <SelectContent>
                          {STREAMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Initial Password</Label>
                    <Input type="password" placeholder="Set a password for the student"
                      value={approvalForm.password}
                      onChange={e => setApprovalForm(f => ({ ...f, password: e.target.value }))}
                      required />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline"
                      onClick={() => { setShowDetailsDialog(false); handleRejectRequest(selectedRequest.id, selectedRequest.full_name); }}>
                      Reject
                    </Button>
                    <Button type="submit" disabled={approving}>
                      {approving ? 'Approving…' : 'Approve & Create Account'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
