import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

type Props = { onStartQuiz?: (quizId?: string) => void };

const StudentClassSpace: React.FC<Props> = ({ onStartQuiz }) => {
  const navigate = useNavigate();
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
      try { localStorage.setItem('codespace.join', JSON.stringify(body)); } catch {}
      // Navigate to the dedicated classroom view for this code
      const c = String(code).toUpperCase();
      navigate(`/classroom/${c}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Join Class Space</CardTitle>
          <CardDescription>Enter the code given by your instructor to join the class session.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Codespace Code</label>
              <Input
                placeholder="e.g. 7K3B9Q"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') join(); }}
                className="tracking-widest uppercase"
              />
            </div>
            <Button onClick={join} disabled={loading || code.trim().length < 4}>
              {loading ? 'Joining...' : 'Join'}
            </Button>
          </div>
          {message && (
            <div className="mt-3 text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">{message}</div>
          )}
          {error && (
            <div className="mt-3 text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>
          )}
          {result && (
            <div className="mt-3 text-sm text-muted-foreground">
              <div>Code: <span className="font-mono">{result?.codespace?.code}</span></div>
              <div>Instructor: <span className="font-mono">{result?.codespace?.adminUserId}</span></div>
              <div>Expires: {result?.codespace?.expiresAt ? new Date(result.codespace.expiresAt).toLocaleString() : 'N/A'}</div>
              <div className="mt-3 flex gap-2">
                <Link to={`/classroom/${(result?.codespace?.code || '').toUpperCase()}`}>
                  <Button>Enter Classroom</Button>
                </Link>
                {result?.codespace?.quizId && (
                  <Button onClick={() => onStartQuiz?.(result.codespace.quizId)} variant="secondary">
                    Start Quiz
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentClassSpace;
