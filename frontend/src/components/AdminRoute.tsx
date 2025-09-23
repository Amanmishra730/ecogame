import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Navigate } from 'react-router-dom';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600" />
  </div>
);

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      if (loading) return; // wait for auth
      if (!currentUser) { setCheckingRole(false); setIsAdmin(null); return; }
      try {
        const snap = await getDoc(doc(db, 'userRoles', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data() as any;
          setIsAdmin(data.role === 'admin' && ['school','college','ngo'].includes(data.orgType));
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };
    run();
  }, [currentUser, loading]);

  if (loading || checkingRole) return <Spinner />;
  if (!currentUser) return <LoginForm />;
  // Require explicit admin portal entry (prevents silent entry from user session)
  const portalOk = typeof window !== 'undefined' ? sessionStorage.getItem('admin.portal.ok') === '1' : false;
  if (!portalOk) return <Navigate to="/admin-login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-3">
          <h1 className="text-2xl font-semibold">403 • Admin Access Required</h1>
          <p className="text-muted-foreground">Your account is not authorized to access the Admin portal. Please contact your organization administrator.</p>
          <a href="/" className="text-green-700 underline">Go back home</a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
