import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const { currentUser } = useAuth();
  const [orgType, setOrgType] = React.useState<'school'|'college'|'ngo'>('school');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const continueToAdmin = async () => {
    setError(null);
    try {
      setLoading(true);
      if (!currentUser) {
        setError('Please login first using your EcoLearn account.');
        return;
      }
      try { sessionStorage.setItem('admin.portal.ok', '1'); sessionStorage.setItem('admin.portal.orgType', orgType); } catch {}
      window.location.href = '/admin';
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter Admin Portal</CardTitle>
          <CardDescription>
            {currentUser ? 'Choose your organization type and continue.' : 'Please sign in with your EcoLearn account first.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Organization Type</label>
              <select className="w-full h-10 border rounded-md px-3" value={orgType} onChange={(e)=>setOrgType(e.target.value as any)}>
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="ngo">NGO</option>
              </select>
            </div>
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>}
            <Button className="w-full" onClick={continueToAdmin} disabled={loading}>
              {loading ? 'Loading...' : 'Continue to Admin'}
            </Button>
            {!currentUser && (
              <div className="text-sm text-center text-muted-foreground">
                Not signed in? <a href="/" className="underline text-green-700">Go to EcoLearn Login</a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
