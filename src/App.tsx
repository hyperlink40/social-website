import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Feed from './components/Feed';
import Profile from './components/Profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'feed' | 'profile'>('feed');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setView('profile');
  };

  const handleBackToFeed = () => {
    setView('feed');
    setSelectedUserId('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      {view === 'feed' && <Feed onUserClick={handleUserClick} />}
      {view === 'profile' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <Profile
              userId={selectedUserId}
              onBack={handleBackToFeed}
              onUserClick={handleUserClick}
            />
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
