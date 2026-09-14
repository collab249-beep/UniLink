import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from 'sonner';
import NotFound from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import { AuthProvider, useAuth } from '@/lib/auth';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
setBaseUrl('/api');
setAuthTokenGetter(() => localStorage.getItem('token'));

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { adminToken, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-medium text-muted-foreground flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          Loading workspace...
        </div>
      </div>
    );
  }
  
  if (!adminToken) {
    return <Login />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;