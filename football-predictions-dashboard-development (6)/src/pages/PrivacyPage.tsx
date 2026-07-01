import { Shield, Lock, Eye, FileText, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent } from '../components/ui';

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your name, email address, and password. Premium subscribers provide payment details, which are processed securely through our payment provider and never stored on our servers.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with our platform, including pages viewed, predictions accessed, click patterns, and session duration. This helps us improve our service.',
      },
      {
        subtitle: 'Device Information',
        text: 'We may collect device identifiers, browser type, IP address, and operating system to provide a personalized and secure experience.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'How We Use Your Data',
    content: [
      {
        subtitle: 'Service Delivery',
        text: 'Your data is primarily used to deliver predictions, manage your subscription, and personalise your dashboard experience.',
      },
      {
        subtitle: 'Communications',
        text: 'We use your email address to send prediction alerts, account updates, and (with your consent) marketing communications. You can unsubscribe at any time.',
      },
      {
        subtitle: 'Analytics & Improvement',
        text: 'Aggregated, anonymised usage data is used to improve our AI models, user interface, and prediction accuracy. Individual user behaviour is never sold.',
      },
    ],
  },
  {
    icon: Users,
    title: 'Data Sharing',
    content: [
      {
        subtitle: 'Third-Party Service Providers',
        text: 'We share limited data with trusted partners who help us operate our platform: payment processors (Stripe), email providers, and analytics tools. These partners are contractually bound to protect your data.',
      },
      {
        subtitle: 'We Never Sell Your Data',
        text: 'FootyPredict AI does not sell, rent, or trade personal information to third parties for marketing purposes. Period.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose data when required by law or to protect the safety and rights of our users, our platform, or the public.',
      },
    ],
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: [
      {
        subtitle: 'Encryption',
        text: 'All data transmitted to and from our platform is encrypted using TLS 1.3. Sensitive data at rest is encrypted using AES-256.',
      },
      {
        subtitle: 'Access Controls',
        text: 'Access to user data is restricted to authorised personnel only, following the principle of least privilege.',
      },
      {
        subtitle: 'Breach Notification',
        text: 'In the unlikely event of a data breach, we will notify affected users within 72 hours in compliance with GDPR requirements.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Your Rights',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You have the right to request a copy of all personal data we hold about you, in a machine-readable format.',
      },
      {
        subtitle: 'Correction & Deletion',
        text: 'You can update your personal information at any time in your profile settings. You may also request deletion of your account and all associated data.',
      },
      {
        subtitle: 'Opt-Out',
        text: 'You may opt out of marketing emails at any time, and of analytics tracking by contacting us at privacy@footypredict.ai.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Cookies & Tracking',
    content: [
      {
        subtitle: 'Essential Cookies',
        text: 'We use strictly necessary cookies to keep you logged in and maintain your session preferences.',
      },
      {
        subtitle: 'Analytics Cookies',
        text: 'With your consent, we use analytics cookies (Google Analytics) to understand how users interact with our platform.',
      },
      {
        subtitle: 'Managing Cookies',
        text: 'You can control cookies via your browser settings. Disabling certain cookies may affect platform functionality.',
      },
    ],
  },
];

export function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
          <Shield className="w-4 h-4" /> Privacy Policy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Your Privacy Matters
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          At FootyPredict AI, we take data privacy seriously. This policy explains what we collect,
          how we use it, and your rights as a user.
        </p>
        <p className="text-xs text-slate-400">
          Last updated: January 15, 2025 · Effective: February 1, 2025
        </p>
      </div>

      {/* Intro card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Our Privacy Commitment</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                We believe in transparency. We collect only what we need, keep it secure, and give you
                full control over your data. This policy applies to all users of FootyPredict AI and
                complies with GDPR, UK PECR, and applicable data protection laws.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {idx + 1}. {section.title}
                </h2>
              </div>
              <div className="space-y-4 pl-1">
                {section.content.map((item, i) => (
                  <div key={i} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{item.subtitle}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact */}
      <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Questions About Privacy?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@footypredict.ai" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              privacy@footypredict.ai
            </a>
            {' '}or write to us at FootyPredict AI Ltd., 120 Finsbury Pavement, London, EC2A 1RS, UK.
          </p>
          <p className="text-xs text-slate-400">
            You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
