import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Classroom: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [codespace, setCodespace] = React.useState<any>(null);

  const refresh = async () => {
    setError(null);
    try {
      setLoading(true);
      if (!code) { setError('Missing classroom code'); return; }
      const res = await fetch('/api/codespaces/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to load classroom');
      setCodespace(body.codespace);
      try { localStorage.setItem('codespace.join', JSON.stringify(body)); } catch {}
    } catch (e:any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { refresh(); }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-light/40 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Classroom</CardTitle>
          <CardDescription>
            Entered with code <span className="font-mono">{code}</span>. Stay on this page for updates from your instructor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={refresh} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
            {error && (
              <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>
            )}
            {codespace && (
              <div className="space-y-2 text-sm">
                <div>Code: <span className="font-mono">{codespace.code}</span></div>
                <div>Instructor: <span className="font-mono">{codespace.adminDisplayName || codespace.adminUserId}</span></div>
                <div>Status: {codespace.active ? 'Active' : 'Inactive'}</div>
                <div>Expires: {codespace.expiresAt ? new Date(codespace.expiresAt).toLocaleString() : 'N/A'}</div>
                {codespace.name && <div>Class Space: {codespace.name}</div>}
                {codespace.quizId ? (
                  <div className="pt-2">
                    <Button onClick={() => navigate('/', { state: { startQuizFromClass: codespace.quizId } })}>
                      Start Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Waiting for instructor to attach a quiz…</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Classroom;
