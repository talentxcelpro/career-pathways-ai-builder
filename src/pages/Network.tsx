
import Posts from './network/Posts';

const Network = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
      <div className="space-y-6">
        <Posts />
      </div>
    </div>
  );
};

export default Network;
