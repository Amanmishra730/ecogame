import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRecoveryService } from '@/lib/dataRecoveryService';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { toast } from 'sonner';
import { RefreshCw, Database, AlertTriangle } from 'lucide-react';

export const DataRecoveryButton = () => {
  const { currentUser } = useAuth();
  const { userProgress, refreshProgress } = useUserProgress();
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRecoverData = async () => {
    if (!currentUser) return;
    
    try {
      setIsRecovering(true);
      const recoveredProgress = await DataRecoveryService.recoverUserProgress(currentUser.uid);
      
      if (recoveredProgress) {
        toast.success('Data recovered successfully!');
        // Refresh the progress to update the UI
        await refreshProgress();
      } else {
        toast.error('No data found to recover');
      }
    } catch (error) {
      console.error('Error recovering data:', error);
      toast.error('Failed to recover data');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleForceSync = async () => {
    if (!currentUser) return;
    
    try {
      setIsSyncing(true);
      const syncedProgress = await DataRecoveryService.forceSyncFromFirebase(currentUser.uid);
      
      if (syncedProgress) {
        toast.success('Data synced from Firebase!');
        await refreshProgress();
      } else {
        toast.error('No data found in Firebase');
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  // Only show if there is a higher local backup than current (potential data loss)
  if (!userProgress) return null;
  const localBackup = DataRecoveryService.getLocalBackup(currentUser?.uid || '');
  const shouldShow = localBackup && DataRecoveryService.hasPotentialLoss(userProgress, localBackup);
  if (!shouldShow) return null;

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Data Recovery
        </CardTitle>
        <CardDescription className="text-orange-700">
          Your progress seems low. Try recovering your data if you've lost progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-orange-700">
          Current XP: {userProgress.xp} | Level: {userProgress.level}
          {localBackup && (
            <span className="ml-2 opacity-80">(Backup XP: {localBackup.xp}, Level: {localBackup.level})</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRecoverData}
            disabled={isRecovering || isSyncing}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRecovering ? 'animate-spin' : ''}`} />
            {isRecovering ? 'Recovering...' : 'Recover Data'}
          </Button>
          <Button
            onClick={handleForceSync}
            disabled={isRecovering || isSyncing}
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <Database className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-pulse' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Force Sync'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
