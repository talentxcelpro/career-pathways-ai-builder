
import { ErrorBoundary } from 'react-error-boundary';
import { FinalLaunchRunner } from '@/components/deployment/FinalLaunchRunner';
import { LaunchStatusSummary } from '@/components/admin/LaunchStatusSummary';
import { useAuth } from '@/contexts/AuthContext';
import TalentXcelCore from './TalentXcelCore';

const Index = () => {
  const { loading } = useAuth();
  
  const showFinalLaunch = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('final_launch') === '1';
  const showLaunchStatus = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('launch_status') === '1';

  if (loading) {
    return null;
  }

  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <div className="min-h-screen flex items-center justify-center bg-background mobile-optimized">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
    >
      {showFinalLaunch ? <FinalLaunchRunner /> : showLaunchStatus ? <LaunchStatusSummary /> : <TalentXcelCore />}
    </ErrorBoundary>
  );
};

export default Index;
