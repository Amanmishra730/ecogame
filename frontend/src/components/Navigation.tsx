import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { 
  Home, 
  Brain, 
  Gamepad2, 
  Trophy, 
  User,
  Leaf,
  Award,
  LogOut
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
  const { logout, currentUser } = useAuth();
  const { t, locale, setLocale } = useI18n();
  
  const navItems = [
    { id: "dashboard", label: t("nav.dashboard"), icon: Home },
    { id: "quiz", label: t("nav.quiz"), icon: Brain },
    { id: "games", label: t("nav.games"), icon: Gamepad2 },
    { id: "leaderboard", label: t("nav.leaderboard"), icon: Trophy },
    { id: "profile", label: t("nav.profile"), icon: User },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <Card className="w-full lg:w-64 lg:h-fit p-4 bg-gradient-eco border-0 text-primary-foreground shadow-eco">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/20 rounded-lg">
          <Leaf className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-lg">{t("app.name")}</h1>
          <p className="text-sm opacity-90">{t("nav.level")} {userStats.level}</p>
          {currentUser && (
            <p className="text-xs opacity-75">
              {currentUser.displayName || currentUser.email || 'User'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Language"
            className="bg-white/10 text-white text-xs rounded px-2 py-1 outline-none"
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
          >
            <option value="en">English</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>
        </div>
      </div>

      <div className="mb-6 p-3 bg-white/10 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4" />
          <span className="text-sm font-medium">{userStats.xp} {t("nav.xp")}</span>
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
          // For quiz, also highlight when in quiz-categories view
          const isActive = currentView === item.id || (item.id === "quiz" && currentView === "quiz-categories");
          
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
        <a
          href="/admin"
          className="block w-full"
        >
          <Button
            variant={"ghost"}
            className="w-full justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
          >
            {/* simple gear icon substitute using Trophy to avoid new import */}
            <Trophy className="h-4 w-4" />
            Admin
          </Button>
        </a>
        <Button
          variant={"ghost"}
          className="w-full justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </Button>
      </nav>
    </Card>
  );
};