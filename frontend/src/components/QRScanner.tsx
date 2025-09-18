import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, CheckCircle, XCircle, X, RotateCcw } from 'lucide-react';
import { qrService, QRCheckInResult } from '@/lib/qrService';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onClose?: () => void;
  onCheckInSuccess?: (result: QRCheckInResult) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ 
  onClose, 
  onCheckInSuccess 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRCheckInResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for QR scan events
    const handleQRSuccess = (event: CustomEvent) => {
      const result = event.detail as QRCheckInResult;
      setScanResult(result);
      setIsScanning(false);
      
      if (result.success) {
        toast({
          title: "Check-in Successful!",
          description: result.message || "You've successfully checked in!",
        });
        onCheckInSuccess?.(result);
      } else {
        toast({
          title: "Check-in Failed",
          description: result.error || "Invalid QR code",
          variant: "destructive"
        });
      }
    };

    const handleQRError = (event: CustomEvent) => {
      const error = event.detail;
      toast({
        title: "Scan Error",
        description: error.message || "Failed to scan QR code",
        variant: "destructive"
      });
    };

    window.addEventListener('qr-checkin-success', handleQRSuccess as EventListener);
    window.addEventListener('qr-checkin-error', handleQRError as EventListener);
    window.addEventListener('qr-error', handleQRError as EventListener);

    return () => {
      window.removeEventListener('qr-checkin-success', handleQRSuccess as EventListener);
      window.removeEventListener('qr-checkin-error', handleQRError as EventListener);
      window.removeEventListener('qr-error', handleQRError as EventListener);
    };
  }, [toast, onCheckInSuccess]);

  const startScanning = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);
      setScanResult(null);

      if (videoRef.current) {
        await qrService.startScanning(videoRef.current);
      }
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setCameraError('Camera access denied. Please allow camera permissions.');
      setIsScanning(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    qrService.stopScanning();
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setCameraError(null);
  };

  if (scanResult) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              scanResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {scanResult.success ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>
          <CardTitle className={`text-2xl ${
            scanResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
          </CardTitle>
          <CardDescription className={
            scanResult.success ? 'text-green-600' : 'text-red-600'
          }>
            {scanResult.message || scanResult.error}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {scanResult.success && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Task ID:</span>
                <Badge variant="secondary">{scanResult.taskId}</Badge>
              </div>
              {scanResult.points && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Points Earned:</span>
                  <Badge className="bg-green-100 text-green-800">
                    +{scanResult.points} pts
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <Button 
              onClick={resetScanner}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Another
            </Button>
            {onClose && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <QrCode className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-green-800">
          QR Code Scanner
        </CardTitle>
        <CardDescription className="text-green-600">
          Scan QR codes to check in for eco-tasks and earn points!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Scanning QR code...</p>
                <p className="text-sm mt-2">Point camera at QR code</p>
              </div>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
              <div className="text-center text-red-800 p-4">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Camera Error</p>
                <p className="text-sm">{cameraError}</p>
              </div>
            </div>
          )}

          {/* Scanning Frame */}
          {isScanning && !cameraError && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-green-500 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-2">How to use:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Point your camera at a QR code</li>
            <li>Tap "Start Scanning" to begin</li>
            <li>Hold steady until the code is detected</li>
            <li>Get instant check-in confirmation!</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {!isScanning ? (
            <Button 
              onClick={startScanning}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!!cameraError}
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button 
              onClick={stopScanning}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
          )}
          
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outline"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;










