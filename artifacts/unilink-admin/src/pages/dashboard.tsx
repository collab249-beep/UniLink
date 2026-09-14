import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import {
  useGetModerationSummary,
  getGetModerationSummaryQueryKey,
  useListModerationReports,
  getListModerationReportsQueryKey,
  ListModerationReportsStatus
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ReportDetail } from '@/components/report-detail';
import { Shield, Inbox, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ListModerationReportsStatus>('pending');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { data: summary, isLoading: loadingSummary } = useGetModerationSummary({
    query: { queryKey: getGetModerationSummaryQueryKey() }
  });

  const { data: reports, isLoading: loadingReports } = useListModerationReports(
    { status: statusFilter },
    { query: { queryKey: getListModerationReportsQueryKey({ status: statusFilter }) } }
  );

  const selectedReport = useMemo(() => {
    if (!reports || !selectedReportId) return null;
    return reports.find(r => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 border-b px-6">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tight">UniLink Safety</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3 mt-4">Queues</div>
          <SidebarItem 
            active={statusFilter === 'pending'} 
            onClick={() => { setStatusFilter('pending'); setSelectedReportId(null); }}
            icon={<Inbox className="w-4 h-4" />}
            label="Pending Review"
            count={summary?.pendingReports}
          />
          <SidebarItem 
            active={statusFilter === 'reviewed'} 
            onClick={() => { setStatusFilter('reviewed'); setSelectedReportId(null); }}
            icon={<CheckCircle className="w-4 h-4" />}
            label="Reviewed"
          />
          <SidebarItem 
            active={statusFilter === 'actioned'} 
            onClick={() => { setStatusFilter('actioned'); setSelectedReportId(null); }}
            icon={<AlertCircle className="w-4 h-4" />}
            label="Actioned"
          />
        </nav>

        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.email}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="h-16 border-b bg-card flex items-center px-8 justify-between shrink-0">
          <h1 className="text-xl font-semibold capitalize">{statusFilter} Reports</h1>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <MetricCard title="Pending Queue" value={summary?.pendingReports} loading={loadingSummary} />
              <MetricCard title="Reports Today" value={summary?.reportsToday} loading={loadingSummary} />
              <MetricCard title="Actioned Total" value={summary?.actionedReports} loading={loadingSummary} />
              <MetricCard title="Removed Users" value={summary?.removedUsers} loading={loadingSummary} />
            </div>

            {/* Reports List */}
            <div className="bg-card border rounded-lg shadow-sm">
              {loadingReports ? (
                <div className="p-8 space-y-4">
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="divide-y border-t-0">
                  {reports.map(report => (
                    <div 
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`p-4 flex items-center gap-5 cursor-pointer transition-all hover:bg-accent/50 ${selectedReportId === report.id ? 'bg-accent/50 relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary' : ''}`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={report.reported.profilePicture || undefined} />
                        <AvatarFallback>{report.reported.firstName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{report.reported.firstName}</span>
                          <span className="text-muted-foreground text-sm truncate">{report.reported.email}</span>
                          {report.reported.moderationStatus === 'removed' && (
                            <Badge variant="destructive" className="ml-2 text-[10px] uppercase">Removed</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="capitalize shrink-0">{report.category}</Badge>
                          <span className="truncate">{report.details}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground shrink-0 w-32">
                        <span className="text-xs">{format(new Date(report.createdAt), 'MMM d, h:mm a')}</span>
                        <StatusBadge status={report.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No {statusFilter} reports</h3>
                  <p className="text-muted-foreground mt-1">You're all caught up in this queue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Panel */}
      {selectedReport && (
        <ReportDetail 
          report={selectedReport} 
          onClose={() => setSelectedReportId(null)} 
        />
      )}
    </div>
  );
}

function MetricCard({ title, value, loading }: { title: string, value?: number, loading: boolean }) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{value ?? 0}</div>}
      </CardContent>
    </Card>
  );
}

function SidebarItem({ active, onClick, icon, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all text-sm font-medium
        ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    reviewed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    actioned: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dismissed: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
  };
  return <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${colors[status] || colors.pending}`}>{status}</span>;
}