import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui';
import { format } from 'date-fns';
import {
  User, Mail, Globe, FileText, Bell, Shield, Crown,
  CheckCircle2, XCircle, Edit3, Save, X, Camera, Lock
} from 'lucide-react';
import { MOCK_RESULTS } from '../data/mockData';

export function UserProfile({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    country: user?.country || '',
    bio: user?.bio || '',
  });
  const [notifs, setNotifs] = useState(user?.notifications || { email: true, sms: false, push: true });

  if (!user) return null;

  const myResults = MOCK_RESULTS.slice(0, 5);
  const wins = myResults.filter(r => r.outcome === 'win').length;
  const totalPlaced = myResults.length;

  const handleSave = () => {
    updateProfile({ ...form, notifications: notifs });
    setEditMode(false);
  };

  const handleCancel = () => {
    setForm({ name: user.name, country: user.country, bio: user.bio });
    setNotifs(user.notifications);
    setEditMode(false);
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences.</p>
        </div>
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Avatar & Plan */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {initials}
                </div>
                {editMode && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Camera className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{user.email}</p>
              {user.plan === 'premium' ? (
                <Badge variant="premium" className="flex items-center gap-1 text-sm px-3 py-1">
                  <Crown className="w-3.5 h-3.5" /> Premium Member
                </Badge>
              ) : (
                <Badge variant="default" className="text-sm px-3 py-1">Free Tier</Badge>
              )}
              <p className="text-xs text-slate-400 mt-3">
                Member since {format(new Date(user.joinDate), 'MMMM yyyy')}
              </p>
              {user.plan !== 'premium' && (
                <Button variant="premium" size="sm" className="w-full mt-4" onClick={() => setActiveTab('premium')}>
                  <Crown className="w-4 h-4 mr-2" /> Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader><CardTitle>My Stats</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'Predictions Followed', value: totalPlaced },
                { label: 'Wins', value: wins, color: 'text-green-600 dark:text-green-400' },
                { label: 'Losses', value: totalPlaced - wins, color: 'text-red-500 dark:text-red-400' },
                { label: 'Win Rate', value: `${Math.round((wins / totalPlaced) * 100)}%`, color: 'text-blue-600 dark:text-blue-400' },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</span>
                  <span className={`text-sm font-bold ${stat.color || 'text-slate-900 dark:text-white'}`}>{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium">{user.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-700 dark:text-slate-300 text-sm">{user.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Country</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-700 dark:text-slate-300">{user.country}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Plan</label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-700 dark:text-slate-300 capitalize">{user.plan}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Bio</label>
                {editMode ? (
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                    {user.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { key: 'email' as const, label: 'Email Alerts', desc: 'Get new picks sent to your email.' },
                { key: 'sms' as const, label: 'SMS Alerts', desc: 'Receive urgent picks via SMS. (Premium only)', premium: true },
                { key: 'push' as const, label: 'Push Notifications', desc: 'Browser push notifications for live picks.' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                      {item.premium && <Badge variant="premium" className="text-xs">Premium</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    disabled={item.premium && user.plan !== 'premium'}
                    onClick={() => editMode && setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${notifs[item.key] && !(item.premium && user.plan !== 'premium') ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} ${!editMode || (item.premium && user.plan !== 'premium') ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifs[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Password</p>
                  <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Add extra security to your account</p>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bet Activity</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Match</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Prediction</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Score</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">P/L</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myResults.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {r.homeTeam} vs {r.awayTeam}
                    <div className="text-xs text-slate-400">{format(new Date(r.date), 'MMM d')}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.prediction}</td>
                  <td className="px-4 py-3 text-center font-bold">{r.homeScore} - {r.awayScore}</td>
                  <td className={`px-4 py-3 text-center font-semibold ${r.outcome === 'win' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{r.profit} U</td>
                  <td className="px-4 py-3 text-center">
                    {r.outcome === 'win'
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      : <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
