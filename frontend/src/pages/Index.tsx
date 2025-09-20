import React, { useState } from "react";
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
import { useUserProgress } from "@/contexts/UserProgressContext";
import { toast } from "sonner";
import { WelcomeBurst } from "@/components/WelcomeBurst";
import QRScanner from "@/components/QRScanner";
import ARTreeScanner from "@/components/ARTreeScanner";
import WhatsAppShareCard from "@/components/WhatsAppShareCard";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [showWelcome, setShowWelcome] = useState<string | null>(null);
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string>("general");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showARScanner, setShowARScanner] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareAchievement, setShareAchievement] = useState<any>(null);
  const { userProgress, completeQuiz, completeGame, updateStreak, loading: progressLoading } = useUserProgress();

  // Convert userProgress to userStats format for compatibility
  const userStats = userProgress ? {
    xp: userProgress.xp,
    level: userProgress.level,
    badges: userProgress.badges,
    completedQuizzes: userProgress.completedQuizzes,
    gamesPlayed: userProgress.gamesPlayed,
    streak: userProgress.streak,
  } : {
    xp: 0,
    level: 1,
    badges: 0,
    completedQuizzes: 0,
    gamesPlayed: 0,
    streak: 0,
  };

  const handleQuizComplete = async (score: number) => {
    const xpGained = score * 20;
    
    // Update UI immediately for better responsiveness
    toast.success(`Quiz completed! +${xpGained} XP earned!`);
    setCurrentView("dashboard");
    
    // Handle async operations in the background
    try {
      await completeQuiz(score);
    } catch (error) {
      console.error('Error completing quiz:', error);
      // Show error toast but don't block the UI
      toast.error('Failed to save quiz progress');
    }
  };

  const handleGameComplete = async (score: number) => {
    // Update UI immediately for better responsiveness
    toast.success(`Game completed! +${score} XP earned!`);
    setCurrentView("games");
    
    // Handle async operations in the background
    try {
      await completeGame(score);
      
      // Show share card for significant achievements
      if (score >= 100) {
        setShareAchievement({
          id: `game_${Date.now()}`,
          title: "High Score Achievement!",
          description: `You scored ${score} points!`,
          points: score,
          category: "gaming",
          timestamp: new Date().toISOString()
        });
        setShowShareCard(true);
      }
    } catch (error) {
      console.error('Error completing game:', error);
      // Show error toast but don't block the UI
      toast.error('Failed to save game progress');
    }
  };

  const handleQRCheckInSuccess = (result: any) => {
    toast.success(`Check-in successful! +${result.points} points earned!`);
    setShowQRScanner(false);
  };

  const handleShareAchievement = (achievement: any) => {
    setShareAchievement(achievement);
    setShowShareCard(true);
  };
  // Update streak when component mounts
  React.useEffect(() => {
    if (userProgress) {
      updateStreak();
    }
  }, [userProgress, updateStreak]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "quiz-categories":
        return (
          <QuizCategorySelector 
            onSelectCategory={(category) => {
              setSelectedQuizCategory(category);
              setCurrentView("quiz");
              setShowWelcome("Welcome to the Quiz!");
            }}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "quiz":
        return <QuizInterface onComplete={handleQuizComplete} category={selectedQuizCategory} />;
      case "games":
        return (
          <GameSelector 
            onSelectGame={(gameType) => {
              setCurrentView(gameType);
              setShowWelcome("Welcome to the Game!");
            }}
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
      case "qr-scanner":
        return (
          <QRScanner 
            onClose={() => setCurrentView("dashboard")}
            onCheckInSuccess={handleQRCheckInSuccess}
          />
        );
      case "ar-scanner":
        return (
          <ARTreeScanner 
            onClose={() => setCurrentView("dashboard")}
          />
        );
      default:
        return (
          <Dashboard
            onStartQuiz={() => setCurrentView("quiz-categories")}
            onStartGame={() => setCurrentView("games")}
            onQRScan={() => setCurrentView("qr-scanner")}
            onARScan={() => setCurrentView("ar-scanner")}
            onShareAchievement={handleShareAchievement}
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

  // Show loading state while user progress is being loaded
  if (progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-eco-light/40 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-light/40 to-white relative">
      <GamingBackground />
      {showWelcome && (
        <WelcomeBurst message={showWelcome} onDone={() => setShowWelcome(null)} />
      )}
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <QRScanner 
            onClose={() => setShowQRScanner(false)}
            onCheckInSuccess={handleQRCheckInSuccess}
          />
        </div>
      )}

      {/* AR Scanner Modal */}
      {showARScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ARTreeScanner 
            onClose={() => setShowARScanner(false)}
          />
        </div>
      )}

      {/* WhatsApp Share Card Modal */}
      {showShareCard && shareAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <WhatsAppShareCard 
            achievement={shareAchievement}
            onClose={() => {
              setShowShareCard(false);
              setShareAchievement(null);
            }}
          />
        </div>
      )}
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
