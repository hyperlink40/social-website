import { Prediction } from '../../data/mockData';
import { Card, Badge, Button } from '../ui';
import { format } from 'date-fns';
import { Lock, LockOpen, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PredictionCard({ prediction, onUpgrade }: { prediction: Prediction; onUpgrade: () => void }) {
  const { user } = useAuth();
  const isLocked = prediction.isPremium && user?.plan !== 'premium';

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-5 flex flex-col h-full">
        {/* Header: League & Date */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {prediction.league}
            </span>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {format(new Date(prediction.date), 'MMM d, HH:mm')}
            </div>
          </div>
          {prediction.isPremium ? (
            <Badge variant="premium" className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="success" className="flex items-center gap-1">
              <LockOpen className="w-3 h-3" /> Free
            </Badge>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center flex-1">
            <img src={prediction.homeLogo} alt={prediction.homeTeam} className="w-12 h-12 object-contain mb-2" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48?text=' + prediction.homeTeam[0]; }} />
            <span className="text-sm font-semibold text-center leading-tight">{prediction.homeTeam}</span>
          </div>
          <div className="px-4 text-slate-400 font-medium text-sm">VS</div>
          <div className="flex flex-col items-center flex-1">
            <img src={prediction.awayLogo} alt={prediction.awayTeam} className="w-12 h-12 object-contain mb-2" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48?text=' + prediction.awayTeam[0]; }} />
            <span className="text-sm font-semibold text-center leading-tight">{prediction.awayTeam}</span>
          </div>
        </div>

        {/* Prediction Data */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          {isLocked ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center border border-dashed border-slate-200 dark:border-slate-700">
              <Lock className="w-6 h-6 mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Unlock this high-confidence prediction
              </p>
              <Button variant="premium" size="sm" onClick={onUpgrade} className="w-full">
                Upgrade to Premium
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pick:</span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{prediction.prediction}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Odds</span>
                  <span className="text-sm font-semibold">{prediction.odds}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500">Confidence</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{prediction.confidence}%</span>
                  </div>
                </div>
              </div>
              {prediction.rationale && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p>{prediction.rationale}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
