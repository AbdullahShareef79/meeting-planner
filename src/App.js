import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import MeetingPlanner from './MeetingPlanner';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <MeetingPlanner />
      </div>
    </ErrorBoundary>
  );
}

export default App;
