import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { Crown, CreditCard, Trash2, AlertCircle, Clock } from 'lucide-react';
import { format, addHours } from 'date-fns';

export function SubscriptionManagement({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);

  const isPremium = user?.plan === 'premium';

  // Simulate subscription metadata for daily pass
  const startedAt = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 hours ago
  const expiresAt = addHours(startedAt, 24);

  const subscription = {
    plan: 'Premium Daily Pass',
    status: isPremium ? 'active' : 'inactive',
    expiresAt: expiresAt,
    startedAt: startedAt,
    amount: 100,
    currency: 'KES',
    paymentMethod: 'M-Pesa',
    reference: 'FP_DAY_8923741'
  };

  useEffect(() => {
    // Simulate payment history
    setSubscriptionHistory([
      {
        id: 1,
        date: new Date(Date.now() - 1000 * 60 * 60 * 2),
        amount: 100,
        status: 'success',
        reference: 'FP_DAY_8923741'
      },
      {
        id: 2,
        date: new Date(Date.now() - 1000 * 60 * 60 * 26),
        amount: 100,
        status: 'success',
        reference: 'FP_DAY_7812390'
      }
    ]);
  }, []);

  const handleCancelSubscription = () => {
    setIsCancelling(true);
    setTimeout(() => {
      alert("Your daily pass has been noted. It will expire at the end of the current 24-hour period.");
      setShowCancelConfirm(false);
      setIsCancelling(false);
    }, 1200);
  };

  const renewSubscription = () => {
    setActiveTab('premium');
  };

  // Calculate remaining time
  const remainingMs = subscription.expiresAt.getTime() - new Date().getTime();
  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
  const remainingMinutes = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Subscription Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your FootyPredict Premium Daily Pass.</p>
      </div>

      {/* Current Subscription Status */}
      <Card className={`border-2 ${isPremium ? 'border-emerald-400' : 'border-slate-300'}`}>
        <CardHeader className={`${isPremium ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isPremium ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Crown className={`w-6 h-6 ${isPremium ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <CardTitle className="text-xl">{isPremium ? 'Premium Pass Active' : 'No Active Pass'}</CardTitle>
                <p className="text-sm text-slate-500">{isPremium ? 'Expires in 24 hours' : 'Get a 24-hour premium pass'}</p>
              </div>
            </div>
            {isPremium && (
              <Badge variant="success" className="text-xs px-4 py-1">ACTIVE</Badge>
            )}
          </div>
        </CardHeader>

        {isPremium && (
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">EXPIRES IN</div>
                <div className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {remainingHours}h {remainingMinutes}m remaining
                </div>
                <div className="text-xs text-slate-400">
                  Ends {format(subscription.expiresAt, 'MMM dd, yyyy • hh:mm a')}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">PASS PRICE</div>
                <div className="font-semibold text-lg">KSh {subscription.amount}</div>
                <div className="text-xs text-slate-400">One-time payment</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Payment Method</span>
                <span className="font-medium">{subscription.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Started On</span>
                <span className="font-medium">{format(subscription.startedAt, 'MMMM dd, yyyy • hh:mm a')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-400">Reference</span>
                <span className="font-mono text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded">{subscription.reference}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowCancelConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Deactivate
              </Button>
              <Button 
                variant="premium" 
                className="flex-1"
                onClick={renewSubscription}
              >
                <Crown className="w-4 h-4 mr-2" /> Buy New Pass
              </Button>
            </div>
          </CardContent>
        )}

        {!isPremium && (
          <CardContent className="p-6 text-center">
            <p className="text-slate-500 mb-4">You don't have an active premium pass.</p>
            <Button variant="premium" onClick={renewSubscription}>
              <Crown className="w-4 h-4 mr-2" /> Get Premium for KSh 100
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptionHistory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No payment history yet.</p>
            ) : (
              subscriptionHistory.map((payment, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center text-emerald-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Premium Daily Pass</div>
                      <div className="text-xs text-slate-500">{format(payment.date, 'MMM dd, yyyy • hh:mm a')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">KSh {payment.amount}</div>
                    <div className="text-xs text-slate-400 font-mono">Ref: {payment.reference}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center space-y-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-xl font-bold mb-2">End Premium Pass Early?</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Your 24-hour premium access will stop immediately. You can always purchase a new pass later.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl text-left text-sm">
                Your pass currently has <span className="font-semibold">{remainingHours}h {remainingMinutes}m</span> remaining out of 24 hours.
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep My Pass
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={isCancelling}
                  onClick={handleCancelSubscription}
                >
                  {isCancelling ? 'Deactivating...' : 'Yes, End Pass'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center text-xs text-slate-400">
        Payments are securely processed by Paystack. Daily passes are non-refundable. You will be notified before expiry.
      </div>
    </div>
  );
}
