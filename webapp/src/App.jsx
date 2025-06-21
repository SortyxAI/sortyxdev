import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WasteProvider } from './context/WasteContext';
import { PointsProvider } from './context/PointsContext';
import Header from './components/Header';
import BackgroundVideo from './components/BackgroundVideo';
import DetectionContainer from './components/DetectionContainer';
import Footer from './components/Footer';
import ClassificationResult from './components/ClassificationResult';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const handleInfoClick = () => {
    // Handle info panel opening logic here
    console.log('Info button clicked');
  };

  const toggleDashboard = () => {
    setShowDashboard(prev => !prev);
  };

  const toggleAuthModal = () => {
    setShowAuthModal(prev => !prev);
  };

  const toggleProfileModal = () => {
    setShowProfileModal(prev => !prev);
  };

  return (
    <AuthProvider>
      <PointsProvider>
        <WasteProvider>
          <div className="min-h-screen bg-gray-100 relative overflow-hidden">
            <BackgroundVideo />
            <Header 
              onInfoClick={handleInfoClick} 
              onDashboardClick={toggleDashboard}
              onAuthClick={toggleAuthModal}
              onProfileClick={toggleProfileModal}
            />
            
            <main className="container mx-auto px-4 py-20 relative z-10">
              <DetectionContainer />
              <ClassificationResult />
            </main>
            
            <Footer />
            
            {/* Dashboard Component */}
            {showDashboard && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <Dashboard onClose={toggleDashboard} />
              </div>
            )}

            {/* Authentication Modal */}
            {showAuthModal && (
              <AuthModal onClose={toggleAuthModal} />
            )}

            {/* User Profile Modal */}
            {showProfileModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <UserProfile onClose={toggleProfileModal} />
              </div>
            )}
          </div>
        </WasteProvider>
      </PointsProvider>
    </AuthProvider>
  );
}

export default App;