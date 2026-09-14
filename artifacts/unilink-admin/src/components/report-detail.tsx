import { useState, useCallback } from 'react';
import { 
  useResolveModerationReport, 
  useRemoveAbusiveUser,
  getGetModerationSummaryQueryKey,
  getListModerationReportsQueryKey,
  ModerationReport,
  ReportResolutionInputStatus
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, ShieldAlert, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReportDetail({ report, onClose }: { report: ModerationReport, onClose: () => void }) {
  const queryClient = useQueryClient();
  const resolveReport = useResolveModerationReport();
  const removeUser = useRemoveAbusiveUser();
  const [adminNote, setAdminNote] = useState('');
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeReason, setRemoveReason] = useState('');

  const invalidateCaches = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetModerationSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListModerationReportsQueryKey({ status: 'pending' }) });
    queryClient.invalidateQueries({ queryKey: getListModerationReportsQueryKey({ status: 'reviewed' }) });
    queryClient.invalidateQueries({ queryKey: getListModerationReportsQueryKey({ status: 'actioned' }) });
    queryClient.invalidateQueries({ queryKey: getListModerationReportsQueryKey({ status: 'dismissed' }) });
  }, [queryClient]);

  const handleResolve = (status: ReportResolutionInputStatus) => {
    resolveReport.mutate({
      reportId: report.id,
      data: { status, adminNote }
    }, {
      onSuccess: () => {
        toast.success(`Report marked as ${status}`);
        invalidateCaches();
        onClose();
      },
      onError: (err: any) => toast.error(err.message || 'Failed to update report')
    });
  };

  const handleRemoveUser = () => {
    if (!removeReason.trim()) {
      toast.error('Removal reason is required');
      return;
    }
    removeUser.mutate({
      userId: report.reported.id,
      data: { reason: removeReason, reportId: report.id }
    }, {
      onSuccess: () => {
        toast.success('User removed from UniLink');
        handleResolve('actioned'); // Auto-action the report when removing the user
        setShowRemoveDialog(false);
      },
      onError: (err: any) => toast.error(err.message || 'Failed to remove user')
    });
  };

  return (
    <div className="w-[400px] border-l bg-card flex flex-col shadow-2xl shrink-0 z-10 animate-in slide-in-from-right-8 duration-300 ease-out">
      <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-card">
        <h2 className="font-semibold text-foreground">Report Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><X className="w-4 h-4" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background/30">
        
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Reported User</h3>
          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-sm">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={report.reported.profilePicture || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">{report.reported.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">{report.reported.firstName}</div>
              <div className="text-xs text-muted-foreground truncate">{report.reported.email}</div>
              {report.reported.university && <div className="text-xs text-muted-foreground truncate mt-0.5">{report.reported.university}</div>}
            </div>
            {report.reported.moderationStatus === 'removed' && (
              <Badge variant="destructive" className="shrink-0 text-[10px] uppercase font-bold tracking-wider">Removed</Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Report Info</h3>
          <div className="space-y-4 bg-card p-4 rounded-xl border shadow-sm">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Category</div>
              <Badge variant="secondary" className="capitalize font-medium">{report.category}</Badge>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Details Provided</div>
              <div className="text-sm bg-accent/30 p-3 rounded-lg border text-foreground leading-relaxed italic relative">
                <span className="absolute -left-1 top-2 text-2xl text-muted-foreground/30 font-serif">"</span>
                {report.details}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Date</div>
              <div className="text-sm font-medium">{format(new Date(report.createdAt), 'PPpp')}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Reporter</h3>
          <div className="flex items-center gap-3 p-3 bg-card rounded-xl border shadow-sm">
            <Avatar className="h-8 w-8">
              <AvatarImage src={report.reporter.profilePicture || undefined} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">{report.reporter.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-sm min-w-0 flex-1">
              <div className="font-medium truncate">{report.reporter.firstName}</div>
              <div className="text-xs text-muted-foreground truncate">{report.reporter.email}</div>
            </div>
          </div>
        </div>

        {report.status === 'pending' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resolution</h3>
            <Textarea 
              placeholder="Add an internal admin note (optional)..." 
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              className="resize-none h-24 text-sm bg-card"
            />
          </div>
        )}
        
        {report.adminNote && report.status !== 'pending' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin Note</h3>
            <div className="text-sm bg-card p-4 rounded-xl border leading-relaxed">{report.adminNote}</div>
          </div>
        )}

      </div>

      {report.status === 'pending' && (
        <div className="p-6 border-t bg-card space-y-3 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleResolve('dismissed')}
              disabled={resolveReport.isPending}
              className="font-semibold"
            >
              Dismiss
            </Button>
            <Button 
              onClick={() => handleResolve('reviewed')}
              disabled={resolveReport.isPending}
              className="font-semibold"
            >
              Mark Reviewed
            </Button>
          </div>
          <Button 
            variant="destructive" 
            className="w-full font-semibold"
            onClick={() => setShowRemoveDialog(true)}
            disabled={report.reported.moderationStatus === 'removed'}
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Remove User
          </Button>
        </div>
      )}

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Remove Abusive User
            </DialogTitle>
            <DialogDescription>
              This is a destructive action. Removing <strong className="text-foreground">{report.reported.firstName}</strong> will immediately revoke their access to UniLink. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-semibold mb-2 block text-foreground">Reason for removal</label>
            <Textarea 
              placeholder="e.g. Repeated harassment and violation of community guidelines..."
              value={removeReason}
              onChange={e => setRemoveReason(e.target.value)}
              className="resize-none h-24"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveUser}
              disabled={removeUser.isPending || !removeReason.trim()}
            >
              {removeUser.isPending ? 'Removing...' : 'Confirm Removal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}