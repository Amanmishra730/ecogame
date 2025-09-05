import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { QuizInterface } from "@/components/QuizInterface";
import { GameSelector } from "@/components/GameSelector";
import { WasteSortingGame } from "../components/WasteSortingGame";
import { WaterSimulator } from "@/components/WaterSimulator";
import { Leaderboard } from "@/components/Leaderboard";
import { Profile } from "@/components/Profile";
import { GamingBackground } from "@/components/GamingBackground";
import { toast } from "sonner";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [userStats, setUserStats] = useState({
    xp: 1890,
    level: 18,
    badges: 4,
    completedQuizzes: 12,
    gamesPlayed: 8,
    streak: 3,
  });

  const handleQuizComplete = (score: number) => {
    const xpGained = score * 20;
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + xpGained,
      completedQuizzes: prev.completedQuizzes + 1,
      level: Math.floor((prev.xp + xpGained) / 100) + 1,
    }));
    
    toast.success(`Quiz completed! +${xpGained} XP earned!`);
    setCurrentView("dashboard");
  };

  const handleGameComplete = (score: number) => {
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + score,
      gamesPlayed: prev.gamesPlayed + 1,
      level: Math.floor((prev.xp + score) / 100) + 1,
    }));
    
    toast.success(`Game completed! +${score} XP earned!`);
    setCurrentView("games");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "quiz":
        return <QuizInterface onComplete={handleQuizComplete} />;
      case "games":
        return (
          <GameSelector 
            onSelectGame={(gameType) => setCurrentView(gameType)}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "waste-sorting":
        return <WasteSortingGame onComplete={handleGameComplete} />;
      case "water-simulator":
        return <WaterSimulator onComplete={handleGameComplete} />;
      case "leaderboard":
        return <Leaderboard />;
      case "profile":
        return <Profile userStats={userStats} />;
      default:
        return (
          <Dashboard
            onStartQuiz={() => setCurrentView("quiz")}
            onStartGame={() => setCurrentView("games")}
            userStats={userStats}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-light/40 to-white relative">
      <GamingBackground />
      <div className="container mx-auto p-4 relative z-20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            <Navigation 
              currentView={currentView}
              onViewChange={setCurrentView}
              userStats={userStats}
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
