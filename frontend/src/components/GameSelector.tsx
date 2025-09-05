import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Recycle, 
  Droplets, 
  ArrowLeft,
  Trophy,
  Target,
  Gamepad2
} from "lucide-react";

interface GameSelectorProps {
  onSelectGame: (gameType: 'waste-sorting' | 'water-simulator') => void;
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
  }
];

export const GameSelector = ({ onSelectGame, onBack }: GameSelectorProps) => {
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

      {/* Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map((game) => {
          const Icon = game.icon;
          
          return (
            <Card key={game.id} className="hover:shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer group bg-white/60">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${game.color}/10 group-hover:${game.color}/20 transition-colors`}>
                    <Icon className={`h-8 w-8 ${game.id === 'waste-sorting' ? 'text-eco-bright' : 'text-blue-500'}`} />
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
                    onClick={() => onSelectGame(game.id as 'waste-sorting' | 'water-simulator')}
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
                      ) : (
                        <>
                          <li>• Daily water consumption habits</li>
                          <li>• Conservation techniques</li>
                          <li>• Environmental impact of choices</li>
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