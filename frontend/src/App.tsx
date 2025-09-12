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
    // Initialize PWA services
    const initializePWA = async () => {
      try {
        // Register service worker
        await pwaService.registerServiceWorker();
        
        // Initialize offline storage
        await offlineStorageService.initialize();
        
        // Clear expired cache
        await offlineStorageService.clearExpiredCache();
        
        console.log('PWA services initialized successfully');
      } catch (error) {
        console.error('Error initializing PWA services:', error);
      }
    };

    initializePWA();
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
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
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
