import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DataRecoveryButton } from "@/components/DataRecoveryButton";
import { 
  Trophy, 
  Target, 
  Zap, 
  Star,
  TrendingUp,
  Award,
  Gamepad2,
  Brain
} from "lucide-react";

interface DashboardProps {
  onStartQuiz: () => void;
  onStartGame: () => void;
  userStats: {
    xp: number;
    level: number;
    badges: number;
    completedQuizzes: number;
    gamesPlayed: number;
    streak: number;
  };
}

export const Dashboard = ({ onStartQuiz, onStartGame, userStats }: DashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="relative overflow-hidden border-0 bg-transparent shadow-none">
        <div className="relative">
          <CardHeader className="pb-4 text-white">
            <div className="flex items-center justify-start">
              <div>
                <CardTitle className="text-2xl font-bold">Welcome Back, Student!</CardTitle>
                <CardDescription className="text-white/80 mt-2">
                  Ready to save the planet? Let's continue your eco-learning journey!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={onStartQuiz}
                size="lg"
                variant="secondary"
                className="bg-[hsl(45,63%,59%)] text-primary hover:bg-[hsl(45,46%,51%)] shadow-lg h-16"
              >
                <Brain className="mr-3 h-5 w-5" />
                Take Eco Quiz
              </Button>
              <Button 
                onClick={onStartGame}
                size="lg"
                variant="secondary" 
                className="bg-[hsl(45_63%_59%)] text-primary hover:bg-[hsl(45_46%_51%)] shadow-lg h-16"
              >
                <Gamepad2 className="mr-3 h-5 w-5" />
                Play Games
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-success/20 bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Level {userStats.level}</div>
            <Progress 
              value={(userStats.xp % 100)} 
              className="mt-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {100 - (userStats.xp % 100)} XP to next level
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{userStats.badges}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Badges earned
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-white/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userStats.streak} days</div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your Eco Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Quizzes Completed</p>
                <p className="text-sm text-muted-foreground">Environmental knowledge</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success">
                {userStats.completedQuizzes}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Games Played</p>
                <p className="text-sm text-muted-foreground">Learning through fun</p>
              </div>
              <Badge variant="outline" className="bg-accent/10 text-accent">
                {userStats.gamesPlayed}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Recovery */}
      <DataRecoveryButton />
    </div>
  );
};