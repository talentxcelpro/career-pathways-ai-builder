import React from "react";

const MinimalApp = () => {
  console.log('🎯 MINIMAL APP: Rendering');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Minimal App Test</h1>
      <p>If you can see this, React is working.</p>
    </div>
  );
};

export default MinimalApp;