import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TreePine, Leaf, Zap, Trophy, RotateCcw } from 'lucide-react';

interface TreeStage {
  id: number;
  name: string;
  emoji: string;
  height: number;
  oxygenPoints: number;
  description: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface TreeHeroGameProps {
  onComplete: (score: number) => void;
}

const TreeHeroGame: React.FC<TreeHeroGameProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [oxygenPoints, setOxygenPoints] = useState(0);
  const [currentTreeStage, setCurrentTreeStage] = useState(0);
  const [gamePhase, setGamePhase] = useState<'intro' | 'quiz' | 'growing' | 'complete'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  const treeStages: TreeStage[] = [
    { id: 0, name: 'Seed', emoji: '🌱', height: 5, oxygenPoints: 0, description: 'A tiny seed ready to grow' },
    { id: 1, name: 'Sprout', emoji: '🌿', height: 15, oxygenPoints: 10, description: 'First green shoots appear' },
    { id: 2, name: 'Sapling', emoji: '🌳', height: 30, oxygenPoints: 25, description: 'Young tree with small branches' },
    { id: 3, name: 'Young Tree', emoji: '🌲', height: 50, oxygenPoints: 45, description: 'Growing strong and tall' },
    { id: 4, name: 'Mature Tree', emoji: '🌴', height: 80, oxygenPoints: 70, description: 'Full-grown tree providing shade' },
    { id: 5, name: 'Forest Giant', emoji: '🌳', height: 120, oxygenPoints: 100, description: 'Ancient tree, forest guardian' }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What do trees produce that we breathe?',
      options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Water Vapor'],
      correctAnswer: 1,
      explanation: 'Trees produce oxygen through photosynthesis, which is essential for all living things to breathe!',
      category: 'photosynthesis',
      difficulty: 'easy',
      points: 10
    },
    {
      id: '2',
      question: 'What process do trees use to make their own food?',
      options: ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'],
      correctAnswer: 1,
      explanation: 'Photosynthesis is how trees convert sunlight, water, and carbon dioxide into food and oxygen.',
      category: 'photosynthesis',
      difficulty: 'medium',
      points: 15
    },
    {
      id: '3',
      question: 'How many trees are cut down every year worldwide?',
      options: ['1 million', '10 million', '15 billion', '50 billion'],
      correctAnswer: 2,
      explanation: 'About 15 billion trees are cut down each year, which is why planting new trees is so important!',
      category: 'deforestation',
      difficulty: 'hard',
      points: 20
    },
    {
      id: '4',
      question: 'Which part of the tree absorbs water from the soil?',
      options: ['Leaves', 'Bark', 'Roots', 'Branches'],
      correctAnswer: 2,
      explanation: 'Tree roots absorb water and nutrients from the soil to help the tree grow.',
      category: 'tree-structure',
      difficulty: 'easy',
      points: 10
    },
    {
      id: '5',
      question: 'How much oxygen does one mature tree produce per day?',
      options: ['Enough for 1 person', 'Enough for 2 people', 'Enough for 4 people', 'Enough for 10 people'],
      correctAnswer: 2,
      explanation: 'One mature tree can produce enough oxygen for 4 people to breathe for one day!',
      category: 'oxygen-production',
      difficulty: 'medium',
      points: 15
    },
    {
      id: '6',
      question: 'What is the main cause of deforestation?',
      options: ['Natural disasters', 'Agriculture and logging', 'Wildfires', 'Disease'],
      correctAnswer: 1,
      explanation: 'Agriculture and logging are the main causes of deforestation, clearing land for farming and wood.',
      category: 'deforestation',
      difficulty: 'medium',
      points: 15
    },
    {
      id: '7',
      question: 'Which gas do trees absorb from the atmosphere?',
      options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Methane'],
      correctAnswer: 2,
      explanation: 'Trees absorb carbon dioxide from the atmosphere, helping to reduce greenhouse gases.',
      category: 'carbon-sequestration',
      difficulty: 'easy',
      points: 10
    },
    {
      id: '8',
      question: 'How long does it take for a tree to reach maturity?',
      options: ['1-2 years', '5-10 years', '20-50 years', '100+ years'],
      correctAnswer: 2,
      explanation: 'Most trees take 20-50 years to reach maturity, which is why protecting existing trees is crucial.',
      category: 'tree-growth',
      difficulty: 'hard',
      points: 20
    }
  ];

  const initializeGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setOxygenPoints(0);
    setCurrentTreeStage(0);
    setGamePhase('intro');
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuestionsAnswered(0);
    setTimeLeft(30);
    setGameStarted(false);
  };

  const startGame = () => {
    setGameStarted(true);
    setGamePhase('quiz');
    selectRandomQuestion();
  };

  const selectRandomQuestion = () => {
    const availableQuestions = quizQuestions.filter(q => 
      !currentQuestion || q.id !== currentQuestion.id
    );
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(30);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === currentQuestion!.correctAnswer) {
      const points = currentQuestion!.points;
      setScore(prev => prev + points);
      setOxygenPoints(prev => prev + points);
      
      // Grow tree if enough points accumulated
      const newStage = Math.min(currentTreeStage + 1, treeStages.length - 1);
      setCurrentTreeStage(newStage);
      
      setGamePhase('growing');
      setTimeout(() => {
        setQuestionsAnswered(prev => prev + 1);
        if (questionsAnswered >= 5) {
          setGamePhase('complete');
        } else {
          setGamePhase('quiz');
          selectRandomQuestion();
        }
      }, 2000);
    } else {
      setShowExplanation(true);
      setTimeout(() => {
        setQuestionsAnswered(prev => prev + 1);
        if (questionsAnswered >= 5) {
          setGamePhase('complete');
        } else {
          setGamePhase('quiz');
          selectRandomQuestion();
        }
      }, 3000);
    }
  };

  const getCurrentTree = () => treeStages[currentTreeStage];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && gamePhase === 'quiz' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gamePhase === 'quiz') {
      // Time's up - move to next question
      setQuestionsAnswered(prev => prev + 1);
      if (questionsAnswered >= 5) {
        setGamePhase('complete');
      } else {
        selectRandomQuestion();
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gamePhase, gameStarted, questionsAnswered]);

  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
                <TreePine className="h-8 w-8" />
                Tree Hero
              </CardTitle>
              <CardDescription className="text-lg">Plant and grow trees by answering quiz questions!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{getCurrentTree().emoji}</div>
                <h3 className="text-xl font-semibold text-gray-800">{getCurrentTree().name}</h3>
                <p className="text-gray-600">{getCurrentTree().description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Grow Trees</h4>
                    <p className="text-sm text-gray-600">Answer questions to make your tree grow taller</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Learn Science</h4>
                    <p className="text-sm text-gray-600">Discover photosynthesis and environmental science</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Earn Points</h4>
                    <p className="text-sm text-gray-600">Collect Oxygen Points for your forest</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                  <TreePine className="h-5 w-5 mr-2" />
                  Start Planting!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-green-800">Forest Complete! 🌳</CardTitle>
              <CardDescription>Congratulations! You've grown a magnificent tree!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-8xl mb-4">{getCurrentTree().emoji}</div>
                <h3 className="text-2xl font-semibold text-gray-800">{getCurrentTree().name}</h3>
                <p className="text-gray-600 text-lg">{getCurrentTree().description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-gray-600">Total Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{oxygenPoints}</div>
                    <div className="text-sm text-gray-600">Oxygen Points</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{questionsAnswered}</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </CardContent>
                </Card>
              </div>

                              <div className="text-center space-y-4">
                  <div className="text-lg text-gray-700">
                    Your tree is now <span className="font-bold text-green-600">{getCurrentTree().height}cm</span> tall and 
                    producing <span className="font-bold text-blue-600">{getCurrentTree().oxygenPoints}</span> oxygen points!
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={initializeGame} size="lg" className="bg-green-600 hover:bg-green-700">
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Plant Another Tree
                    </Button>
                    <Button onClick={() => onComplete(score)} size="lg" variant="outline">
                      <Trophy className="h-5 w-5 mr-2" />
                      Return to Games
                    </Button>
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
                  <TreePine className="h-6 w-6" />
                  Tree Hero
                </CardTitle>
                <CardDescription>Level {currentLevel} - Grow Your Tree!</CardDescription>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Score: {score}</span>
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Oxygen: {oxygenPoints}</span>
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Time: {timeLeft}s</span>
                </div>
              </div>
            </div>
            <Progress value={(30 - timeLeft) / 30 * 100} className="mt-2" />
          </CardHeader>
        </Card>

        {/* Game Phase: Quiz */}
        {gamePhase === 'quiz' && currentQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tree Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Tree</CardTitle>
                <CardDescription>Current stage: {getCurrentTree().name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl">{getCurrentTree().emoji}</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{getCurrentTree().name}</h3>
                    <p className="text-gray-600">{getCurrentTree().description}</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <Badge variant="outline">Height: {getCurrentTree().height}cm</Badge>
                      <Badge variant="outline">Oxygen: {getCurrentTree().oxygenPoints}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz Question</CardTitle>
                <CardDescription>Answer correctly to grow your tree!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === index ? 
                          (index === currentQuestion.correctAnswer ? "default" : "destructive") : 
                          "outline"
                        }
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                      >
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {showExplanation && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                    <p className="text-blue-700">{currentQuestion.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Phase: Growing */}
        {gamePhase === 'growing' && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="text-8xl animate-bounce">{getCurrentTree().emoji}</div>
                <h2 className="text-3xl font-bold text-green-600">Tree Growing!</h2>
                <p className="text-lg text-gray-600">
                  Your tree is growing taller and stronger! 🌱➡️🌳
                </p>
                <div className="text-2xl font-semibold text-blue-600">
                  +{currentQuestion?.points} Oxygen Points!
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TreeHeroGame;
