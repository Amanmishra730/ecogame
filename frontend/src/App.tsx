import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserProgressProvider } from "./contexts/UserProgressContext";
import { I18nProvider } from "./contexts/I18nContext";
import LoginForm from "./components/LoginForm";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Classroom from "./pages/Classroom";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/AdminLogin";
import Join from "./pages/Join";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { pwaService } from "./lib/pwaService";
import { offlineStorageService } from "./lib/offlineStorageService";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    // In development, service workers can cache old bundles and block HMR updates.
    // Only register PWA in production; in dev, proactively unregister any SWs and clear caches.
    const setup = async () => {
      try {
        if (import.meta.env.PROD) {
          await pwaService.registerServiceWorker();
          await offlineStorageService.initialize();
          await offlineStorageService.clearExpiredCache();
          console.log('PWA services initialized successfully');
        } else {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
            // Also try to clear any caches created previously
            if (window.caches && caches.keys) {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
            }
            console.log('[DEV] Unregistered service workers and cleared caches');
          }
        }
      } catch (error) {
        console.error('PWA setup error:', error);
      }
    };

    setup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <AuthProvider>
            <UserProgressProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/classroom/:code" 
                    element={<Classroom />} 
                  />
                  <Route 
                    path="/join" 
                    element={<Join />} 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    } 
                  />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <PWAInstallPrompt />
              </BrowserRouter>
            </UserProgressProvider>
          </AuthProvider>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
