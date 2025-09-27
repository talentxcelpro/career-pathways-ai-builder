import React from "react";

const App = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">TalentXcel Test</h1>
      <p className="mt-4 text-gray-600">
        This is a minimal React component to test if React hooks are working.
      </p>
      <div className="mt-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => alert('React is working!')}
        >
          Test Click
        </button>
      </div>
    </div>
  );
};

export default App;