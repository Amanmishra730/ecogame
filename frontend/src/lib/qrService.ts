// QR Code Service for eco-task check-ins and sharing

import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';

export interface EcoTaskQR {
  id: string;
  type: 'checkin' | 'achievement' | 'share';
  taskId?: string;
  userId?: string;
  timestamp: string;
  data: any;
}

export interface QRCheckInResult {
  success: boolean;
  taskId?: string;
  points?: number;
  message?: string;
  error?: string;
}

class QRService {
  private scanner: QrScanner | null = null;
  private isScanning = false;
  private demoMode = true; // Local demo mode: succeed without backend

  setDemoMode(enabled: boolean) {
    this.demoMode = enabled;
  }

  // Generate QR code for eco-task check-in
  async generateTaskQR(taskId: string, userId: string, taskData: any): Promise<string> {
    const qrData: EcoTaskQR = {
      id: `task_${taskId}_${Date.now()}`,
      type: 'checkin',
      taskId,
      userId,
      timestamp: new Date().toISOString(),
      data: taskData
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#22c55e', // Green color for eco theme
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code for sharing achievements
  async generateShareQR(achievementData: any): Promise<string> {
    const qrData: EcoTaskQR = {
      id: `share_${Date.now()}`,
      type: 'share',
      timestamp: new Date().toISOString(),
      data: achievementData
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#3b82f6', // Blue color for sharing
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating share QR code:', error);
      throw new Error('Failed to generate share QR code');
    }
  }

  // Start QR code scanning
  async startScanning(videoElement: HTMLVideoElement): Promise<void> {
    if (this.isScanning) {
      throw new Error('QR scanner is already running');
    }

    try {
      this.scanner = new QrScanner(
        videoElement,
        (result) => this.handleQRResult(result),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Use back camera for better scanning
        }
      );

      await this.scanner.start();
      this.isScanning = true;
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      throw new Error('Failed to start QR scanner');
    }
  }

  // Stop QR code scanning
  stopScanning(): void {
    if (this.scanner && this.isScanning) {
      this.scanner.stop();
      this.scanner.destroy();
      this.scanner = null;
      this.isScanning = false;
    }
  }

  // Handle QR code scan result
  private async handleQRResult(result: QrScanner.ScanResult): Promise<void> {
    try {
      const parsed = this.parseAnyQRCode(result.data);

      if (parsed.type === 'checkin') {
        await this.handleTaskCheckIn(parsed);
        this.stopScanning();
        return;
      }
      if (parsed.type === 'share') {
        await this.handleShareQR(parsed);
        this.stopScanning();
        return;
      }

      // Fallback: unknown but valid payload
      this.notifyQRError('Unsupported QR code');
    } catch (error) {
      console.error('QR parse error:', error);
      this.notifyQRError('Invalid QR code format');
    }
  }

  // Robust QR parser supporting JSON, URLs and custom text schemes
  private parseAnyQRCode(raw: string): EcoTaskQR {
    // 1) Try JSON format first
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && (obj.type === 'checkin' || obj.type === 'share')) {
        return {
          id: obj.id || `qr_${Date.now()}`,
          type: obj.type,
          taskId: obj.taskId,
          userId: obj.userId,
          timestamp: obj.timestamp || new Date().toISOString(),
          data: obj.data ?? {}
        };
      }
    } catch (_) {
      // ignore
    }

    // 2) Try URL query format: https://example.com/?type=checkin&taskId=123&userId=abc
    try {
      const url = new URL(raw);
      const type = (url.searchParams.get('type') || '').toLowerCase();
      if (type === 'checkin' || type === 'share') {
        return {
          id: url.searchParams.get('id') || `qr_${Date.now()}`,
          type: type as 'checkin' | 'share',
          taskId: url.searchParams.get('taskId') || undefined,
          userId: url.searchParams.get('userId') || undefined,
          timestamp: new Date().toISOString(),
          data: Object.fromEntries(url.searchParams.entries())
        };
      }
    } catch (_) {
      // not a URL
    }

