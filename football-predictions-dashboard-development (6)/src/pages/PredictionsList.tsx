import { useEffect, useMemo, useState } from 'react';
import { MOCK_PREDICTIONS } from '../data/mockData';
import { PredictionCard } from '../components/predictions/PredictionCard';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { getPredictions, getFederations, getMarkets, normalizeApiPrediction } from '../services/footballApi';
import { RefreshCw, WifiOff, Wifi, Calendar, Globe2, Filter, Target, Code, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type PredictionT = typeof MOCK_PREDICTIONS[number] & { source?: 'mock' | 'live-api'; federation?: string; market?: string; status?: string };

export function PredictionsList({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'live'>('all');
  const [selectedFederation, setSelectedFederation] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('classic');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [livePredictions, setLivePredictions] = useState<PredictionT[]>([]);
  const [federations, setFederations] = useState<{ key: string; name: string }[]>([]);
  const [markets, setMarkets] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  // API Response inspector
  const [showApiResponse, setShowApiResponse] = useState(false);
  const [lastRawResponse, setLastRawResponse] = useState<any>(null);
  const [lastApiMeta, setLastApiMeta] = useState<{endpoint: string, status?: number, proxy?: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLive = async () => {
    if (user?.plan !== 'premium') return;
    setLoading(true);
    setApiFailed(false);
    setApiError(null);
    try {
      const [predsRes, fedsRes, mrktsRes] = await Promise.all([
        getPredictions({ market: selectedMarket, iso_date: selectedDate, federation: selectedFederation || undefined }),
        getFederations(),
        getMarkets(),
      ]);

      if (predsRes.data && predsRes.data.length > 0) {
        const normalized = predsRes.data.map((p, i) => normalizeApiPrediction(p, i));
        setLivePredictions(normalized);
        setLiveCount(normalized.length);
      } else {
        setApiFailed(true);
        if (predsRes.error) setApiError(predsRes.error);
        setLivePredictions([]);
        setLiveCount(0);
      }

      if ((predsRes as any).rawResponse) {
        setLastRawResponse((predsRes as any).rawResponse);
        setLastApiMeta({
          endpoint: `predictions?market=${selectedMarket}&iso_date=${selectedDate}${selectedFederation ? `&federation=${selectedFederation}` : ''}`,
          proxy: 'cors-proxy'
        });
      }

      if (fedsRes.data) {
        setFederations(
          fedsRes.data
            .map(f => ({
              key: f.federation || f.key || f.name || '',
              name: f.name || f.federation || f.key || '',
            }))
            .filter(f => f.key)
        );
      }
      if (mrktsRes.data) {
        setMarkets(
          mrktsRes.data
            .map(m => ({
              key: m.market || m.key || m.name || '',
              name: m.name || m.market || m.key || '',
            }))
            .filter(m => m.key)
        );
      }
    } catch (e: any) {
      setApiFailed(true);
      setApiError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.plan]);

  const mockPredictions: PredictionT[] = useMemo(
    () => MOCK_PREDICTIONS.map(p => ({ ...p, source: 'mock' as const })),
    []
  );

  const allPredictions = useMemo<PredictionT[]>(() => {
    let combined: PredictionT[] = [];

    if (filter === 'live') {
      combined = livePredictions;
    } else if (filter === 'premium') {
      combined = [
        ...livePredictions,
        ...mockPredictions.filter(p => p.isPremium),
      ];
    } else if (filter === 'free') {
      combined = mockPredictions.filter(p => !p.isPremium);
    } else {
      combined = [
        ...livePredictions,
        ...mockPredictions,
      ];
    }

    return combined;
  }, [filter, livePredictions, mockPredictions]);

  const canSeeLive = user?.plan === 'premium';

  const copyResponse = () => {
    if (!lastRawResponse) return;
    navigator.clipboard.writeText(JSON.stringify(lastRawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Predictions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {canSeeLive
              ? `Browse our latest picks. ${liveCount} live API predictions loaded.`
              : 'Browse free picks. Upgrade to Premium for live API-powered predictions.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLive}
            disabled={loading || !canSeeLive}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          {lastRawResponse && canSeeLive && (
            <Button
              variant={showApiResponse ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowApiResponse(s => !s)}
              className="flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              {showApiResponse ? 'Hide JSON' : 'Show API JSON'}
            </Button>
          )}
        </div>
      </div>

      {/* Raw API Response Inspector */}
      {showApiResponse && lastRawResponse && (
        <Card className="border-blue-300 dark:border-blue-700 bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  Live Raw JSON – football-prediction-api.p.rapidapi.com
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  GET /api/v2/predictions?market={selectedMarket}&iso_date={selectedDate}
                  {selectedFederation && `&federation=${selectedFederation}`}
                </p>
                <div className="flex gap-2 mt-1.5">
                  <Badge variant="success" className="text-[11px]">Live API</Badge>
                  <span className="text-[11px] text-slate-500">{lastApiMeta?.proxy || 'cors-proxy'}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={copyResponse} className="h-8 text-xs">
                {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON</>}
              </Button>
            </div>
            <div className="bg-slate-950 rounded-lg p-4 max-h-[420px] overflow-auto font-mono text-[11px] leading-relaxed text-emerald-400 shadow-inner">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lastRawResponse, null, 2)}</pre>
            </div>
            <p className="text-[11px] text-slate-500">
              Full unparsed RapidAPI response • {Array.isArray(lastRawResponse) ? lastRawResponse.length : Array.isArray(lastRawResponse?.data) ? lastRawResponse.data.length : 'object'} records
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        {[
          { id: 'all', label: 'All Picks', count: allPredictions.length },
          { id: 'free', label: 'Free', count: mockPredictions.filter(p => !p.isPremium).length },
          { id: 'premium', label: 'Premium', count: mockPredictions.filter(p => p.isPremium).length + liveCount },
          { id: 'live', label: 'Live API', count: liveCount, premiumOnly: true },
        ].map(f => {
          const isLocked = (f as any).premiumOnly && !canSeeLive;
          return (
            <button
              key={f.id}
              onClick={() => !isLocked && setFilter(f.id as any)}
              disabled={isLocked}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-1.5 ${
                filter === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLocked
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
              {!isLocked && <span className={filter === f.id ? 'text-white/80' : 'text-slate-400'}>({f.count})</span>}
              {isLocked && <span className="ml-1 text-amber-500">🔒</span>}
            </button>
          );
        })}
      </div>

      {/* Advanced filters for live */}
      {(filter === 'live' || filter === 'all' || filter === 'premium') && canSeeLive && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <Globe2 className="w-3.5 h-3.5" /> Federation
                </label>
                <select
                  value={selectedFederation}
                  onChange={(e) => setSelectedFederation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Federations</option>
                  {federations.map(f => (
                    <option key={f.key} value={f.key}>{f.name || f.key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <Target className="w-3.5 h-3.5" /> Market
                </label>
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {markets.length > 0 ? (
                    markets.map(m => (
                      <option key={m.key} value={m.key}>{m.name || m.key}</option>
                    ))
                  ) : (
                    <>
                      <option value="classic">Classic</option>
                      <option value="over_25">Over 2.5 Goals</option>
                      <option value="over_35">Over 3.5 Goals</option>
                      <option value="btts">BTTS</option>
                      <option value="home_win">Home Win</option>
                      <option value="away_win">Away Win</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <Button size="sm" onClick={fetchLive} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API status banner */}
      {canSeeLive && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${apiFailed ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
          {apiFailed
            ? <><WifiOff className="w-4 h-4" /> Could not reach live API{apiError ? `: ${apiError}` : ''}. Showing cached/mock premium predictions below.</>
            : <><Wifi className="w-4 h-4" /> Connected to Football Prediction API · {liveCount} live predictions loaded for {selectedDate}.</>
          }
        </div>
      )}

      {/* Live locked banner for free users */}
      {!canSeeLive && filter === 'all' && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">Live API Predictions Locked</p>
                <p className="text-sm text-amber-800 dark:text-amber-400">Upgrade to Premium to unlock real-time predictions from our RapidAPI feed, plus federation and market filters.</p>
              </div>
            </div>
            <Button variant="premium" size="sm" onClick={() => setActiveTab('premium')}>Unlock Premium</Button>
          </CardContent>
        </Card>
      )}

      {/* Predictions Grid */}
      {allPredictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPredictions.map((pred, idx) => (
            <div key={`${pred.id}-${idx}`} className="relative">
              {pred.source === 'live-api' && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge variant="premium" className="shadow-lg">⚡ LIVE API</Badge>
                </div>
              )}
              <PredictionCard
                prediction={pred}
                onUpgrade={() => setActiveTab('premium')}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No predictions found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {filter === 'live' && canSeeLive
                ? apiFailed
                  ? 'The live API is currently unreachable from this browser. Please try refreshing, or check your filters.'
                  : 'No live predictions match your selected filters. Try a different date or federation.'
                : 'Try adjusting your filters.'}
            </p>
            <Button size="sm" onClick={() => { setFilter('all'); setSelectedFederation(''); }}>Reset Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}