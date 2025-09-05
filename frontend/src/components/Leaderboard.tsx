import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

// Mock leaderboard data
const leaderboardData = [
  { 
    id: 1, 
    name: "Alex Green", 
    xp: 2850, 
    level: 28, 
    badges: 12, 
    streak: 15,
    avatar: "AG",
    change: "+2"
  },
  { 
    id: 2, 
    name: "Maya Chen", 
    xp: 2720, 
    level: 27, 
    badges: 11, 
    streak: 12,
    avatar: "MC",
    change: "-1"
  },
  { 
    id: 3, 
    name: "Jamie Wilson", 
    xp: 2680, 
    level: 26, 
    badges: 10, 
    streak: 18,
    avatar: "JW",
    change: "+1"
  },
  { 
    id: 4, 
    name: "Sam Rodriguez", 
    xp: 2540, 
    level: 25, 
    badges: 9, 
    streak: 8,
    avatar: "SR",
    change: "="
  },
  { 
    id: 5, 
    name: "Taylor Kim", 
    xp: 2480, 
    level: 24, 
    badges: 8, 
    streak: 22,
    avatar: "TK",
    change: "+3"
  },
  { 
    id: 6, 
    name: "Jordan Lee", 
    xp: 2340, 
    level: 23, 
    badges: 8, 
    streak: 5,
    avatar: "JL",
    change: "-2"
  },
  { 
    id: 7, 
    name: "Casey Park", 
    xp: 2280, 
    level: 22, 
    badges: 7, 
    streak: 9,
    avatar: "CP",
    change: "+1"
  },
  { 
    id: 8, 
    name: "Riley Davis", 
    xp: 2150, 
    level: 21, 
    badges: 6, 
    streak: 14,
    avatar: "RD",
    change: "-1"
  },
  { 
    id: 9, 
    name: "Morgan Smith", 
    xp: 2020, 
    level: 20, 
    badges: 5, 
    streak: 7,
    avatar: "MS",
    change: "+2"
  },
  { 
    id: 10, 
    name: "You", 
    xp: 1890, 
    level: 18, 
    badges: 4, 
    streak: 3,
    avatar: "YO",
    change: "+1"
  }
];

export const Leaderboard = () => {
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
        {leaderboardData.slice(0, 3).map((user, index) => (
          <Card key={user.id} className={`text-center bg-white/60 ${index === 0 ? 'transform scale-105' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-3">
                {getRankIcon(index + 1)}
              </div>
              <Avatar className="mx-auto mb-3 h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-sm mb-1">{user.name}</h3>
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
            {leaderboardData.map((user, index) => {
              const position = index + 1;
              const isCurrentUser = user.name === "You";
              
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 border-l-4 transition-colors ${
                    getPositionBg(position, isCurrentUser)
                  } ${isCurrentUser ? 'border-l-primary' : 'border-l-transparent'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(position)}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback 
                          className={`font-bold ${
                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                          }`}
                        >
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isCurrentUser ? 'text-primary font-bold' : ''}`}>
                        {user.name}
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
                      <div className={`font-bold ${isCurrentUser ? 'text-primary' : ''}`}>
                        {user.xp} XP
                      </div>
                      <div className={`text-sm ${getChangeColor(user.change)}`}>
                        {user.change !== "=" && (
                          <span>{user.change}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="bg-white/60">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">10th</div>
              <div className="text-sm text-muted-foreground">Current Rank</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-success">+1</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-accent">960</div>
              <div className="text-sm text-muted-foreground">To Next Rank</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-warning">3</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};