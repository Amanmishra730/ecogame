import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { QuizInterface } from "@/components/QuizInterface";
import { QuizCategorySelector } from "@/components/QuizCategorySelector";
import { GameSelector } from "@/components/GameSelector";
import { WasteSortingGame } from "../components/WasteSortingGame";
import { WaterSimulator } from "@/components/WaterSimulator";
import SaveTheAnimalsGame from "@/components/SaveTheAnimalsGame";
import TreeHeroGame from "@/components/TreeHeroGame";
import ClimateTimeTravelerGame from "@/components/ClimateTimeTravelerGame";
import ForestMatchGame from "@/components/ForestMatchGame";
import { Leaderboard } from "@/components/Leaderboard";
import { Profile } from "@/components/Profile";
import { GamingBackground } from "@/components/GamingBackground";
import { toast } from "sonner";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string>("general");
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
      case "quiz-categories":
        return (
          <QuizCategorySelector 
            onSelectCategory={(category) => {
              setSelectedQuizCategory(category);
              setCurrentView("quiz");
            }}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "quiz":
        return <QuizInterface onComplete={handleQuizComplete} category={selectedQuizCategory} />;
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
      case "save-animals":
        return <SaveTheAnimalsGame onComplete={handleGameComplete} />;
      case "tree-hero":
        return <TreeHeroGame onComplete={handleGameComplete} />;
      case "climate-time-traveler":
        return <ClimateTimeTravelerGame onComplete={handleGameComplete} />;
      case "forest-match":
        return <ForestMatchGame onComplete={handleGameComplete} />;
      case "leaderboard":
        return <Leaderboard />;
      case "profile":
        return <Profile userStats={userStats} />;
      default:
        return (
          <Dashboard
            onStartQuiz={() => setCurrentView("quiz-categories")}
            onStartGame={() => setCurrentView("games")}
            userStats={userStats}
          />
        );
    }
  };

  const handleViewChange = (view: string) => {
    if (view === "quiz") {
      // When clicking Quiz in navigation, show category selector first
      setCurrentView("quiz-categories");
    } else {
      setCurrentView(view);
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
          onViewChange={handleViewChange}
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
