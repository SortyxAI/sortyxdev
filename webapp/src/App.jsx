import React, { useState } from 'react';
import { WasteProvider } from './context/WasteContext';
import { PointsProvider } from './context/PointsContext';
import Header from './components/Header';
import BackgroundVideo from './components/BackgroundVideo';
import DetectionContainer from './components/DetectionContainer';
import Footer from './components/Footer';
import ClassificationResult from './components/ClassificationResult';
import Dashboard from './components/Dashboard';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  
  const handleInfoClick = () => {
    // Handle info panel opening logic here
    console.log('Info button clicked');
  };

  const toggleDashboard = () => {
    setShowDashboard(prev => !prev);
  };

  return (
    <PointsProvider>
      <WasteProvider>
        <div className="min-h-screen bg-gray-100 relative overflow-hidden">
          <BackgroundVideo />
          <Header onInfoClick={handleInfoClick} onDashboardClick={toggleDashboard} />
          
          <main className="container mx-auto px-4 py-20 relative z-10">
            <DetectionContainer />
            <ClassificationResult />
          </main>
          
          <Footer />
          
          {/* Dashboard Component - Make sure it's properly rendered */}
          {showDashboard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <Dashboard onClose={toggleDashboard} />
            </div>
          )}
        </div>
      </WasteProvider>
    </PointsProvider>
  );
}

export default App;