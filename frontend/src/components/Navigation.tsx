import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Brain, 
  Gamepad2, 
  Trophy, 
  User,
  Leaf,
  Award
} from "lucide-react";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userStats: {
    xp: number;
    level: number;
    badges: number;
  };
}

export const Navigation = ({ currentView, onViewChange, userStats }: NavigationProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "quiz", label: "Quiz", icon: Brain },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <Card className="w-full lg:w-64 lg:h-fit p-4 bg-gradient-eco border-0 text-primary-foreground shadow-eco">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/20 rounded-lg">
          <Leaf className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">EcoLearn</h1>
          <p className="text-sm opacity-90">Level {userStats.level}</p>
        </div>
      </div>

      <div className="mb-6 p-3 bg-white/10 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4" />
          <span className="text-sm font-medium">{userStats.xp} XP</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(userStats.xp % 100)}%` }}
          />
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 transition-smooth ${
                isActive 
                  ? "bg-white text-primary shadow-lg" 
                  : "text-white hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </Card>
  );
};