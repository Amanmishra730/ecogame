import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, MessageCircle, Download, Copy, Check } from 'lucide-react';
import { qrService } from '@/lib/qrService';
import { useToast } from '@/hooks/use-toast';

interface AchievementData {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  timestamp: string;
  imageUrl?: string;
}

interface WhatsAppShareCardProps {
  achievement: AchievementData;
  onClose?: () => void;
}

export const WhatsAppShareCard: React.FC<WhatsAppShareCardProps> = ({ 
  achievement, 
  onClose 
}) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateShareData();
  }, [achievement]);

  const generateShareData = async () => {
    try {
      // Generate QR code for WhatsApp sharing
      const qr = await qrService.generateWhatsAppShareQR(achievement);
      setQrCode(qr);

      // Generate share URL
      const baseUrl = window.location.origin;
      const shareParams = new URLSearchParams({
        text: `🌱 I just completed "${achievement.title}" in EcoLearn! ${achievement.description} Join me in saving the planet! 🌍`,
        url: `${baseUrl}/achievement/${achievement.id}`
      });
      
      setShareUrl(`https://wa.me/?${shareParams.toString()}`);
    } catch (error) {
      console.error('Error generating share data:', error);
      toast({
        title: "Error",
        description: "Failed to generate share data",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppShare = () => {
    window.open(shareUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard"
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.download = `ecolearn-achievement-${achievement.id}.png`;
      link.href = qrCode;
      link.click();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Share2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl text-green-800">
          Share Your Achievement!
        </CardTitle>
        <CardDescription className="text-green-600">
          Spread the word about your eco-progress
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Achievement Preview */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              +{achievement.points} pts
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="capitalize">{achievement.category}</span>
            <span>{formatTimestamp(achievement.timestamp)}</span>
          </div>
        </div>

        {/* QR Code */}
        {qrCode && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Scan to view achievement
            </p>
            <div className="inline-block p-4 bg-white rounded-lg border border-gray-200">
              <img 
                src={qrCode} 
                alt="Achievement QR Code" 
                className="w-32 h-32 mx-auto"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQR}
              className="mt-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </div>
        )}

        {/* Share Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleWhatsAppShare}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Share on WhatsApp
          </Button>

          <Button 
            variant="outline" 
            onClick={handleCopyLink}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>

        {/* Share Preview */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-medium mb-1">Preview:</p>
          <p className="break-words">
            🌱 I just completed "{achievement.title}" in EcoLearn! {achievement.description} Join me in saving the planet! 🌍
          </p>
        </div>

        {onClose && (
          <div className="pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppShareCard;















