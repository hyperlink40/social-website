import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui';
import { Mail, MessageSquare, Phone, MapPin, CheckCircle2, Send, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How accurate are your predictions?',
    a: 'Our free predictions have a 65% win rate, while our premium picks average 85% accuracy. All results are publicly logged and verified.',
  },
  {
    q: 'Can I cancel my premium subscription anytime?',
    a: 'Yes! You can cancel your premium subscription at any time with no questions asked. You\'ll retain access until the end of your billing period.',
  },
  {
    q: 'What leagues do you cover?',
    a: 'We cover 42+ leagues including Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, and many more.',
  },
  {
    q: 'How do I receive prediction alerts?',
    a: 'Free users get email alerts. Premium users receive email, push notifications, and optional SMS alerts for urgent picks.',
  },
  {
    q: 'Is this for gambling purposes?',
    a: 'Our predictions are for entertainment and informational purposes. Please gamble responsibly and within your means. We always recommend using a staking plan.',
  },
];

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
          <MessageSquare className="w-4 h-4" /> Contact Us
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          We'd Love to Hear From You
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Have a question, suggestion, or need support? Our team typically responds within 24 hours.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, title: 'Email Us', desc: 'support@footypredict.ai', sub: 'We respond within 24h', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Phone, title: 'Call Us', desc: '+44 20 7946 0321', sub: 'Mon–Fri, 9am–6pm GMT', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: MapPin, title: 'Find Us', desc: 'London, United Kingdom', sub: '120 Finsbury Pavement, EC2A', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(c => (
          <Card key={c.title}>
            <CardContent className="p-5 text-center">
              <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <c.icon className={`w-6 h-6 ${c.color}`} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{c.title}</h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.desc}</p>
              <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" /> Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-500">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
                      <input
                        type="text" required value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                      <input
                        type="email" required value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject *</label>
                    <select
                      required value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select a topic...</option>
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Billing & Subscription</option>
                      <option>Partnership Inquiry</option>
                      <option>Report an Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea
                      required rows={5} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <Send className="w-4 h-4 mr-2" /> Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Socials & Support Hours */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Follow Us</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { emoji: '𝕏', label: 'Twitter / X', handle: '@FootyPredictAI', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
                { emoji: '📸', label: 'Instagram', handle: '@footypredict', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
                { emoji: '▶️', label: 'YouTube', handle: 'FootyPredict AI', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center text-lg`}>
                    {s.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.handle}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Support Hours</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2 text-sm">
              {[
                { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM GMT', active: true },
                { day: 'Saturday', time: '10:00 AM – 4:00 PM GMT', active: true },
                { day: 'Sunday', time: 'Closed', active: false },
              ].map(h => (
                <div key={h.day} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-700 dark:text-slate-300">{h.day}</span>
                  <span className={`font-medium ${h.active ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>{h.time}</span>
                </div>
              ))}
              <div className="pt-2">
                <Badge variant="success" className="text-xs">Premium users get priority support</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
