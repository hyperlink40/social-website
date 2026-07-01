import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_PREDICTIONS, MOCK_RESULTS, STATS, type Prediction } from '../data/mockData';
import { PredictionCard } from '../components/predictions/PredictionCard';
import { Card, CardContent, Button, Badge } from '../components/ui';
import { getPredictions, normalizeApiPrediction } from '../services/footballApi';
import {
  TrendingUp, Activity, CheckCircle, History, User,
  Target, Crown, Info, Mail, Shield, ArrowRight, Wifi, RefreshCw
} from 'lucide-react';

export function DashboardHome({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const [livePicks, setLivePicks] = useState<Prediction[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (user?.plan === 'premium') {
      setLiveLoading(true);
      getPredictions({ market: 'classic' }).then(res => {
        if (res.data && res.data.length > 0) {
          setLivePicks(res.data.slice(0, 3).map((p, i) => normalizeApiPrediction(p, i)));
        }
        setLiveLoading(false);
      });
    }
  }, [user?.plan]);

  const todayPredictions: Prediction[] = user?.plan === 'premium' && livePicks.length > 0
    ? livePicks
    : MOCK_PREDICTIONS.slice(0, 3);
  const winRate = user?.plan === 'premium' ? `${STATS.premiumWinRate}%` : `${STATS.freeWinRate}%`;
  const profit = user?.plan === 'premium' ? '+45.2 U' : '+12.5 U';

  const recentResultsData = MOCK_RESULTS.slice(0, 4);

  const recentWins = recentResultsData.filter(r => r.outcome === 'win').length;
  const recentLosses = recentResultsData.filter(r => r.outcome === 'loss').length;

  const quickLinks = [
    { id: 'predictions', label: 'All Predictions', desc: `${MOCK_PREDICTIONS.length} active picks`, icon: Target, color: 'from-blue-500 to-blue-700' },
    { id: 'results', label: 'Results & Slides', desc: `${recentWins}W / ${recentLosses}L this month`, icon: History, color: 'from-emerald-500 to-green-700' },
    { id: 'premium', label: 'Premium Access', desc: `${STATS.premiumWinRate}% win rate`, icon: Crown, color: 'from-amber-500 to-orange-600' },
    { id: 'profile', label: 'My Profile', desc: 'Settings & notifications', icon: User, color: 'from-purple-500 to-violet-700' },
    { id: 'about', label: 'About Us', desc: 'Our team & methodology', icon: Info, color: 'from-slate-500 to-slate-700' },
    { id: 'contact', label: 'Contact & FAQ', desc: 'Get help from our team', icon: Mail, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {user?.plan === 'premium' && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-semibold">
            <Crown className="w-4 h-4" /> Premium Member
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Win Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{winRate}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Profit</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{profit}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Predictions</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{MOCK_PREDICTIONS.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Picks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.plan === 'premium' && livePicks.length > 0 ? '⚡ Live API Picks' : '🔥 Today\'s Top Picks'}
            </h2>
            {user?.plan === 'premium' && (
              liveLoading ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Loading
                </Badge>
              ) : livePicks.length > 0 ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Live
                </Badge>
              ) : null
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('predictions')} className="flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todayPredictions.map(pred => (
            <PredictionCard
              key={pred.id}
              prediction={pred}
              onUpgrade={() => setActiveTab('premium')}
            />
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{link.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-tight">{link.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Results Summary */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" /> Recent Results
            </h3>
            <div className="space-y-2">
              {MOCK_RESULTS.slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.homeTeam} vs {r.awayTeam}</p>
                    <p className="text-xs text-slate-400">{r.prediction}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{r.homeScore}–{r.awayScore}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.outcome === 'win' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {r.outcome.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-blue-600 dark:text-blue-400" onClick={() => setActiveTab('results')}>
              View All Results <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Platform Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Predictions Published', value: `${(STATS.totalPredictions / 1000).toFixed(1)}K` },
                { label: 'Leagues Covered', value: `${STATS.leaguesCovered}+` },
                { label: 'Active Members', value: `${(STATS.activeUsers / 1000).toFixed(0)}K+` },
                { label: 'Avg Monthly ROI (Premium)', value: `+${STATS.monthlyROI}%` },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-blue-600 dark:text-blue-400" onClick={() => setActiveTab('about')}>
              Learn More <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Teaser for Free Users */}
      {user?.plan !== 'premium' && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20" />
          <CardContent className="p-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Crown className="w-3 h-3" /> Premium Access
              </div>
              <h3 className="text-xl font-bold mb-2">Unlock Pro Predictions</h3>
              <p className="text-slate-300 max-w-md text-sm leading-relaxed">
                Get access to our highest confidence picks, detailed match analysis, and exclusive leagues. Premium members see an average ROI of +{STATS.monthlyROI}%.
              </p>
            </div>
            <Button variant="premium" size="lg" className="shrink-0" onClick={() => setActiveTab('premium')}>
              Upgrade Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
