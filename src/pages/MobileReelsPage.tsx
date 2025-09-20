import React from 'react';

const MobileReelsPage = React.lazy(() => 
  import('@/pages/mobile/MobileReels').then(module => ({
    default: module.MobileReels
  }))
);

export default MobileReelsPage;