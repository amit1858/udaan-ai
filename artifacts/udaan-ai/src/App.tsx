import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { useGetUdaanState, getGetUdaanStateQueryKey } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { I18nProvider } from '@/lib/i18n';
import { AppShell } from '@/components/app-shell';
import { Onboarding } from '@/components/onboarding';
import { ErrorState } from '@/components/states';
import { UdaanMark } from '@/components/udaan-mark';
import NotFound from '@/pages/not-found';
import HomePage from '@/pages/home';
import DiscoverPage from '@/pages/discover';
import AskPage from '@/pages/ask';
import PlansPage from '@/pages/plans';
import PlanDetailPage from '@/pages/plan-detail';
import OpportunityPage from '@/pages/opportunity';
import ShopPage from '@/pages/shop';
import SettingsPage from '@/pages/settings';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 15_000 } } });

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/discover" component={DiscoverPage} />
        <Route path="/ask" component={AskPage} />
        <Route path="/plans" component={PlansPage} />
        <Route path="/plans/:id" component={PlanDetailPage} />
        <Route path="/opportunity/:id" component={OpportunityPage} />
        <Route path="/shop" component={ShopPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Gate() {
  const st = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  if (st.isLoading) return <div className="grid min-h-[100dvh] place-items-center"><UdaanMark className="size-12 animate-pulse" /></div>;
  if (st.isError || !st.data) return <div className="mx-auto max-w-md p-6 pt-24"><ErrorState onRetry={() => st.refetch()} /></div>;
  if (!st.data.preferences.onboarded) return <Onboarding />;
  return <AppShell><Router /></AppShell>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <I18nProvider><Gate /></I18nProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
