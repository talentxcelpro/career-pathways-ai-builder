
import Posts from './network/Posts';
import { NetworkDiagnostic } from '@/components/NetworkDiagnostic';

const Network = () => {
  return (
    <div className="space-y-6">
      <NetworkDiagnostic />
      <Posts />
    </div>
  );
};

export default Network;
