import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  TreePine, 
  Factory, 
  Zap, 
  Sun, 
  Wind, 
  Droplets,
  Award,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Leaf,
  Flame,
  Mountain,
  Waves
} from 'lucide-react';

interface Era {
  id: string;
  name: string;
  period: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  environment: string;
  background: string;
}

interface Choice {
  id: string;
  text: string;
  impact: 'positive' | 'negative' | 'neutral';
  points: number;
  description: string;
  consequence: string;
}

interface Scenario {
  id: string;
  era: string;
  title: string;
  description: string;
  choices: Choice[];
  background: string;
}

interface ClimateTimeTravelerGameProps {
  onComplete: (score: number) => void;
}

const eras: Era[] = [
  {
    id: 'prehistoric',
    name: 'Prehistoric Era',
    period: '65 Million Years Ago',
    icon: <TreePine className="h-8 w-8" />,
    color: 'bg-green-600',
    description: 'Lush forests, clean air, and abundant wildlife',
    environment: 'pristine',
    background: 'from-green-100 to-green-200'
  },
  {
    id: 'industrial',
    name: 'Industrial Age',
    period: '1800-1900 AD',
    icon: <Factory className="h-8 w-8" />,
    color: 'bg-gray-600',
    description: 'Factories, coal burning, and the beginning of pollution',
    environment: 'polluted',
    background: 'from-gray-100 to-gray-300'
  },
  {
    id: 'present',
    name: 'Present Day',
    period: '2000-2024 AD',
    icon: <Globe className="h-8 w-8" />,
    color: 'bg-blue-600',
    description: 'Climate change awareness and renewable energy development',
    environment: 'transitioning',
    background: 'from-blue-100 to-blue-200'
  },
  {
    id: 'future',
    name: 'Future World',
    period: '2050+ AD',
    icon: <Zap className="h-8 w-8" />,
    color: 'bg-purple-600',
    description: 'Advanced technology and sustainable living',
    environment: 'sustainable',
    background: 'from-purple-100 to-purple-200'
  }
];