    // 3) Try custom scheme: ECOCHECKIN:taskId:userId or ECO:TYPE:K=V&K2=V2
    const upper = raw.toUpperCase();
    if (upper.startsWith('ECOCHECKIN:')) {
      const parts = raw.split(':');
      const taskId = parts[1] || undefined;
      const userId = parts[2] || undefined;
      return {
        id: `qr_${Date.now()}`,
        type: 'checkin',
        taskId,
        userId,
        timestamp: new Date().toISOString(),
        data: { raw }
      };
    }

    // 4) Simple key=value pairs: type=checkin&taskId=123&userId=abc
    if (raw.includes('=') && raw.includes('&')) {
      const params = new URLSearchParams(raw);
      const type = (params.get('type') || '').toLowerCase();
      if (type === 'checkin' || type === 'share') {
        return {
          id: params.get('id') || `qr_${Date.now()}`,
          type: type as 'checkin' | 'share',
          taskId: params.get('taskId') || undefined,
          userId: params.get('userId') || undefined,
          timestamp: new Date().toISOString(),
          data: Object.fromEntries(params.entries())
        };
      }
    }

    throw new Error('Unrecognized QR payload');
  }

  // Handle task check-in
  private async handleTaskCheckIn(qrData: EcoTaskQR): Promise<QRCheckInResult> {
    try {
      // Demo mode: immediately succeed without API
      if (this.demoMode) {
        const mock = {
          success: true,
          taskId: qrData.taskId || 'demo-task',
          points: 100,
          message: 'Demo check-in successful (offline)'
        } as QRCheckInResult;
        this.notifyCheckInSuccess(mock);
        return mock;
      }

      const response = await fetch('/api/eco-tasks/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: qrData.taskId,
          userId: qrData.userId,
          timestamp: qrData.timestamp,
          qrId: qrData.id
        })
      });

      if (!response.ok) {
        throw new Error('Check-in failed');
      }

      const result = await response.json();
      this.notifyCheckInSuccess(result);
      
      return {
        success: true,
        taskId: result.taskId,
        points: result.points,
        message: result.message
      };
    } catch (error) {
      console.error('Error checking in:', error);
      const errorResult: QRCheckInResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Check-in failed'
      };
      this.notifyCheckInError(errorResult);
      return errorResult;
    }
  }

  // Handle share QR code
  private async handleShareQR(qrData: EcoTaskQR): Promise<void> {
    // Open shared content or redirect to achievement page
    window.dispatchEvent(new CustomEvent('qr-share-received', {
      detail: qrData.data
    }));
  }

  // Generate QR code for specific eco-tasks
  async generateEcoTaskQRs(tasks: any[]): Promise<Map<string, string>> {
    const qrCodes = new Map<string, string>();
    
    for (const task of tasks) {
      try {
        const qrCode = await this.generateTaskQR(
          task.id,
          'current_user', // This should be replaced with actual user ID
          {
            title: task.title,
            description: task.description,
            points: task.points,
            location: task.location
          }
        );
        qrCodes.set(task.id, qrCode);
      } catch (error) {
        console.error(`Error generating QR for task ${task.id}:`, error);
      }
    }
    
    return qrCodes;
  }

  // Generate QR code for WhatsApp sharing
  async generateWhatsAppShareQR(achievementData: any): Promise<string> {
    const shareData = {
      text: `🌱 I just completed "${achievementData.title}" in EcoLearn! ${achievementData.description} Join me in saving the planet! 🌍`,
      url: window.location.origin,
      hashtags: ['EcoLearn', 'EnvironmentalEducation', 'SaveThePlanet']
    };

    return this.generateShareQR(shareData);
  }

  // Event notification methods
  private notifyCheckInSuccess(result: any): void {
    window.dispatchEvent(new CustomEvent('qr-checkin-success', {
      detail: result
    }));
  }

  private notifyCheckInError(error: QRCheckInResult): void {
    window.dispatchEvent(new CustomEvent('qr-checkin-error', {
      detail: error
    }));
  }

  private notifyQRError(message: string): void {
    window.dispatchEvent(new CustomEvent('qr-error', {
      detail: { message }
    }));
  }

  // Utility methods
  isScanningActive(): boolean {
    return this.isScanning;
  }

  // Clean up resources
  destroy(): void {
    this.stopScanning();
  }
}

// Export singleton instance
export const qrService = new QRService();
export default qrService;
