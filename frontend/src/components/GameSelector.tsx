import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Recycle, 
  Droplets, 
  ArrowLeft,
  Trophy,
  Target,
  Gamepad2,
  Heart,
  TreePine,
  Clock,
  Zap
} from "lucide-react";

interface GameSelectorProps {
  onSelectGame: (gameType: 'waste-sorting' | 'water-simulator' | 'save-animals' | 'tree-hero' | 'climate-time-traveler' | 'forest-match') => void;
  onBack: () => void;
}

const games = [
  {
    id: 'waste-sorting',
    name: 'Waste Sorting Challenge',
    description: 'Drag and drop items into the correct recycling bins',
    icon: Recycle,
    color: 'bg-eco-bright',
    difficulty: 'Easy',
    xp: '10-50 XP',
    time: '5 mins',
    players: '1.2k'
  },
  {
    id: 'water-simulator',
    name: 'Water Conservation Simulator',
    description: 'Make daily choices to optimize your water usage',
    icon: Droplets,
    color: 'bg-gradient-water',
    difficulty: 'Medium',
    xp: '15-50 XP',
    time: '8 mins',
    players: '856'
  },
  {
    id: 'save-animals',
    name: 'Save the Animals',
    description: 'Drag and drop animals to their correct habitats and learn about biodiversity',
    icon: Heart,
    color: 'bg-red-500',
    difficulty: 'Medium',
    xp: '20-80 XP',
    time: '10 mins',
    players: '1.5k'
  },
  {
    id: 'tree-hero',
    name: 'Tree Hero',
    description: 'Plant and grow trees by answering quiz questions about environmental science',
    icon: TreePine,
    color: 'bg-green-500',
    difficulty: 'Easy',
    xp: '10-100 XP',
    time: '8 mins',
    players: '2.1k'
  },
  {
    id: 'climate-time-traveler',
    name: 'Climate Time Traveler',
    description: 'Travel through time and make choices that shape the environment across different eras',
    icon: Clock,
    color: 'bg-purple-500',
    difficulty: 'Medium',
    xp: '20-120 XP',
    time: '12 mins',
    players: '1.8k'
  },
  {
    id: 'forest-match',
    name: 'Forest Match',
    description: 'Match natural elements to restore the damaged forest with special combinations',
    icon: Zap,
    color: 'bg-green-600',
    difficulty: 'Easy',
    xp: '15-200 XP',
    time: '10 mins',
    players: '2.3k'
  }
];

export const GameSelector = ({ onSelectGame, onBack }: GameSelectorProps) => {
  const difficultyOrder: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
  const roadmap = [...games].sort((a, b) => (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-eco border-0 text-primary-foreground shadow-eco">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="text-primary-foreground hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Gamepad2 className="h-8 w-8" />
                Eco Games
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Learn about the environment through interactive games!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Roadmap: Easy → Hard */}
      <Card className="bg-white/70">
        <CardHeader>
          <CardTitle className="text-lg">Roadmap: Start Easy → Advance to Hard</CardTitle>
          <CardDescription>Follow this path to progress from beginner-friendly games to more challenging ones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto py-4">
            <div className="flex items-center gap-6 min-w-max">
              {roadmap.map((g, idx) => {
                const Icon = g.icon;
                const isLast = idx === roadmap.length - 1;
                const color = g.difficulty === 'Easy' ? 'bg-emerald-500' : g.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-rose-500';
                const ring = g.difficulty === 'Easy' ? 'ring-emerald-300' : g.difficulty === 'Medium' ? 'ring-amber-300' : 'ring-rose-300';
                return (
                  <div key={g.id} className="flex items-center gap-6">
                    <button
                      onClick={() => onSelectGame(g.id as any)}
                      className={`pointer-events-auto group rounded-2xl px-4 py-3 shadow-sm ring-2 ${ring} bg-white hover:shadow-md transition-all text-left`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-9 w-9 ${color} text-white rounded-lg inline-flex items-center justify-center`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="font-semibold leading-none">{g.name}</div>
                          <div className="text-xs text-muted-foreground">{g.difficulty}</div>
                        </div>
                      </div>
                    </button>
                    {!isLast && <div className="w-10 h-0.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map((game) => {
          const Icon = game.icon;
          
          return (
            <Card key={game.id} className="hover:shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer group bg-white/60">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${game.color}/10 group-hover:${game.color}/20 transition-colors`}>
                    <Icon className={`h-8 w-8 ${
                      game.id === 'waste-sorting' ? 'text-eco-bright' : 
                      game.id === 'water-simulator' ? 'text-blue-500' : 
                      game.id === 'save-animals' ? 'text-red-500' :
                      game.id === 'tree-hero' ? 'text-green-500' :
                      game.id === 'climate-time-traveler' ? 'text-purple-500' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      {game.difficulty}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {game.players} players
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {game.name}
                </CardTitle>
                <CardDescription>
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Game Stats */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-accent" />
                      <span className="text-muted-foreground">Reward:</span>
                      <span className="font-medium text-accent">{game.xp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{game.time}</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => onSelectGame(game.id as 'waste-sorting' | 'water-simulator' | 'save-animals' | 'tree-hero' | 'climate-time-traveler' | 'forest-match')}
                  >
                    Play Now
                  </Button>

                  {/* Game Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">What you'll learn:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {game.id === 'waste-sorting' ? (
                        <>
                          <li>• Proper waste classification</li>
                          <li>• Recycling best practices</li>
                          <li>• Environmental impact awareness</li>
                        </>
                      ) : game.id === 'water-simulator' ? (
                        <>
                          <li>• Daily water consumption habits</li>
                          <li>• Conservation techniques</li>
                          <li>• Environmental impact of choices</li>
                        </>
                      ) : game.id === 'save-animals' ? (
                        <>
                          <li>• Animal habitats and biodiversity</li>
                          <li>• Endangered species awareness</li>
                          <li>• Ecosystem conservation</li>
                        </>
                      ) : game.id === 'tree-hero' ? (
                        <>
                          <li>• Photosynthesis and tree science</li>
                          <li>• Deforestation awareness</li>
                          <li>• Environmental conservation</li>
                        </>
                      ) : game.id === 'climate-time-traveler' ? (
                        <>
                          <li>• Climate change through history</li>
                          <li>• Environmental decision-making</li>
                          <li>• Sustainable future planning</li>
                        </>
                      ) : (
                        <>
                          <li>• Natural element interactions</li>
                          <li>• Forest restoration and biodiversity</li>
                          <li>• Environmental puzzle solving</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed border-2 border-muted-foreground/30 bg-white/60">
        <CardContent className="text-center py-12">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-medium mb-2">More Games Coming Soon!</h3>
          <p className="text-muted-foreground">
            We're working on new eco-games including energy optimization, 
            carbon footprint calculator, and ecosystem simulation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};