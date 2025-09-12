import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { pwaService } from '@/lib/pwaService';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if PWA can be installed
    const checkInstallability = () => {
      if (pwaService.canInstall() && !pwaService.isAppInstalled()) {
        setShowPrompt(true);
      }
    };

    // Check installation status
    setIsInstalled(pwaService.isAppInstalled());
    setIsOnline(pwaService.isOnlineStatus());

    // Listen for install availability
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    const handleInstallComplete = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast({
        title: "App Installed!",
        description: "EcoLearn has been installed successfully!",
      });
    };

    const handleOnlineStatus = (event: CustomEvent) => {
      setIsOnline(event.detail.isOnline);
    };

    // Initial check
    checkInstallability();

    // Register event listeners
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-complete', handleInstallComplete);
    window.addEventListener('pwa-online-status', handleOnlineStatus as EventListener);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-complete', handleInstallComplete);
      window.removeEventListener('pwa-online-status', handleOnlineStatus as EventListener);
    };
  }, [toast]);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      const success = await pwaService.installApp();
      
      if (success) {
        setShowPrompt(false);
        toast({
          title: "Installing...",
          description: "EcoLearn is being installed on your device",
        });
      } else {
        toast({
          title: "Installation Cancelled",
          description: "You can install the app later from your browser menu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Installation error:', error);
      toast({
        title: "Installation Failed",
        description: "Unable to install the app. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onClose?.();
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Show again after 24 hours
    setTimeout(() => {
      if (pwaService.canInstall() && !pwaService.isAppInstalled()) {
        setShowPrompt(true);
      }
    }, 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Download className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800">
            Install EcoLearn
          </CardTitle>
          <CardDescription className="text-green-600">
            Get the full app experience with offline access and notifications
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Wifi className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Offline Access</p>
                <p className="text-sm text-gray-600">Play games and take quizzes without internet</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">App-like Experience</p>
                <p className="text-sm text-gray-600">Full-screen mode and native feel</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Monitor className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Cross-Platform</p>
                <p className="text-sm text-gray-600">Works on mobile, tablet, and desktop</p>
              </div>
            </div>
          </div>

          {/* Online Status */}
          <div className="flex items-center justify-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Online - Ready to install</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Offline - Install when online</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleInstall}
              disabled={isInstalling || !isOnline}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </>
              )}
            </Button>

            <div className="flex space-x-2">
              <Button 
                onClick={handleRemindLater}
                variant="outline"
                className="flex-1"
                disabled={isInstalling}
              >
                Remind Later
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
                disabled={isInstalling}
              >
                <X className="w-4 h-4 mr-2" />
                Dismiss
              </Button>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              <strong>Mobile:</strong> Tap "Add to Home Screen" in your browser menu<br/>
              <strong>Desktop:</strong> Look for the install button in your address bar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
