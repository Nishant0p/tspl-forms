'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getFormRequests, assignFormRequest, updateFormRequestStatus } from '@/app/actions/formRequest';
import FormRequestDialog from '@/components/FormRequestDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ClipboardList, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; variant: any; icon: any }> = {
  PENDING:     { label: 'Pending',     variant: 'secondary',    icon: Clock },
  IN_PROGRESS: { label: 'In Progress', variant: 'default',      icon: AlertCircle },
  COMPLETED:   { label: 'Completed',   variant: 'outline',      icon: CheckCircle2 },
  REJECTED:    { label: 'Rejected',    variant: 'destructive',  icon: XCircle },
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW:    'text-green-600',
  NORMAL: 'text-blue-600',
  HIGH:   'text-orange-500',
  URGENT: 'text-red-600 font-bold',
};

type FormRequest = Awaited<ReturnType<typeof getFormRequests>>[number];

export default function FormRequestsPage() {
  const [requests, setRequests]       = useState<FormRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<FormRequest | null>(null);
  const [notes, setNotes]             = useState('');
  const [newStatus, setNewStatus]     = useState('');
  const [isPending, startTransition]  = useTransition();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFormRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAssign = (id: number) => {
    startTransition(async () => {
      try {
        await assignFormRequest(id);
        toast({ title: 'Request picked up — status set to In Progress.' });
        await load();
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      }
    });
  };

  const handleStatusUpdate = () => {
    if (!selected || !newStatus) return;
    startTransition(async () => {
      try {
        await updateFormRequestStatus(selected.id, newStatus as any, notes);
        toast({ title: 'Status updated successfully.' });
        setSelected(null); setNotes(''); setNewStatus('');
        await load();
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      }
    });
  };

  const pending     = requests.filter(r => r.status === 'PENDING');
  const inProgress  = requests.filter(r => r.status === 'IN_PROGRESS');
  const done        = requests.filter(r => r.status === 'COMPLETED' || r.status === 'REJECTED');

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Form Build Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit a request for a new form to be built by the editor team.
          </p>
        </div>
        <FormRequestDialog onCreated={load} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',       count: requests.length,  color: 'text-foreground' },
          { label: 'Pending',     count: pending.length,   color: 'text-yellow-600' },
          { label: 'In Progress', count: inProgress.length,color: 'text-blue-600' },
          { label: 'Done',        count: done.length,      color: 'text-green-600' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground gap-3">
            <ClipboardList className="h-12 w-12 opacity-30" />
            <p className="font-medium">No form requests yet.</p>
            <p className="text-sm">Click &quot;New Form Request&quot; to ask the editor team to build a form.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => {
                  const cfg  = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => { setSelected(r); setNewStatus(r.status); setNotes(r.notes ?? ''); }}>
                      <TableCell className="font-medium max-w-[160px] truncate">{r.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.formType}</TableCell>
                      <TableCell className={`text-xs font-semibold ${PRIORITY_COLOR[r.priority] ?? ''}`}>{r.priority}</TableCell>
                      <TableCell className="text-xs">
                        {r.requestedBy.firstName} {r.requestedBy.lastName}
                        <span className="ml-1 text-muted-foreground">({r.requestedBy.role})</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit text-xs">
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        {r.status === 'PENDING' && (
                          <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleAssign(r.id)}>
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Pick Up'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Update Status Dialog */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Request</DialogTitle>
            <DialogDescription>{selected?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Description</p>
              {selected?.description}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Update Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROGRESS">🔵 In Progress</SelectItem>
                  <SelectItem value="COMPLETED">✅ Completed</SelectItem>
                  <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add context, links, or rejection reason…"
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
              <Button onClick={handleStatusUpdate} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
