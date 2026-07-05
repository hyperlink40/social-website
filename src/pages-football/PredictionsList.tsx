import { useEffect, useMemo, useState } from 'react';
import { MOCK_PREDICTIONS } from '../data-football/mockData';
import { PredictionCard } from '../components-football/predictions/PredictionCard';
import { Button, Card, CardContent, Badge } from '../components-football/ui';
import { getPredictions, getFederations, getMarkets, normalizeApiPrediction } from '../services-football/footballApi';
import { RefreshCw, WifiOff, Wifi, Calendar, Globe as Globe2, Filter, Target, Code, Copy, Check, Search, Import as SortAsc, Dessert as SortDesc, ArrowUpDown, TrendingUp, Star, X } from 'lucide-react';
import { useAuth } from '../context-football/AuthContext';

type PredictionT = typeof MOCK_PREDICTIONS[number] & { source?: 'mock' | 'live-api'; federation?: string; market?: string; status?: string };
type SortField = 'date' | 'confidence' | 'odds';
type SortDir = 'asc' | 'desc';

export function PredictionsList({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'live'>('all');
  const [selectedFederation, setSelectedFederation] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('classic');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [minConfidence, setMinConfidence] = useState(0);
  const [maxOdds, setMaxOdds] = useState<string>('');
  const [minOdds, setMinOdds] = useState<string>('');

  const [livePredictions, setLivePredictions] = useState<PredictionT[]>([]);
  const [federations, setFederations] = useState<{ key: string; name: string }[]>([]);
  const [markets, setMarkets] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  const [showApiResponse, setShowApiResponse] = useState(false);
  const [lastRawResponse, setLastRawResponse] = useState<any>(null);
  const [lastApiMeta, setLastApiMeta] = useState<{endpoint: string, status?: number, proxy?: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      combined = combined.filter(p =>
        p.homeTeam.toLowerCase().includes(query) ||
        p.awayTeam.toLowerCase().includes(query) ||
        p.league.toLowerCase().includes(query) ||
        p.prediction.toLowerCase().includes(query)
      );
    }

    // Apply confidence filter
    if (minConfidence > 0) {
      combined = combined.filter(p => p.confidence >= minConfidence);
    }

    // Apply odds filter
    if (minOdds) {
      combined = combined.filter(p => parseFloat(p.odds) >= parseFloat(minOdds));
    }
    if (maxOdds) {
      combined = combined.filter(p => parseFloat(p.odds) <= parseFloat(maxOdds));
    }

    // Apply sorting
    combined.sort((a, b) => {
      switch (sortField) {
        case 'date':
          return sortDir === 'asc'
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'confidence':
          return sortDir === 'asc' ? a.confidence - b.confidence : b.confidence - a.confidence;
        case 'odds':
          return sortDir === 'asc'
            ? parseFloat(a.odds) - parseFloat(b.odds)
            : parseFloat(b.odds) - parseFloat(a.odds);
        default:
          return 0;
      }
    });

    return combined;
  }, [filter, livePredictions, mockPredictions, searchQuery, minConfidence, minOdds, maxOdds, sortField, sortDir]);

  const canSeeLive = user?.plan === 'premium';

  const copyResponse = () => {
    if (!lastRawResponse) return;
    navigator.clipboard.writeText(JSON.stringify(lastRawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setMinConfidence(0);
    setMinOdds('');
    setMaxOdds('');
    setFilter('all');
    setSelectedFederation('');
  };

  const hasActiveFilters = searchQuery || minConfidence > 0 || minOdds || maxOdds || filter !== 'all' || selectedFederation;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Predictions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {canSeeLive
              ? `${allPredictions.length} predictions • ${liveCount} live from API`
              : `${allPredictions.length} free picks available`}
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
              </div>
              <Button size="sm" variant="outline" onClick={copyResponse} className="h-8 text-xs">
                {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}
              </Button>
            </div>
            <div className="bg-slate-950 rounded-lg p-4 max-h-[320px] overflow-auto font-mono text-[11px] leading-relaxed text-emerald-400 shadow-inner">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lastRawResponse, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams, leagues, predictions..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant={showAdvancedFilters ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card className="animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4 space-y-4">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type:</span>
              {[
                { id: 'all', label: 'All Picks' },
                { id: 'free', label: 'Free' },
                { id: 'premium', label: 'Premium' },
                { id: 'live', label: 'Live API', premiumOnly: true },
              ].map(f => {
                const isLocked = (f as any).premiumOnly && !canSeeLive;
                return (
                  <button
                    key={f.id}
                    onClick={() => !isLocked && setFilter(f.id as any)}
                    disabled={isLocked}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-1 ${
                      filter === f.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLocked
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                    {isLocked && <span className="text-amber-500">🔒</span>}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Confidence Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Min Confidence
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Any</span>
                  <span className="font-semibold text-blue-600">{minConfidence}%+</span>
                </div>
              </div>

              {/* Min Odds */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Min Odds
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={minOdds}
                  onChange={(e) => setMinOdds(e.target.value)}
                  placeholder="e.g. 1.5"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Max Odds */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Max Odds
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={maxOdds}
                  onChange={(e) => setMaxOdds(e.target.value)}
                  placeholder="e.g. 3.0"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Federation (Premium only) */}
              {canSeeLive && federations.length > 0 && (
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
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                  <X className="w-4 h-4 mr-1" /> Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sorting Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort by:</span>
          {[
            { field: 'date' as SortField, label: 'Date', icon: Calendar },
            { field: 'confidence' as SortField, label: 'Confidence', icon: TrendingUp },
            { field: 'odds' as SortField, label: 'Odds', icon: Star },
          ].map(s => (
            <button
              key={s.field}
              onClick={() => toggleSort(s.field)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortField === s.field
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
              {sortField === s.field && (
                sortDir === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* API status banner */}
      {canSeeLive && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${apiFailed ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
          {apiFailed
            ? <><WifiOff className="w-4 h-4" /> Could not reach live API{apiError ? `: ${apiError}` : ''}. Showing cached predictions.</>
            : <><Wifi className="w-4 h-4" /> Connected to Football Prediction API · {liveCount} live predictions</>
          }
        </div>
      )}

      {/* Live locked banner for free users */}
      {!canSeeLive && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">Live API Predictions Locked</p>
                <p className="text-sm text-amber-800 dark:text-amber-400">Upgrade to Premium for real-time predictions and advanced filters.</p>
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
                  <Badge variant="premium" className="shadow-lg flex items-center gap-1">
                    <Target className="w-3 h-3" /> LIVE
                  </Badge>
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
              {searchQuery ? `No matches for "${searchQuery}"` : 'Try adjusting your filters.'}
            </p>
            <Button size="sm" onClick={clearFilters}>Clear Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