const scenarios: Scenario[] = [
  // Prehistoric Era
  {
    id: 'prehistoric-1',
    era: 'prehistoric',
    title: 'The First Fire',
    description: 'You discover how to make fire. How do you use this new technology?',
    background: 'from-green-100 to-green-200',
    choices: [
      {
        id: 'fire-cooking',
        text: 'Use fire for cooking and warmth',
        impact: 'positive',
        points: 20,
        description: 'Fire helps humans survive and develop',
        consequence: 'Humans can cook food and stay warm, leading to better nutrition and longer life expectancy.'
      },
      {
        id: 'fire-destruction',
        text: 'Use fire to clear large areas of forest',
        impact: 'negative',
        points: -10,
        description: 'Massive deforestation for agriculture',
        consequence: 'Large areas of forest are burned down, reducing biodiversity and increasing CO2 levels.'
      },
      {
        id: 'fire-conservation',
        text: 'Use fire carefully and sustainably',
        impact: 'positive',
        points: 30,
        description: 'Balanced use of fire technology',
        consequence: 'Fire is used responsibly, helping humans while preserving the natural environment.'
      }
    ]
  },
  {
    id: 'prehistoric-2',
    era: 'prehistoric',
    title: 'Hunting and Gathering',
    description: 'Your tribe needs food. How do you approach hunting and gathering?',
    background: 'from-green-100 to-green-200',
    choices: [
      {
        id: 'sustainable-hunting',
        text: 'Hunt only what you need and respect animal populations',
        impact: 'positive',
        points: 25,
        description: 'Sustainable hunting practices',
        consequence: 'Animal populations remain stable, ensuring long-term food security for your tribe.'
      },
      {
        id: 'overhunting',
        text: 'Hunt as much as possible to build up reserves',
        impact: 'negative',
        points: -15,
        description: 'Overhunting leads to species decline',
        consequence: 'Many animal species become extinct, disrupting the ecosystem balance.'
      },
      {
        id: 'farming-start',
        text: 'Start domesticating plants and animals',
        impact: 'neutral',
        points: 10,
        description: 'Beginning of agriculture',
        consequence: 'Agriculture begins, providing stable food sources but requiring land clearing.'
      }
    ]
  },

  // Industrial Age
  {
    id: 'industrial-1',
    era: 'industrial',
    title: 'The Steam Engine',
    description: 'You invent the steam engine. How do you power it?',
    background: 'from-gray-100 to-gray-300',
    choices: [
      {
        id: 'coal-power',
        text: 'Use coal to power the steam engine',
        impact: 'negative',
        points: -20,
        description: 'Coal burning creates pollution',
        consequence: 'Coal burning releases massive amounts of CO2 and creates smog, beginning climate change.'
      },
      {
        id: 'water-power',
        text: 'Use water wheels and hydroelectric power',
        impact: 'positive',
        points: 25,
        description: 'Clean hydroelectric energy',
        consequence: 'Water power provides clean energy without pollution, setting a sustainable precedent.'
      },
      {
        id: 'wind-power',
        text: 'Develop wind-powered machinery',
        impact: 'positive',
        points: 30,
        description: 'Early wind energy technology',
        consequence: 'Wind power is harnessed, creating clean energy and reducing dependence on fossil fuels.'
      }
    ]
  },
  {
    id: 'industrial-2',
    era: 'industrial',
    title: 'Urban Development',
    description: 'Cities are growing rapidly. How do you plan urban development?',
    background: 'from-gray-100 to-gray-300',
    choices: [
      {
        id: 'green-cities',
        text: 'Design cities with parks and green spaces',
        impact: 'positive',
        points: 20,
        description: 'Green urban planning',
        consequence: 'Cities have clean air, parks, and sustainable infrastructure, improving quality of life.'
      },
      {
        id: 'industrial-cities',
        text: 'Build dense industrial cities without green spaces',
        impact: 'negative',
        points: -25,
        description: 'Polluted industrial cities',
        consequence: 'Cities become polluted, unhealthy places with poor air quality and no nature.'
      },
      {
        id: 'mixed-development',
        text: 'Balance industry with environmental considerations',
        impact: 'neutral',
        points: 5,
        description: 'Balanced urban development',
        consequence: 'Cities develop with some green spaces but still have pollution issues.'
      }
    ]
  },

  // Present Day
  {
    id: 'present-1',
    era: 'present',
    title: 'Energy Transition',
    description: 'Your country needs to choose its energy strategy. What do you recommend?',
    background: 'from-blue-100 to-blue-200',
    choices: [
      {
        id: 'renewable-energy',
        text: 'Invest heavily in solar and wind power',
        impact: 'positive',
        points: 35,
        description: 'Clean renewable energy transition',
        consequence: 'Solar and wind power reduce emissions, create jobs, and provide clean energy for all.'
      },
      {
        id: 'fossil-fuels',
        text: 'Continue using coal and oil for energy',
        impact: 'negative',
        points: -30,
        description: 'Continued fossil fuel dependence',
        consequence: 'Climate change accelerates, air pollution increases, and environmental damage continues.'
      },
      {
        id: 'nuclear-energy',
        text: 'Build nuclear power plants',
        impact: 'neutral',
        points: 10,
        description: 'Nuclear energy as transition',
        consequence: 'Nuclear power provides clean energy but creates radioactive waste and safety concerns.'
      }
    ]
  },
  {
    id: 'present-2',
    era: 'present',
    title: 'Transportation Revolution',
    description: 'How should we transform transportation to reduce emissions?',
    background: 'from-blue-100 to-blue-200',
    choices: [
      {
        id: 'electric-vehicles',
        text: 'Promote electric vehicles and public transport',
        impact: 'positive',
        points: 30,
        description: 'Clean transportation systems',
        consequence: 'Electric vehicles and public transport reduce emissions and improve air quality in cities.'
      },
      {
        id: 'gas-cars',
        text: 'Continue with gasoline-powered cars',
        impact: 'negative',
        points: -20,
        description: 'Continued fossil fuel transportation',
        consequence: 'Gasoline cars continue to pollute, contributing to climate change and poor air quality.'
      },
      {
        id: 'hybrid-approach',
        text: 'Develop hybrid and alternative fuel vehicles',
        impact: 'neutral',
        points: 15,
        description: 'Mixed transportation approach',
        consequence: 'Some progress is made, but emissions reduction is slower than with full electric transition.'
      }
    ]
  },

  // Future World
  {
    id: 'future-1',
    era: 'future',
    title: 'Climate Restoration',
    description: 'Advanced technology allows climate restoration. How do you use it?',
    background: 'from-purple-100 to-purple-200',
    choices: [
      {
        id: 'carbon-capture',
        text: 'Deploy massive carbon capture technology',
        impact: 'positive',
        points: 40,
        description: 'Advanced carbon removal',
        consequence: 'Carbon capture technology removes CO2 from the atmosphere, reversing climate change.'
      },
      {
        id: 'geoengineering',
        text: 'Use geoengineering to cool the planet',
        impact: 'neutral',
        points: 10,
        description: 'Risky geoengineering approach',
        consequence: 'Planet cools but with unknown side effects and potential environmental risks.'
      },
      {
        id: 'natural-restoration',
        text: 'Focus on natural ecosystem restoration',
        impact: 'positive',
        points: 35,
        description: 'Natural climate solutions',
        consequence: 'Forests and oceans are restored, naturally absorbing carbon and healing the planet.'
      }
    ]
  },
  {
    id: 'future-2',
    era: 'future',
    title: 'Sustainable Living',
    description: 'How do you design the cities of the future?',
    background: 'from-purple-100 to-purple-200',
    choices: [
      {
        id: 'vertical-farms',
        text: 'Build vertical farms and green buildings',
        impact: 'positive',
        points: 30,
        description: 'Sustainable urban agriculture',
        consequence: 'Cities produce their own food, reduce transportation emissions, and improve air quality.'
      },
      {
        id: 'smart-cities',
        text: 'Create AI-powered smart cities',
        impact: 'neutral',
        points: 20,
        description: 'Technology-driven urban planning',
        consequence: 'Smart cities are efficient but may lack human connection and natural elements.'
      },
      {
        id: 'eco-cities',
        text: 'Design fully sustainable eco-cities',
        impact: 'positive',
        points: 40,
        description: 'Complete sustainable living',
        consequence: 'Eco-cities are carbon-neutral, self-sufficient, and in harmony with nature.'
      }
    ]
  }
];

