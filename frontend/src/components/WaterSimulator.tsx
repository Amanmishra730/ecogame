import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Droplets, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Activity {
  id: string;
  name: string;
  emoji: string;
  baseUsage: number; // liters per use
  description: string;
}

const activities: Activity[] = [
  { id: 'shower', name: 'Shower', emoji: '🚿', baseUsage: 60, description: 'Minutes in shower' },
  { id: 'teeth', name: 'Brush Teeth', emoji: '🦷', baseUsage: 15, description: 'Tap running while brushing' },
  { id: 'dishes', name: 'Wash Dishes', emoji: '🍽️', baseUsage: 25, description: 'Hand washing dishes' },
  { id: 'laundry', name: 'Laundry', emoji: '👕', baseUsage: 80, description: 'Full load of laundry' },
  { id: 'garden', name: 'Water Garden', emoji: '🌱', baseUsage: 40, description: 'Minutes watering plants' },
];

interface WaterSimulatorProps {
  onComplete: (score: number) => void;
}

export const WaterSimulator = ({ onComplete }: WaterSimulatorProps) => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [userChoices, setUserChoices] = useState<{ [key: string]: number }>({});
  const [gameComplete, setGameComplete] = useState(false);
  const [totalWaterUsed, setTotalWaterUsed] = useState(0);
  const [ecoScore, setEcoScore] = useState(0);

  const activity = activities[currentActivity];
  const currentValue = userChoices[activity.id] || 1;

  const calculateWaterUsage = () => {
    return Object.entries(userChoices).reduce((total, [activityId, value]) => {
      const act = activities.find(a => a.id === activityId);
      if (!act) return total;
      return total + (act.baseUsage * value);
    }, 0);
  };

  const calculateEcoScore = () => {
    const maxPossibleUsage = activities.reduce((sum, act) => sum + (act.baseUsage * 5), 0);
    const actualUsage = calculateWaterUsage();
    const efficiency = Math.max(0, (maxPossibleUsage - actualUsage) / maxPossibleUsage);
    return Math.round(efficiency * 100);
  };

  const handleSliderChange = (value: number[]) => {
    setUserChoices(prev => ({
      ...prev,
      [activity.id]: value[0]
    }));
  };

  const handleNext = () => {
    if (currentActivity < activities.length - 1) {
      setCurrentActivity(currentActivity + 1);
    } else {
      // Calculate final results
      const finalWaterUsage = calculateWaterUsage();
      const finalEcoScore = calculateEcoScore();
      
      setTotalWaterUsed(finalWaterUsage);
      setEcoScore(finalEcoScore);
      setGameComplete(true);

      // Show appropriate feedback
      if (finalEcoScore >= 80) {
        toast.success("Excellent water conservation! +50 XP");
      } else if (finalEcoScore >= 60) {
        toast.success("Good water management! +30 XP");
      } else {
        toast("Room for improvement! +15 XP");
      }
    }
  };

  const handleRestart = () => {
    setCurrentActivity(0);
    setUserChoices({});
    setGameComplete(false);
    setTotalWaterUsed(0);
    setEcoScore(0);
  };

  const progress = ((currentActivity + 1) / activities.length) * 100;
  const currentUsage = activity.baseUsage * currentValue;

  if (gameComplete) {
    const xpEarned = ecoScore >= 80 ? 50 : ecoScore >= 60 ? 30 : 15;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Water Usage Report 💧</CardTitle>
          <CardDescription>
            Your daily water conservation results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{totalWaterUsed}L</div>
            <p className="text-muted-foreground">Total water used per day</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-water/10 rounded-lg">
              <span className="font-medium">Conservation Score</span>
              <Badge 
                variant="secondary"
                className={`${
                  ecoScore >= 80 ? 'bg-success/10 text-success' :
                  ecoScore >= 60 ? 'bg-accent/10 text-accent' :
                  'bg-warning/10 text-warning'
                }`}
              >
                {ecoScore}%
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Your Choices:</h4>
              {activities.map((act) => (
                <div key={act.id} className="flex justify-between text-sm p-2 bg-secondary/30 rounded">
                  <span>{act.emoji} {act.name}</span>
                  <span>{(userChoices[act.id] || 1) * act.baseUsage}L</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-eco-light/20 rounded-lg">
              <p className="text-sm text-center">
                {ecoScore >= 80 ? 
                  "🌟 Outstanding! You're a water conservation champion!" :
                  ecoScore >= 60 ?
                  "👍 Well done! Your water habits are helping the planet." :
                  "💡 You can save more water with small changes to your daily routine."
                }
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-accent">+{xpEarned} XP</div>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Different Choices
              </Button>
              <Button onClick={() => onComplete(xpEarned)}>
                <Trophy className="mr-2 h-4 w-4" />
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Water Conservation Simulator</CardTitle>
            <CardDescription>Make eco-friendly choices for your daily routine</CardDescription>
          </div>
          <Badge variant="outline">
            {currentActivity + 1} / {activities.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">{activity.emoji}</div>
          <h3 className="text-xl font-bold mb-2">{activity.name}</h3>
          <p className="text-muted-foreground">{activity.description}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Usage Level:</span>
            <Badge variant="outline" className="bg-gradient-water/10">
              <Droplets className="mr-1 h-3 w-3" />
              {currentUsage}L
            </Badge>
          </div>

          <div className="px-4">
            <Slider
              value={[currentValue]}
              onValueChange={handleSliderChange}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Minimal</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>

          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-primary" />
              <span className="font-medium">Water Impact</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentUsage < activity.baseUsage * 2 ? 
                "Great choice! You're conserving water effectively." :
                currentUsage < activity.baseUsage * 3 ?
                "Moderate usage. Consider reducing where possible." :
                "High usage. Try to cut back for better conservation."
              }
            </p>
          </div>
        </div>

        <Button onClick={handleNext} className="w-full" size="lg">
          {currentActivity === activities.length - 1 ? 'See Results' : 'Next Activity'}
        </Button>
      </CardContent>
    </Card>
  );
};