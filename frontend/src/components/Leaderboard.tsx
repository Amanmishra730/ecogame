import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Loader2 } from "lucide-react";
import { LeaderboardService, LeaderboardEntry, LeaderboardStats } from "@/lib/leaderboardService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/contexts/UserProgressContext";

export const Leaderboard = () => {
  const { currentUser } = useAuth();
  const { userProgress } = useUserProgress();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load leaderboard data
        const leaderboardData = await LeaderboardService.getLeaderboard(50);
        setLeaderboard(leaderboardData);
        
        // Load user stats
        const userStats = await LeaderboardService.getLeaderboardStats(currentUser.uid);
        setStats(userStats);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();

    // Subscribe to real-time updates
    const unsubscribe = LeaderboardService.subscribeToLeaderboard((updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
    }, 50);

    return () => unsubscribe();
  }, [currentUser]);

  const getCurrentUserEntry = (): LeaderboardEntry | null => {
    if (!currentUser || !userProgress) return null;
    
    return {
      userId: currentUser.uid,
      displayName: userProgress.displayName || currentUser.displayName || 'You',
      xp: userProgress.xp,
      level: userProgress.level,
      badges: userProgress.badges,
      streak: userProgress.streak,
      avatar: LeaderboardService.generateAvatar(userProgress.displayName || currentUser.displayName || 'You'),
      lastActiveDate: userProgress.lastActiveDate,
      rank: stats?.currentRank || 0
    };
  };

  const isCurrentUser = (entry: LeaderboardEntry): boolean => {
    return entry.userId === currentUser?.uid;
  };
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-accent" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-warning" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</div>;
    }
  };

  const getChangeColor = (change: string) => {
    if (change.startsWith("+")) return "text-success";
    if (change.startsWith("-")) return "text-destructive";
    return "text-muted-foreground";
  };

  const getPositionBg = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-primary/10 border-primary/30";
    if (position <= 3) return "bg-gradient-achievement/10";
    return "";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-eco border-0 text-primary-foreground shadow-eco">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8" />
              Global Leaderboard
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              See how you rank among eco-learners worldwide!
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-eco border-0 text-primary-foreground shadow-eco">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8" />
              Global Leaderboard
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              See how you rank among eco-learners worldwide!
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white/60">
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Error loading leaderboard: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUserEntry = getCurrentUserEntry();
  
  // Ensure current user is included in the leaderboard if they're not already there
  let displayLeaderboard = [...leaderboard];
  if (currentUserEntry && !leaderboard.find(entry => entry.userId === currentUser?.uid)) {
    displayLeaderboard.push(currentUserEntry);
  }
  
  // Sort by XP descending
  displayLeaderboard.sort((a, b) => b.xp - a.xp);
  
  // Update ranks after sorting
  displayLeaderboard = displayLeaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-eco border-0 text-primary-foreground shadow-eco">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8" />
            Global Leaderboard
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            See how you rank among eco-learners worldwide!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {displayLeaderboard.slice(0, 3).map((user, index) => (
          <Card key={user.userId} className={`text-center bg-white/60 ${index === 0 ? 'transform scale-105' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-3">
                {getRankIcon(index + 1)}
              </div>
              <Avatar className="mx-auto mb-3 h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-sm mb-1">{user.displayName}</h3>
              <p className="text-2xl font-bold text-primary mb-1">{user.xp}</p>
              <p className="text-xs text-muted-foreground">XP</p>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  L{user.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {user.badges} 🏆
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card className="bg-white/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {displayLeaderboard.map((user, index) => {
              const position = index + 1;
              const isCurrentUserEntry = isCurrentUser(user);
              
              return (
                <div
                  key={user.userId}
                  className={`flex items-center justify-between p-4 border-l-4 transition-colors ${
                    getPositionBg(position, isCurrentUserEntry)
                  } ${isCurrentUserEntry ? 'border-l-primary' : 'border-l-transparent'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(position)}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback 
                          className={`font-bold ${
                            isCurrentUserEntry ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                          }`}
                        >
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isCurrentUserEntry ? 'text-primary font-bold' : ''}`}>
                        {user.displayName}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>Level {user.level}</span>
                        <span>{user.badges} badges</span>
                        <span>{user.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className={`font-bold ${isCurrentUserEntry ? 'text-primary' : ''}`}>
                        {user.xp} XP
                      </div>
                      {user.change && (
                        <div className={`text-sm ${getChangeColor(user.change)}`}>
                          {user.change !== "=" && (
                            <span>{user.change}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      {stats && (
        <Card className="bg-white/60">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.currentRank}</div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.weeklyChange}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">{stats.xpToNextRank}</div>
                <div className="text-sm text-muted-foreground">To Next Rank</div>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-warning">{userProgress?.streak || 0}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <strong>Debug Info:</strong> {leaderboard.length} users loaded from Firebase
              {currentUserEntry && (
                <span> | Current user: {currentUserEntry.displayName} ({currentUserEntry.xp} XP)</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};