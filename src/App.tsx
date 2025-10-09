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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
          <p className="text-white font-semibold text-lg drop-shadow-lg">Loading...</p>
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
        <div className="min-h-screen">
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