const ClimateTimeTravelerGame: React.FC<ClimateTimeTravelerGameProps> = ({ onComplete }) => {
  const [currentEra, setCurrentEra] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [environmentalImpact, setEnvironmentalImpact] = useState({
    airQuality: 100,
    biodiversity: 100,
    carbonLevel: 0,
    temperature: 0
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  const currentEraData = eras[currentEra];
  const currentScenarioData = scenarios.filter(s => s.era === currentEraData.id)[currentScenario];

  const initializeGame = () => {
    setCurrentEra(0);
    setCurrentScenario(0);
    setScore(0);
    setGamePhase('intro');
    setSelectedChoice(null);
    setShowConsequence(false);
    setEnvironmentalImpact({
      airQuality: 100,
      biodiversity: 100,
      carbonLevel: 0,
      temperature: 0
    });
    setGameStarted(false);
    setCompletedScenarios([]);
  };

  const startGame = () => {
    setGameStarted(true);
    setGamePhase('playing');
  };

  const handleChoiceSelect = (choice: Choice) => {
    setSelectedChoice(choice);
    setScore(prev => prev + choice.points);
    
    // Update environmental impact based on choice
    setEnvironmentalImpact(prev => ({
      airQuality: Math.max(0, Math.min(100, prev.airQuality + (choice.impact === 'positive' ? 5 : choice.impact === 'negative' ? -10 : 0))),
      biodiversity: Math.max(0, Math.min(100, prev.biodiversity + (choice.impact === 'positive' ? 5 : choice.impact === 'negative' ? -8 : 0))),
      carbonLevel: Math.max(0, prev.carbonLevel + (choice.impact === 'positive' ? -2 : choice.impact === 'negative' ? 5 : 1)),
      temperature: prev.temperature + (choice.impact === 'positive' ? -0.1 : choice.impact === 'negative' ? 0.2 : 0)
    }));

    setShowConsequence(true);
  };

  const handleNextScenario = () => {
    setCompletedScenarios(prev => [...prev, currentScenarioData.id]);
    setSelectedChoice(null);
    setShowConsequence(false);

    // Move to next scenario in current era
    const eraScenarios = scenarios.filter(s => s.era === currentEraData.id);
    if (currentScenario < eraScenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
    } else {
      // Move to next era
      if (currentEra < eras.length - 1) {
        setCurrentEra(prev => prev + 1);
        setCurrentScenario(0);
      } else {
        // Game complete
        setGamePhase('complete');
      }
    }
  };

  const getEnvironmentStatus = () => {
    const avg = (environmentalImpact.airQuality + environmentalImpact.biodiversity) / 2;
    if (avg >= 80) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (avg >= 60) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (avg >= 40) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (avg >= 20) return { status: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getEraIcon = (eraId: string) => {
    switch (eraId) {
      case 'prehistoric': return <TreePine className="h-6 w-6" />;
      case 'industrial': return <Factory className="h-6 w-6" />;
      case 'present': return <Globe className="h-6 w-6" />;
      case 'future': return <Zap className="h-6 w-6" />;
      default: return <Clock className="h-6 w-6" />;
    }
  };

  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
              <Clock className="h-8 w-8" />
              Climate Time Traveler
            </CardTitle>
            <CardDescription className="text-lg">
              Travel through time and make choices that shape the environment!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-800">Journey Through Time</h3>
              <p className="text-gray-600">Make decisions that impact the environment across different eras</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {eras.map((era, index) => (
                <Card key={era.id} className={`${era.background} border-2`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{getEraIcon(era.id)}</div>
                    <h4 className="font-semibold text-sm">{era.name}</h4>
                    <p className="text-xs text-gray-600">{era.period}</p>
                    <p className="text-xs mt-1">{era.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Travel through 4 different time periods</li>
                <li>• Make choices that affect the environment</li>
                <li>• See immediate consequences of your decisions</li>
                <li>• Learn about climate change and sustainability</li>
                <li>• Build a better future through wise choices</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                <Clock className="h-5 w-5 mr-2" />
                Start Time Travel!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'complete') {
    const envStatus = getEnvironmentStatus();
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
              <Award className="h-8 w-8" />
              Time Travel Complete!
            </CardTitle>
            <CardDescription>You've shaped the environment across all eras!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-8xl mb-4">🌍</div>
              <h3 className="text-2xl font-semibold text-gray-800">Your Environmental Impact</h3>
              <div className={`inline-block px-4 py-2 rounded-full ${envStatus.bg} ${envStatus.color} font-semibold mt-2`}>
                {envStatus.status} Environment
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{environmentalImpact.airQuality}%</div>
                  <div className="text-sm text-gray-600">Air Quality</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{environmentalImpact.biodiversity}%</div>
                  <div className="text-sm text-gray-600">Biodiversity</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{environmentalImpact.carbonLevel}</div>
                  <div className="text-sm text-gray-600">Carbon Level</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <div className="text-lg text-gray-700">
                You completed <span className="font-bold text-green-600">{completedScenarios.length}</span> scenarios across 
                <span className="font-bold text-blue-600"> {eras.length}</span> time periods!
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={initializeGame} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Clock className="h-5 w-5 mr-2" />
                  Travel Again
                </Button>
                <Button onClick={() => onComplete(score)} size="lg" variant="outline">
                  <Award className="h-5 w-5 mr-2" />
                  Return to Games
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentEraData.background} p-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {getEraIcon(currentEraData.id)}
                  {currentEraData.name}
                </CardTitle>
                <CardDescription>{currentEraData.period} - {currentEraData.description}</CardDescription>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Score: {score}</span>
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Era: {currentEra + 1}/4</span>
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Scenario: {currentScenario + 1}/2</span>
                </div>
              </div>
            </div>
            <Progress value={((currentEra * 2 + currentScenario + 1) / 8) * 100} className="mt-2" />
          </CardHeader>
        </Card>

        {/* Environmental Impact Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{environmentalImpact.airQuality}%</div>
                <div className="text-sm text-gray-600">Air Quality</div>
                <Progress value={environmentalImpact.airQuality} className="mt-1" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{environmentalImpact.biodiversity}%</div>
                <div className="text-sm text-gray-600">Biodiversity</div>
                <Progress value={environmentalImpact.biodiversity} className="mt-1" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{environmentalImpact.carbonLevel}</div>
                <div className="text-sm text-gray-600">Carbon Level</div>
                <Progress value={Math.min(100, environmentalImpact.carbonLevel * 2)} className="mt-1" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">+{environmentalImpact.temperature.toFixed(1)}°C</div>
                <div className="text-sm text-gray-600">Temperature</div>
                <Progress value={Math.min(100, (environmentalImpact.temperature + 2) * 20)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Scenario */}
        {currentScenarioData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentScenarioData.title}</CardTitle>
              <CardDescription>{currentScenarioData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showConsequence ? (
                <div className="space-y-3">
                  {currentScenarioData.choices.map((choice) => (
                    <Button
                      key={choice.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-4 text-left hover:bg-gray-50 border-gray-200"
                      onClick={() => handleChoiceSelect(choice)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        </div>
                        <div>
                          <div className="font-semibold">{choice.text}</div>
                          <div className="text-sm text-gray-600">{choice.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className={selectedChoice?.impact === 'positive' ? 'border-green-200 bg-green-50' :
                                   selectedChoice?.impact === 'negative' ? 'border-red-200 bg-red-50' :
                                   'border-yellow-200 bg-yellow-50'}>
                    <AlertDescription>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedChoice?.impact === 'positive' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                         selectedChoice?.impact === 'negative' ? <XCircle className="h-5 w-5 text-red-600" /> :
                         <Clock className="h-5 w-5 text-yellow-600" />}
                        <div className="font-semibold">Consequence:</div>
                      </div>
                      <div className="mb-2">{selectedChoice?.consequence}</div>
                      <div className="text-sm font-medium">
                        {selectedChoice?.points > 0 ? '+' : ''}{selectedChoice?.points} points
                      </div>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center">
                    <Button onClick={handleNextScenario} size="lg">
                      {currentEra < eras.length - 1 || currentScenario < scenarios.filter(s => s.era === currentEraData.id).length - 1 ? 
                        'Continue Journey' : 'Complete Time Travel'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClimateTimeTravelerGame;
