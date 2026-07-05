import { useState } from 'react';
import { useAuth } from '../context-football/AuthContext';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components-football/ui';
import { Play, CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';

interface WebhookEvent {
  event: string;
  data: any;
}

const SAMPLE_EVENTS: WebhookEvent[] = [
  {
    event: "charge.success",
    data: {
      id: 123456789,
      domain: "test",
      status: "success",
      reference: "FP_DAY_8923741",
      amount: 10000, // KSh 100 in cents
      currency: "KES",
      customer: {
        email: "user@footypredict.ai",
        first_name: "John",
        last_name: "Doe"
      },
      metadata: {
        plan: "Premium Daily Pass (24 Hours)",
        custom_fields: [
          { display_name: "Plan", variable_name: "plan", value: "Premium Daily Pass (24 Hours)" }
        ]
      },
      paid_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 60000).toISOString()
    }
  },
  {
    event: "charge.success",
    data: {
      id: 987654321,
      domain: "test",
      status: "success",
      reference: "FP_DAY_7812390",
      amount: 10000, // KSh 100 in cents
      currency: "KES",
      customer: {
        email: "user@footypredict.ai",
        first_name: "John",
        last_name: "Doe"
      },
      metadata: {
        plan: "Premium Daily Pass (24 Hours)"
      },
      paid_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 120000).toISOString()
    }
  },
  {
    event: "charge.failed",
    data: {
      id: 555666777,
      domain: "test",
      status: "failed",
      reference: "FP_DAY_FAILED_123456",
      amount: 10000,
      currency: "KES",
      customer: {
        email: "user@footypredict.ai"
      },
      gateway_response: "Insufficient Funds",
      paid_at: null,
      created_at: new Date().toISOString()
    }
  }
];

export function WebhookSimulator() {
  const { user, upgrade } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const currentEvent = SAMPLE_EVENTS[selectedEvent];

  const simulateWebhook = async () => {
    setIsProcessing(true);
    setLastResult(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const webhookPayload = {
      event: currentEvent.event,
      data: currentEvent.data
    };

    // Simulate signature verification
    const fakeSignature = "sha512=" + btoa(JSON.stringify(webhookPayload)).slice(0, 40);

    let result: any = {
      received: true,
      timestamp: new Date().toISOString(),
      signature: fakeSignature,
      verified: true,
      action: ""
    };

    if (currentEvent.event === "charge.success") {
      result.action = "24-hour Premium Pass activated";
      result.plan = currentEvent.data.metadata?.plan || "Premium Daily Pass (24 Hours)";
      result.reference = currentEvent.data.reference;

      // Actually upgrade the user
      if (user) {
        upgrade();
      }
    } else if (currentEvent.event === "charge.failed") {
      result.action = "Payment failed — no upgrade performed";
      result.reason = currentEvent.data.gateway_response;
      result.verified = false;
    }

    setLastResult(result);
    setIsProcessing(false);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(currentEvent, null, 2));
    alert("Webhook payload copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Webhook Simulator</h1>
        <p className="text-slate-500 mt-2">
          Simulate Paystack webhook events as if they were sent to your backend server.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Event Selector */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Webhook Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SAMPLE_EVENTS.map((event, index) => (
              <button
                key={index}
                onClick={() => setSelectedEvent(index)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  selectedEvent === index 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${event.event.includes('success') ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <div className="font-semibold text-sm">{event.event}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {event.data.reference} — {event.data.status}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Payload Preview */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>2. Webhook Payload</CardTitle>
            <Button variant="ghost" size="sm" onClick={copyPayload}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-slate-950 text-emerald-300 p-4 rounded-xl overflow-auto max-h-[320px] font-mono">
              {JSON.stringify(currentEvent, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Simulate Button */}
      <div className="flex justify-center">
        <Button 
          onClick={simulateWebhook} 
          disabled={isProcessing}
          size="lg"
          className="px-10 py-6 text-lg font-semibold shadow-xl"
        >
          {isProcessing ? (
            <>Processing Webhook...</>
          ) : (
            <>
              <Play className="w-5 h-5 mr-3" /> Simulate Incoming Webhook
            </>
          )}
        </Button>
      </div>

      {/* Result Panel */}
      {lastResult && (
        <Card className={`border-2 ${lastResult.verified ? 'border-emerald-500' : 'border-red-500'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {lastResult.verified ? (
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <CardTitle>Webhook Processed</CardTitle>
                <p className="text-sm text-slate-500">{lastResult.timestamp}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <div className="font-mono text-xs text-slate-500 mb-1">SIGNATURE (Simulated)</div>
              <div className="font-mono text-emerald-600 break-all">{lastResult.signature}</div>
            </div>

            <div>
              <div className="font-semibold mb-2">Result:</div>
              <div className={`p-4 rounded-xl ${lastResult.verified ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20' : 'bg-red-50 text-red-800 dark:bg-red-900/20'}`}>
                {lastResult.action}
                {lastResult.plan && <div className="mt-1 text-xs opacity-75">Plan: {lastResult.plan}</div>}
                {lastResult.reason && <div className="mt-1 text-xs opacity-75">Reason: {lastResult.reason}</div>}
              </div>
            </div>

            {lastResult.reference && (
              <div className="text-xs text-slate-500">
                Transaction Reference: <span className="font-mono text-emerald-600">{lastResult.reference}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Educational Note */}
      <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="font-semibold mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> How Real Webhooks Work
        </div>
        Paystack sends a POST request to your server with a signature in the <code>x-paystack-signature</code> header. 
        Your backend should verify this signature using your secret key before processing the event.
      </div>
    </div>
  );
}
