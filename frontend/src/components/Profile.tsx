import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Award, 
  Target, 
  Calendar, 
  Leaf,
  Zap,
  Star,
  TrendingUp
} from "lucide-react";

interface ProfileProps {
  userStats: {
    xp: number;
    level: number;
    badges: number;
    completedQuizzes: number;
    gamesPlayed: number;
    streak: number;
  };
}

const achievements = [
  { 
    id: 'first-quiz', 
    name: 'First Steps', 
    description: 'Complete your first quiz', 
    icon: '🌱', 
    earned: true,
    date: '2024-01-15'
  },
  { 
    id: 'streak-7', 
    name: 'Week Warrior', 
    description: '7-day learning streak', 
    icon: '🔥', 
    earned: false,
    date: null
  },
  { 
    id: 'quiz-master', 
    name: 'Quiz Master', 
    description: 'Score 100% on 5 quizzes', 
    icon: '🧠', 
    earned: true,
    date: '2024-01-20'
  },
  { 
    id: 'waste-expert', 
    name: 'Sorting Expert', 
    description: 'Perfect score in waste sorting', 
    icon: '♻️', 
    earned: true,
    date: '2024-01-18'
  },
  { 
    id: 'water-saver', 
    name: 'Water Guardian', 
    description: 'Excellent water conservation', 
    icon: '💧', 
    earned: false,
    date: null
  },
  { 
    id: 'eco-champion', 
    name: 'Eco Champion', 
    description: 'Reach level 25', 
    icon: '🏆', 
    earned: false,
    date: null
  }
];

export const Profile = ({ userStats }: ProfileProps) => {
  const nextLevelXP = (userStats.level + 1) * 100;
  const currentLevelXP = userStats.level * 100;
  const progressToNextLevel = ((userStats.xp - currentLevelXP) / 100) * 100;
  
  const earnedAchievements = achievements.filter(a => a.earned);
  const upcomingAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-eco border-0 text-primary-foreground shadow-eco">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarFallback className="bg-white text-primary text-2xl font-bold">
                YO
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-1">
                Eco-learning journey progress
              </CardDescription>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-white/20 text-white border-white/30">
                  Level {userStats.level}
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4" />
                  {userStats.xp} XP
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4" />
                  {userStats.badges} Badges
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Level {userStats.level}</div>
            <Progress value={progressToNextLevel} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(100 - progressToNextLevel)} XP to Level {userStats.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{userStats.completedQuizzes}</div>
            <p className="text-xs text-muted-foreground">Quizzes completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{userStats.gamesPlayed}</div>
            <p className="text-xs text-muted-foreground">Interactive games</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{userStats.streak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned Achievements */}
        <Card className="bg-white/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Earned Achievements
            </CardTitle>
            <CardDescription>
              Your eco-learning milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnedAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-gradient-achievement/10 rounded-lg border border-accent/20"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.date && (
                      <p className="text-xs text-accent mt-1">
                        Earned on {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    ✓
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Achievements */}
        <Card className="bg-white/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground" />
              Upcoming Achievements
            </CardTitle>
            <CardDescription>
              Goals to work towards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted"
                >
                  <div className="text-2xl opacity-50">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-muted-foreground">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    Locked
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Activity */}
      <Card className="bg-white/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-eco-bright" />
            Learning Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-eco-light/20 rounded-lg">
              <div className="text-2xl font-bold text-eco-primary mb-1">
                {Math.round((userStats.completedQuizzes / (userStats.completedQuizzes + userStats.gamesPlayed || 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Quiz Preference</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-2xl font-bold text-accent mb-1">
                {userStats.xp > 0 ? Math.round(userStats.xp / 7) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg XP/Day</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success mb-1">
                {userStats.completedQuizzes + userStats.gamesPlayed}
              </div>
              <div className="text-sm text-muted-foreground">Total Activities</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};