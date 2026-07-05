import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '../context-football/AuthContext';
import { DashboardLayout } from '../components-football/layout/DashboardLayout';
import { DashboardHome } from '../pages-football/DashboardHome';
import { PredictionsList } from '../pages-football/PredictionsList';
import { PremiumUpgrade } from '../pages-football/PremiumUpgrade';
import { SlideResults } from '../pages-football/SlideResults';
import { UserProfile } from '../pages-football/UserProfile';
import { AboutPage } from '../pages-football/AboutPage';
import { ContactPage } from '../pages-football/ContactPage';
import { PrivacyPage } from '../pages-football/PrivacyPage';
import { SubscriptionManagement } from '../pages-football/SubscriptionManagement';
import { WebhookSimulator } from '../pages-football/WebhookSimulator';
import { Sitemap } from '../pages-football/Sitemap';

interface FootballDashboardProps {
  onBack: () => void;
}

function FootballDashboardContent({ onBack }: FootballDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, login } = useAuth();

  useEffect(() => {
    if (!user) {
      login('user@example.com', 'free');
    }
  }, [user, login]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-slate-700 px-6 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Back to Social
        </button>
      </div>
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </DashboardLayout>
    </div>
  );
}

export default function FootballDashboard(props: FootballDashboardProps) {
  return (
    <AuthProvider>
      <FootballDashboardContent {...props} />
    </AuthProvider>
  );
}
