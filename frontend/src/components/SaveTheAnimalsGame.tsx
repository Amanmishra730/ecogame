import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Heart, 
  TreePine, 
  Sun, 
  Waves, 
  Mountain, 
  Award,
  CheckCircle,
  XCircle,
  Snowflake,
  GripVertical
} from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  habitat: 'forest' | 'desert' | 'ocean' | 'mountain' | 'arctic';
  image: string;
  endangered: boolean;
  description: string;
}


interface Habitat {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface SaveTheAnimalsGameProps {
  onComplete: (score: number) => void;
}

const habitats: Habitat[] = [
  {
    id: 'forest',
    name: 'Forest',
    icon: <TreePine className="h-8 w-8" />,
    color: 'bg-green-500',
    description: 'Dense woodland with trees and diverse wildlife'
  },
  {
    id: 'desert',
    name: 'Desert',
    icon: <Sun className="h-8 w-8" />,
    color: 'bg-yellow-500',
    description: 'Arid landscape with extreme temperatures'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: <Waves className="h-8 w-8" />,
    color: 'bg-blue-500',
    description: 'Vast marine environment with coral reefs'
  },
  {
    id: 'mountain',
    name: 'Mountain',
    icon: <Mountain className="h-8 w-8" />,
    color: 'bg-gray-500',
    description: 'High altitude rocky terrain'
  },
  {
    id: 'arctic',
    name: 'Arctic',
    icon: <Snowflake className="h-8 w-8" />,
    color: 'bg-blue-200',
    description: 'Cold polar region with ice and snow'
  }
];

const animals: Animal[] = [
  // Forest Animals
  { id: 'elephant', name: 'Asian Elephant', habitat: 'forest', image: '🐘', endangered: true, description: 'Large herbivore threatened by habitat loss' },
  { id: 'tiger', name: 'Bengal Tiger', habitat: 'forest', image: '🐅', endangered: true, description: 'Apex predator facing poaching threats' },
  { id: 'orangutan', name: 'Orangutan', habitat: 'forest', image: '🦧', endangered: true, description: 'Tree-dwelling primate losing habitat' },
  { id: 'panda', name: 'Giant Panda', habitat: 'forest', image: '🐼', endangered: true, description: 'Bamboo-eating bear with limited habitat' },
  
  // Desert Animals
  { id: 'camel', name: 'Bactrian Camel', habitat: 'desert', image: '🐪', endangered: true, description: 'Two-humped camel adapted to desert life' },
  { id: 'fennec', name: 'Fennec Fox', habitat: 'desert', image: '🦊', endangered: false, description: 'Small fox with large ears for desert survival' },
  { id: 'gila', name: 'Gila Monster', habitat: 'desert', image: '🦎', endangered: false, description: 'Venomous lizard native to deserts' },
  
  // Ocean Animals
  { id: 'whale', name: 'Blue Whale', habitat: 'ocean', image: '🐋', endangered: true, description: 'Largest animal on Earth, threatened by pollution' },
  { id: 'turtle', name: 'Sea Turtle', habitat: 'ocean', image: '🐢', endangered: true, description: 'Ancient reptile facing plastic pollution' },
  { id: 'shark', name: 'Great White Shark', habitat: 'ocean', image: '🦈', endangered: true, description: 'Apex predator threatened by overfishing' },
  { id: 'dolphin', name: 'Bottlenose Dolphin', habitat: 'ocean', image: '🐬', endangered: false, description: 'Intelligent marine mammal' },
  
  // Mountain Animals
  { id: 'snow-leopard', name: 'Snow Leopard', habitat: 'mountain', image: '🐆', endangered: true, description: 'Elusive mountain predator' },
  { id: 'mountain-goat', name: 'Mountain Goat', habitat: 'mountain', image: '🐐', endangered: false, description: 'Sure-footed climber of rocky terrain' },
  
  // Arctic Animals
  { id: 'polar-bear', name: 'Polar Bear', habitat: 'arctic', image: '🐻‍❄️', endangered: true, description: 'Arctic predator affected by climate change' },
  { id: 'penguin', name: 'Emperor Penguin', habitat: 'arctic', image: '🐧', endangered: true, description: 'Antarctic bird facing habitat loss' }
];


const SaveTheAnimalsGame: React.FC<SaveTheAnimalsGameProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentAnimals, setCurrentAnimals] = useState<Animal[]>([]);
  const [selectedHabitat, setSelectedHabitat] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<'matching' | 'complete'>('matching');
  const [matchedAnimals, setMatchedAnimals] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [draggedAnimal, setDraggedAnimal] = useState<string | null>(null);
  const [dragOverHabitat, setDragOverHabitat] = useState<string | null>(null);

  // Initialize game
  const initializeGame = useCallback(() => {
    const shuffledAnimals = [...animals].sort(() => Math.random() - 0.5).slice(0, 5);
    setCurrentAnimals(shuffledAnimals);
    setScore(0);
    setLives(3);
    setCurrentLevel(1);
    setGamePhase('matching');
    setMatchedAnimals([]);
    setBadges([]);
    setTimeLeft(60);
    setGameStarted(true);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gamePhase === 'complete') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gamePhase]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, animalId: string) => {
    setDraggedAnimal(animalId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', animalId);
  };

  const handleDragOver = (e: React.DragEvent, habitatId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverHabitat(habitatId);
  };

  const handleDragLeave = () => {
    setDragOverHabitat(null);
  };

  const handleDrop = (e: React.DragEvent, habitatId: string) => {
    e.preventDefault();
    const animalId = draggedAnimal;
    
    if (!animalId) return;

    const animal = currentAnimals.find(a => a.id === animalId);
    if (!animal) return;

    // Check if the animal matches the habitat
    if (animal.habitat === habitatId) {
      const points = animal.endangered ? 50 : 30;
      setScore(prev => prev + points);
      setMatchedAnimals(prev => [...prev, animalId]);
      
      // Remove matched animal
      setCurrentAnimals(prev => prev.filter(a => a.id !== animalId));
      
      // Check for level completion
      if (currentAnimals.length === 1) {
        setGamePhase('complete');
      }
    } else {
      setLives(prev => prev - 1);
    }
    
    setDraggedAnimal(null);
    setDragOverHabitat(null);
  };

  const handleDragEnd = () => {
    setDraggedAnimal(null);
    setDragOverHabitat(null);
  };

  // Check for badge achievement
  const checkBadgeAchievement = () => {
    const endangeredCount = matchedAnimals.filter(animalId => {
      const animal = animals.find(a => a.id === animalId);
      return animal?.endangered;
    }).length;
    
    if (endangeredCount >= 3 && !badges.includes('wildlife-guardian')) {
      setBadges(prev => [...prev, 'wildlife-guardian']);
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    setLives(prev => prev - 1);
    if (lives <= 1) {
      setGamePhase('complete');
    } else {
      // Reset current level
      initializeGame();
    }
  };

  // Handle game completion
  const handleGameComplete = () => {
    checkBadgeAchievement();
    const finalScore = score + (badges.length * 100) + (matchedAnimals.length * 20);
    onComplete(finalScore);
  };

  // Get habitat icon
  const getHabitatIcon = (habitatId: string) => {
    return habitats.find(h => h.id === habitatId)?.icon;
  };

  // Get habitat color
  const getHabitatColor = (habitatId: string) => {
    return habitats.find(h => h.id === habitatId)?.color;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              Save the Animals
            </CardTitle>
            <CardDescription className="text-lg">
              Drag and drop animals to their correct habitats and learn about biodiversity!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Drag and drop animals to their correct habitats</li>
                <li>• Learn about different ecosystems and biodiversity</li>
                <li>• Earn Wildlife Guardian badges for saving endangered species</li>
                <li>• Complete levels to unlock new challenges</li>
              </ul>
            </div>
            <Button onClick={initializeGame} className="w-full" size="lg">
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
              <Award className="h-8 w-8 text-yellow-500" />
              Game Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{score}</div>
                <div className="text-sm text-green-600">Points Earned</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">{matchedAnimals.length}</div>
                <div className="text-sm text-blue-600">Animals Matched</div>
              </div>
            </div>
            
            {badges.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Badges Earned:</h3>
                <div className="flex gap-2">
                  {badges.map(badge => (
                    <Badge key={badge} variant="secondary" className="bg-yellow-200 text-yellow-800">
                      <Award className="h-3 w-3 mr-1" />
                      Wildlife Guardian
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Button onClick={handleGameComplete} className="w-full" size="lg">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Save the Animals
              </h1>
              <p className="text-sm text-gray-600">Level {currentLevel} - Drag and Drop Animals to Habitats</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="font-semibold">Score: {score}</span>
              </div>
              <div className="bg-red-100 px-3 py-1 rounded-full">
                <span className="font-semibold">Lives: {lives}</span>
              </div>
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="font-semibold">Time: {timeLeft}s</span>
              </div>
            </div>
          </div>
          <Progress value={(60 - timeLeft) / 60 * 100} className="mt-4" />
        </div>

        {/* Game Phase: Matching */}
        {gamePhase === 'matching' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Animals Section */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Animals to Save</h2>
                  <p className="text-sm text-gray-600">Drag these animals to their correct habitats</p>
                </div>
                <div className="space-y-3">
                  {currentAnimals.map(animal => (
                    <div
                      key={animal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, animal.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 rounded-lg border-2 cursor-move transition-all hover:scale-105 flex items-center gap-4 ${
                        animal.endangered 
                          ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                          : 'border-green-200 bg-green-50 hover:bg-green-100'
                      } ${draggedAnimal === animal.id ? 'opacity-50 scale-95' : ''}`}
                    >
                      <div className="text-3xl">{animal.image}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{animal.name}</div>
                        {animal.endangered && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Endangered
                          </Badge>
                        )}
                      </div>
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Habitats Section */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Habitats</h2>
                  <p className="text-sm text-gray-600">Drop animals onto their correct habitats</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {habitats.map(habitat => (
                    <div
                      key={habitat.id}
                      onDragOver={(e) => handleDragOver(e, habitat.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, habitat.id)}
                      className={`h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                        dragOverHabitat === habitat.id 
                          ? 'border-blue-500 bg-blue-100 scale-105' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{habitat.icon}</div>
                      <div className="text-sm font-semibold text-gray-700">{habitat.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SaveTheAnimalsGame;
