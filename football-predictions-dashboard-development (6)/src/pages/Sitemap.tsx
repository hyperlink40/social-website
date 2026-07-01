import {
  LayoutDashboard, Crown, User, Trophy,
  Info, ExternalLink
} from 'lucide-react';

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: Array<{
    label: string;
    path: string;
    description?: string;
    external?: boolean;
  }>;
}

const sitemapData: SitemapSection[] = [
  {
    title: "Main Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    links: [
      { label: "Home Dashboard", path: "dashboard", description: "Overview of today's predictions and performance" },
      { label: "All Predictions", path: "predictions", description: "Browse AI-generated football tips" },
      { label: "Results & Slides", path: "results", description: "Historical results and premium slide deck" },
    ]
  },
  {
    title: "Premium & Payments",
    icon: <Crown className="w-5 h-5" />,
    links: [
      { label: "Premium Access", path: "premium", description: "Upgrade to unlock unlimited predictions" },
      { label: "Subscription Management", path: "subscription", description: "Manage billing, cancel or renew plan" },
      { label: "Webhook Simulator", path: "webhook", description: "Test Paystack webhook integration" },
    ]
  },
  {
    title: "Account",
    icon: <User className="w-5 h-5" />,
    links: [
      { label: "My Profile", path: "profile", description: "Edit personal information and preferences" },
    ]
  },
  {
    title: "Company & Legal",
    icon: <Info className="w-5 h-5" />,
    links: [
      { label: "About Us", path: "about", description: "Our mission and the AI behind FootyPredict" },
      { label: "Contact", path: "contact", description: "Get in touch with our team" },
      { label: "Privacy Policy", path: "privacy", description: "How we handle your data" },
      { 
        label: "Paystack Documentation", 
        path: "https://paystack.com/docs", 
        description: "Official Paystack integration guide",
        external: true 
      },
    ]
  },
];

export function Sitemap({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const handleNavigate = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
    } else {
      setActiveTab(path);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Site Map</h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Quick navigation to every page and feature on FootyPredict.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {sitemapData.map((section, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-blue-600 dark:text-blue-400">
                {section.icon}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
            </div>

            <ul className="space-y-4">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <button
                    onClick={() => handleNavigate(link.path, link.external)}
                    className="group w-full text-left flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-3 rounded-2xl transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {link.label}
                        </span>
                        {link.external && (
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      {link.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 pr-4">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all mt-1">
                      →
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-slate-500">
        Can't find what you're looking for?{' '}
        <button 
          onClick={() => setActiveTab('contact')} 
          className="text-blue-600 hover:underline font-medium"
        >
          Contact our support team
        </button>
      </div>
    </div>
  );
}
