import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { PredictionsList } from './pages/PredictionsList';
import { PremiumUpgrade } from './pages/PremiumUpgrade';
import { SlideResults } from './pages/SlideResults';
import { UserProfile } from './pages/UserProfile';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SubscriptionManagement } from './pages/SubscriptionManagement';
import { WebhookSimulator } from './pages/WebhookSimulator';
import { Sitemap } from './pages/Sitemap';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome setActiveTab={setActiveTab} />;
      case 'predictions':
        return <PredictionsList setActiveTab={setActiveTab} />;
      case 'premium':
        return <PremiumUpgrade setActiveTab={setActiveTab} />;
      case 'results':
        return <SlideResults setActiveTab={setActiveTab} />;
      case 'profile':
        return <UserProfile setActiveTab={setActiveTab} />;
      case 'about':
        return <AboutPage setActiveTab={setActiveTab} />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'subscription':
        return <SubscriptionManagement setActiveTab={setActiveTab} />;
      case 'webhook':
        return <WebhookSimulator />;
      case 'sitemap':
        return <Sitemap setActiveTab={setActiveTab} />;
      default:
        return <DashboardHome setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
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
