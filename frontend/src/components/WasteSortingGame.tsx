import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

interface WasteItem {
  id: string;
  name: string;
  emoji: string;
  category: 'recyclable' | 'organic' | 'general';
}

const wasteItems: WasteItem[] = [
  { id: '1', name: 'Plastic Bottle', emoji: '🍶', category: 'recyclable' },
  { id: '2', name: 'Apple Core', emoji: '🍎', category: 'organic' },
  { id: '3', name: 'Newspaper', emoji: '📰', category: 'recyclable' },
  { id: '4', name: 'Banana Peel', emoji: '🍌', category: 'organic' },
  { id: '5', name: 'Candy Wrapper', emoji: '🍬', category: 'general' },
  { id: '6', name: 'Glass Jar', emoji: '🫙', category: 'recyclable' },
  { id: '7', name: 'Food Scraps', emoji: '🥬', category: 'organic' },
  { id: '8', name: 'Tissue Paper', emoji: '🧻', category: 'general' },
  { id: '9', name: 'Aluminum Can', emoji: '🥫', category: 'recyclable' },
  { id: '10', name: 'Coffee Grounds', emoji: '☕', category: 'organic' },
];

interface WasteSortingGameProps {
  onComplete: (score: number) => void;
}

export const WasteSortingGame = ({ onComplete }: WasteSortingGameProps) => {
  const [currentItems, setCurrentItems] = useState(wasteItems.slice(0, 5));
  const [draggedItem, setDraggedItem] = useState<WasteItem | null>(null);
  const [score, setScore] = useState(0);
  const [sortedItems, setSortedItems] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [bins] = useState([
    { id: 'recyclable', name: 'Recycling', emoji: '♻️', color: 'bg-eco-bright' },
    { id: 'organic', name: 'Compost', emoji: '🌱', color: 'bg-eco-primary' },
    { id: 'general', name: 'General Waste', emoji: '🗑️', color: 'bg-muted' }
  ]);

  const dragRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleDragStart = (item: WasteItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (binCategory: string) => {
    if (!draggedItem) return;

    const isCorrect = draggedItem.category === binCategory;
    const newSortedItems = [...sortedItems, draggedItem.id];
    setSortedItems(newSortedItems);

    if (isCorrect) {
      setScore(score + 10);
      toast.success(`Correct! +10 XP`, {
        description: `${draggedItem.name} goes in ${bins.find(b => b.id === binCategory)?.name}!`
      });
    } else {
      toast.error(`Not quite right!`, {
        description: `${draggedItem.name} should go in ${bins.find(b => b.id === draggedItem.category)?.name}`
      });
    }

    // Remove the item from current items
    setCurrentItems(prev => prev.filter(item => item.id !== draggedItem.id));
    setDraggedItem(null);

    // Check if game is complete
    if (newSortedItems.length >= 5) {
      setTimeout(() => {
        setGameComplete(true);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setCurrentItems(wasteItems.slice(0, 5));
    setScore(0);
    setSortedItems([]);
    setGameComplete(false);
    setDraggedItem(null);
  };

  const progress = (sortedItems.length / 5) * 100;

  if (gameComplete) {
    const percentage = (score / 50) * 100;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-success">Game Complete! ♻️</CardTitle>
          <CardDescription>
            You sorted {sortedItems.length} items
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-accent">{score} XP</div>
          <div className="space-y-2">
            <Badge 
              variant="secondary"
              className={`text-lg px-4 py-2 ${
                percentage >= 80 ? 'bg-success/10 text-success' :
                percentage >= 60 ? 'bg-accent/10 text-accent' :
                'bg-warning/10 text-warning'
              }`}
            >
              {percentage >= 80 ? 'Waste Warrior!' : 
               percentage >= 60 ? 'Good Sorter!' : 
               'Keep Practicing!'}
            </Badge>
            <p className="text-muted-foreground">
              Accuracy: {percentage.toFixed(0)}%
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            <Button onClick={() => onComplete(score)}>
              <Trophy className="mr-2 h-4 w-4" />
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Waste Sorting Challenge</CardTitle>
            <CardDescription>Drag items to the correct bins!</CardDescription>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent">
            {score} XP
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Waste Items to Sort */}
        <div>
          <h3 className="font-medium mb-3">Items to Sort:</h3>
          <div className="flex flex-wrap gap-3 min-h-[80px] p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            {currentItems.map((item) => (
              <div
                key={item.id}
                ref={(el) => { dragRefs.current[item.id] = el; }}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="cursor-grab active:cursor-grabbing p-3 bg-card border rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="text-2xl mb-1 text-center">{item.emoji}</div>
                <div className="text-sm text-center font-medium">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sorting Bins */}
        <div>
          <h3 className="font-medium mb-3">Sort into bins:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bins.map((bin) => (
              <div
                key={bin.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(bin.id)}
                className={`p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors min-h-[120px] flex flex-col items-center justify-center ${bin.color}/10`}
              >
                <div className="text-3xl mb-2">{bin.emoji}</div>
                <div className="font-medium text-center">{bin.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Drop items here
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleRestart} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};