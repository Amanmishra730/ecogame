import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Join: React.FC = () => {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);

  const join = async () => {
    setMessage(null);
    setError(null);
    setResult(null);
    try {
      setLoading(true);
      const res = await fetch('/api/codespaces/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Failed to join');
      }
      setResult(body);
      setMessage('Success! You have joined the codespace.');
      // Optionally store for later use
      try { localStorage.setItem('codespace.join', JSON.stringify(body)); } catch {}
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-light/40 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Codespace</CardTitle>
          <CardDescription>Enter the code provided by your instructor to access the quiz space.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Codespace Code</label>
              <Input
                placeholder="e.g. 7K3B9Q"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') join(); }}
                className="tracking-widest uppercase"
              />
            </div>
            <Button className="w-full" onClick={join} disabled={loading || code.trim().length < 4}>
              {loading ? 'Joining...' : 'Join'}
            </Button>
            {message && (
              <div className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">{message}</div>
            )}
            {error && (
              <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>
            )}
            {result && (
              <div className="text-sm text-muted-foreground">
                <div>Code: <span className="font-mono">{result?.codespace?.code}</span></div>
                <div>Instructor: <span className="font-mono">{result?.codespace?.adminUserId}</span></div>
                <div>Expires: {result?.codespace?.expiresAt ? new Date(result.codespace.expiresAt).toLocaleString() : 'N/A'}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Join;
