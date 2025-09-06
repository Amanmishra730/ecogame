import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SeedDataService } from '@/lib/seedData';
import { toast } from 'sonner';
import { Database, Trash2, Users } from 'lucide-react';

export const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [userCount, setUserCount] = useState(0);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await SeedDataService.seedSampleUsers();
      toast.success('Sample users created successfully!');
      await updateUserCount();
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to create sample users');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    try {
      setIsClearing(true);
      await SeedDataService.clearSampleUsers();
      toast.success('Sample users cleared successfully!');
      await updateUserCount();
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear sample users');
    } finally {
      setIsClearing(false);
    }
  };

  const updateUserCount = async () => {
    try {
      const count = await SeedDataService.getSampleUsersCount();
      setUserCount(count);
    } catch (error) {
      console.error('Error getting user count:', error);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Development Tools
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Seed sample data for testing the leaderboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-yellow-700">
          <Users className="h-4 w-4" />
          <span>Users in database: {userCount}</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSeedData}
            disabled={isSeeding || isClearing}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isSeeding ? 'Creating...' : 'Seed Sample Users'}
          </Button>
          <Button
            onClick={handleClearData}
            disabled={isSeeding || isClearing}
            size="sm"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isClearing ? 'Clearing...' : 'Clear Sample Users'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
