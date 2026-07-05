import { Prediction } from '../../data-football/mockData';
import { Card, Badge, Button } from '../ui';
import { format } from 'date-fns';
import { Lock, Unlock, Info, TrendingUp, Clock, Zap, Eye } from 'lucide-react';
import { useAuth } from '../../context-football/AuthContext';
import { useState } from 'react';

export function PredictionCard({ prediction, onUpgrade }: { prediction: Prediction; onUpgrade: () => void }) {
  const { user } = useAuth();
  const isLocked = prediction.isPremium && user?.plan !== 'premium';
  const [showRationale, setShowRationale] = useState(false);

  const confidenceColor = prediction.confidence >= 85
    ? 'text-emerald-500'
    : prediction.confidence >= 70
    ? 'text-blue-500'
    : 'text-amber-500';

  const confidenceBg = prediction.confidence >= 85
    ? 'from-emerald-500 to-green-600'
    : prediction.confidence >= 70
    ? 'from-blue-500 to-indigo-600'
    : 'from-amber-500 to-orange-600';

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
      {/* Confidence bar at top */}
      <div className="h-1 bg-gradient-to-r bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full bg-gradient-to-r ${confidenceBg} transition-all duration-500`}
          style={{ width: `${prediction.confidence}%` }}
        />
      </div>

      {/* Live badge */}
      {prediction.source === 'live-api' && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="premium" className="flex items-center gap-1 shadow-lg animate-pulse">
            <Zap className="w-3 h-3" /> LIVE
          </Badge>
        </div>
      )}

      <div className="p-5 flex flex-col h-full">
        {/* Header: League & Date */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {prediction.league}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              <Clock className="w-3 h-3" />
              {format(new Date(prediction.date), 'MMM d, HH:mm')}
            </div>
          </div>
          {prediction.isPremium ? (
            <Badge variant="premium" className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="success" className="flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Free
            </Badge>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center flex-1 group-hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-2 shadow-sm overflow-hidden">
              <img
                src={prediction.homeLogo}
                alt={prediction.homeTeam}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-black text-slate-500">${prediction.homeTeam[0]}</span>`;
                }}
              />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">{prediction.homeTeam}</span>
          </div>

          <div className="px-4 flex flex-col items-center">
            <span className="text-slate-400 font-bold text-lg">VS</span>
            <span className="text-xs text-slate-400 mt-1">{prediction.odds}</span>
          </div>

          <div className="flex flex-col items-center flex-1 group-hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-2 shadow-sm overflow-hidden">
              <img
                src={prediction.awayLogo}
                alt={prediction.awayTeam}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-black text-slate-500">${prediction.awayTeam[0]}</span>`;
                }}
              />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">{prediction.awayTeam}</span>
          </div>
        </div>

        {/* Prediction Data */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          {isLocked ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 text-center border border-dashed border-amber-200 dark:border-amber-800">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Premium Prediction
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {prediction.confidence}% confidence pick
              </p>
              <Button variant="premium" size="sm" onClick={onUpgrade} className="w-full">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Unlock This Pick
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Main Pick */}
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-900">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Prediction</span>
                <span className="text-base font-bold text-blue-700 dark:text-blue-400">{prediction.prediction}</span>
              </div>

              {/* Stats Row */}
              <div className="flex justify-between items-center px-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="w-3 h-3" />
                    Odds
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{prediction.odds}</span>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Zap className="w-3 h-3" />
                    Confidence
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-lg font-bold ${confidenceColor}`}>{prediction.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              {prediction.rationale && (
                <div className="relative">
                  <button
                    onClick={() => setShowRationale(!showRationale)}
                    className="w-full flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Info className="w-3.5 h-3.5" />
                      <span>Analysis {showRationale ? '(click to hide)' : '(click to view)'}</span>
                    </div>
                    <Eye className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showRationale ? 'rotate-180' : ''}`} />
                  </button>

                  {showRationale && (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border-l-2 border-blue-500 animate-in slide-in-from-top-2 duration-200">
                      {prediction.rationale}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
