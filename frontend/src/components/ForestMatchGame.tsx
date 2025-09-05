import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TreePine, 
  Droplets, 
  Sun, 
  Flower, 
  Heart,
  Award,
  Target,
  Zap,
  Leaf,
  Mountain,
  Waves,
  RotateCcw,
  Play,
  ArrowRight
} from 'lucide-react';

interface GameElement {
  id: string;
  type: 'tree' | 'water' | 'sun' | 'flower' | 'seed' | 'animal';
  emoji: string;
  color: string;
  points: number;
}

interface Position {
  row: number;
  col: number;
}

interface Match {
  positions: Position[];
  element: GameElement;
  isSpecial: boolean;
}

interface ForestLevel {
  id: number;
  name: string;
  description: string;
  targetScore: number;
  moves: number;
  forestState: number; // 0-100% restored
  background: string;
}

interface ForestMatchGameProps {
  onComplete: (score: number) => void;
}

const gameElements: GameElement[] = [
  { id: 'tree', type: 'tree', emoji: '🌳', color: 'bg-green-500', points: 10 },
  { id: 'water', type: 'water', emoji: '💧', color: 'bg-blue-500', points: 15 },
  { id: 'sun', type: 'sun', emoji: '☀️', color: 'bg-yellow-500', points: 12 },
  { id: 'flower', type: 'flower', emoji: '🌸', color: 'bg-pink-500', points: 8 },
  { id: 'seed', type: 'seed', emoji: '🌱', color: 'bg-green-400', points: 5 },
  { id: 'animal', type: 'animal', emoji: '🐿️', color: 'bg-orange-500', points: 20 }
];

const forestLevels: ForestLevel[] = [
  {
    id: 1,
    name: 'Withered Grove',
    description: 'Restore the first section of the damaged forest',
    targetScore: 500,
    moves: 20,
    forestState: 0,
    background: 'from-gray-100 to-gray-300'
  },
  {
    id: 2,
    name: 'Dried Stream',
    description: 'Bring water back to the parched land',
    targetScore: 750,
    moves: 25,
    forestState: 25,
    background: 'from-yellow-100 to-yellow-200'
  },
  {
    id: 3,
    name: 'Barren Meadow',
    description: 'Plant flowers and bring life to the meadow',
    targetScore: 1000,
    moves: 30,
    forestState: 50,
    background: 'from-orange-100 to-orange-200'
  },
  {
    id: 4,
    name: 'Recovering Forest',
    description: 'Help the forest grow strong and healthy',
    targetScore: 1500,
    moves: 35,
    forestState: 75,
    background: 'from-green-100 to-green-200'
  },
  {
    id: 5,
    name: 'Thriving Ecosystem',
    description: 'Complete the forest restoration',
    targetScore: 2000,
    moves: 40,
    forestState: 100,
    background: 'from-green-200 to-green-400'
  }
];

const ForestMatchGame: React.FC<ForestMatchGameProps> = ({ onComplete }) => {
  try {
    // Error boundary state
    const [hasError, setHasError] = useState(false);
    const [gameBoard, setGameBoard] = useState<(GameElement | null)[][]>([]);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [score, setScore] = useState(0);
    const [movesLeft, setMovesLeft] = useState(0);
    const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'level-complete' | 'game-complete'>('intro');
    const [selectedElement, setSelectedElement] = useState<Position | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [comboCount, setComboCount] = useState(0);
    const [specialEffects, setSpecialEffects] = useState<string[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [forestRestoration, setForestRestoration] = useState(0);

    // Error handler
    const handleError = (error: Error) => {
      console.error('Forest Match Game Error:', error);
      setHasError(true);
    };

    // Reset error state
    const resetError = () => {
      setHasError(false);
      initializeGame();
    };

    // Catch errors during render
    if (hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Game Error</h3>
              <p className="text-gray-600 mb-4">Something went wrong. Please try again.</p>
              <div className="space-y-2">
                <Button onClick={resetError} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart Game
                </Button>
                <Button onClick={() => onComplete(0)} variant="outline" className="w-full">
                  Return to Games
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

  const BOARD_SIZE = 8;
  const currentLevelData = forestLevels[currentLevel] || forestLevels[0];

  // Initialize game board
  const initializeBoard = useCallback(() => {
    try {
      const board: (GameElement | null)[][] = [];
      for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
          board[row][col] = gameElements[Math.floor(Math.random() * gameElements.length)];
        }
      }
      
      setGameBoard(board);
    } catch (error) {
      console.error('Error initializing board:', error);
      // Fallback to simple board
      const fallbackBoard: (GameElement | null)[][] = Array(BOARD_SIZE).fill(null).map(() => 
        Array(BOARD_SIZE).fill(null).map(() => gameElements[0])
      );
      setGameBoard(fallbackBoard);
    }
  }, []);

  // Check for matches
  const findMatches = useCallback((board: (GameElement | null)[][]) => {
    const matches: Match[] = [];
    const processedPositions = new Set<string>();
    
    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        const element = board[row][col];
        if (element && board[row][col + 1]?.type === element.type && board[row][col + 2]?.type === element.type) {
          const match: Match = {
            positions: [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }],
            element,
            isSpecial: false
          };
          
          // Check for longer matches
          let extendCol = col + 3;
          while (extendCol < BOARD_SIZE && board[row][extendCol]?.type === element.type) {
            match.positions.push({ row, col: extendCol });
            extendCol++;
          }
          
          // Only add if positions haven't been processed
          const positionKey = match.positions.map(p => `${p.row},${p.col}`).join('|');
          if (!processedPositions.has(positionKey)) {
            matches.push(match);
            match.positions.forEach(p => processedPositions.add(`${p.row},${p.col}`));
          }
        }
      }
    }
    
    // Check vertical matches
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const element = board[row][col];
        if (element && board[row + 1][col]?.type === element.type && board[row + 2][col]?.type === element.type) {
          const match: Match = {
            positions: [{ row, col }, { row: row + 1, col }, { row: row + 2, col }],
            element,
            isSpecial: false
          };
          
          // Check for longer matches
          let extendRow = row + 3;
          while (extendRow < BOARD_SIZE && board[extendRow][col]?.type === element.type) {
            match.positions.push({ row: extendRow, col });
            extendRow++;
          }
          
          // Only add if positions haven't been processed
          const positionKey = match.positions.map(p => `${p.row},${p.col}`).join('|');
          if (!processedPositions.has(positionKey)) {
            matches.push(match);
            match.positions.forEach(p => processedPositions.add(`${p.row},${p.col}`));
          }
        }
      }
    }
    
    return matches;
  }, []);

  // Check for special combinations
  const checkSpecialCombinations = useCallback((board: (GameElement | null)[][], matches: Match[]) => {
    const specialEffects: string[] = [];
    
    matches.forEach(match => {
      // Water + Seed = Grow Tree
      if (match.element.type === 'water') {
        const seedPositions = match.positions.filter(pos => 
          board[pos.row][pos.col]?.type === 'seed'
        );
        if (seedPositions.length > 0) {
          specialEffects.push('water-seed');
        }
      }
      
      // Sun + Tree = Forest Explosion
      if (match.element.type === 'sun') {
        const treePositions = match.positions.filter(pos => 
          board[pos.row][pos.col]?.type === 'tree'
        );
        if (treePositions.length > 0) {
          specialEffects.push('sun-tree');
        }
      }
    });
    
    return specialEffects;
  }, []);

  // Remove matches and drop elements
  const removeMatches = useCallback((board: (GameElement | null)[][], matches: Match[]) => {
    try {
      let newBoard = board.map(row => [...row]);
      let totalScore = 0;
      
      matches.forEach(match => {
        match.positions.forEach(pos => {
          if (newBoard[pos.row] && newBoard[pos.row][pos.col]) {
            totalScore += newBoard[pos.row][pos.col]!.points;
            newBoard[pos.row][pos.col] = null;
          }
        });
      });
      
      // Drop elements down
      for (let col = 0; col < BOARD_SIZE; col++) {
        let writeIndex = BOARD_SIZE - 1;
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
          if (newBoard[row] && newBoard[row][col]) {
            newBoard[writeIndex][col] = newBoard[row][col];
            if (writeIndex !== row) {
              newBoard[row][col] = null;
            }
            writeIndex--;
          }
        }
        
        // Fill empty spaces with new elements
        for (let row = 0; row <= writeIndex; row++) {
          if (newBoard[row]) {
            newBoard[row][col] = gameElements[Math.floor(Math.random() * gameElements.length)];
          }
        }
      }
      
      return { newBoard, totalScore };
    } catch (error) {
      console.error('Error removing matches:', error);
      return { newBoard: board, totalScore: 0 };
    }
  }, []);

  // Handle element selection
  const handleElementClick = (row: number, col: number) => {
    try {
      if (isAnimating || !gameBoard[row] || !gameBoard[row][col]) return;
      
      if (!selectedElement) {
        setSelectedElement({ row, col });
      } else {
        const { row: selectedRow, col: selectedCol } = selectedElement;
        
        // Check if elements are adjacent
        const isAdjacent = Math.abs(row - selectedRow) + Math.abs(col - selectedCol) === 1;
        
        if (isAdjacent) {
          // Swap elements
          const newBoard = gameBoard.map(row => [...row]);
          [newBoard[row][col], newBoard[selectedRow][selectedCol]] = 
          [newBoard[selectedRow][selectedCol], newBoard[row][col]];
          
          setGameBoard(newBoard);
          setSelectedElement(null);
          setMovesLeft(prev => prev - 1);
          
          // Check for matches after swap
          setTimeout(() => {
            processMatches(newBoard);
          }, 300);
        } else {
          setSelectedElement({ row, col });
        }
      }
    } catch (error) {
      console.error('Error handling element click:', error);
      setSelectedElement(null);
    }
  };

  // Process matches and cascading effects
  const processMatches = useCallback((board: (GameElement | null)[][], depth = 0) => {
    // Prevent infinite loops
    if (depth > 10) {
      console.warn('Maximum match processing depth reached');
      setIsAnimating(false);
      return;
    }
    
    setIsAnimating(true);
    
    const matches = findMatches(board);
    if (matches.length === 0) {
      setIsAnimating(false);
      return;
    }
    
    const specialEffects = checkSpecialCombinations(board, matches);
    setSpecialEffects(specialEffects);
    
    const { newBoard, totalScore } = removeMatches(board, matches);
    setScore(prev => prev + totalScore);
    setComboCount(prev => prev + 1);
    
    // Update forest restoration based on score
    const restorationProgress = Math.min(100, (score + totalScore) / currentLevelData.targetScore * 100);
    setForestRestoration(restorationProgress);
    
    setGameBoard(newBoard);
    
    // Check for more matches after dropping with depth limit
    setTimeout(() => {
      processMatches(newBoard, depth + 1);
    }, 500);
  }, [findMatches, checkSpecialCombinations, removeMatches, score, currentLevel]);

  // Initialize game
  const initializeGame = () => {
    setCurrentLevel(0);
    setScore(0);
    setMovesLeft(forestLevels[0].moves);
    setGamePhase('intro');
    setSelectedElement(null);
    setIsAnimating(false);
    setComboCount(0);
    setSpecialEffects([]);
    setGameStarted(false);
    setForestRestoration(0);
  };

  const startGame = () => {
    setGameStarted(true);
    setGamePhase('playing');
    setMovesLeft(currentLevelData.moves);
    setSelectedElement(null);
    setIsAnimating(false);
    setComboCount(0);
    setSpecialEffects([]);
    setForestRestoration(0);
    initializeBoard();
  };

  // Reset game state in case of crash
  const resetGameState = useCallback(() => {
    setSelectedElement(null);
    setIsAnimating(false);
    setComboCount(0);
    setSpecialEffects([]);
    if (gameBoard.length === 0) {
      initializeBoard();
    }
  }, [gameBoard.length, initializeBoard]);

  // Check for level completion
  useEffect(() => {
    if (gamePhase === 'playing' && score >= currentLevelData.targetScore) {
      setGamePhase('level-complete');
    } else if (gamePhase === 'playing' && movesLeft <= 0 && score < currentLevelData.targetScore) {
      // Level failed - restart or game over
      setGamePhase('level-complete');
    }
  }, [score, movesLeft, currentLevel, gamePhase]);

  // Recovery effect for crashes
  useEffect(() => {
    if (gamePhase === 'playing' && gameBoard.length === 0) {
      console.warn('Game board is empty, attempting recovery...');
      resetGameState();
    }
  }, [gameBoard, gamePhase]);

  // Handle level completion
  const handleLevelComplete = () => {
    if (currentLevel < forestLevels.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setScore(0);
      setMovesLeft(forestLevels[currentLevel + 1].moves);
      setGamePhase('playing');
      setForestRestoration(0);
      initializeBoard();
    } else {
      setGamePhase('game-complete');
    }
  };

  // Get element color class
  const getElementColor = (element: GameElement | null) => {
    if (!element) return 'bg-gray-200';
    return element.color;
  };

  // Safety check to prevent crashes
  if (!currentLevelData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Game...</h3>
            <p className="text-gray-600 mb-4">Please wait while the game initializes.</p>
            <Button onClick={initializeGame} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
              <TreePine className="h-8 w-8" />
              Forest Match
            </CardTitle>
            <CardDescription className="text-lg">
              Match natural elements to restore the damaged forest!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🌳</div>
              <h3 className="text-xl font-semibold text-gray-800">Restore the Forest</h3>
              <p className="text-gray-600">Match 3+ elements to bring life back to nature</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gameElements.map((element) => (
                <Card key={element.id} className="text-center">
                  <CardContent className="p-4">
                    <div className="text-3xl mb-2">{element.emoji}</div>
                    <h4 className="font-semibold text-sm capitalize">{element.type}</h4>
                    <p className="text-xs text-gray-600">{element.points} points</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Special Combinations:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 💧 + 🌱 = 🌳 (Water + Seed = Grow Tree)</li>
                <li>• ☀️ + 🌳 = 🌲🌲🌲 (Sun + Tree = Forest Explosion)</li>
                <li>• Match 4+ elements for bonus points</li>
                <li>• Each level restores part of the forest</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                <Play className="h-5 w-5 mr-2" />
                Start Restoring!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'level-complete') {
    const isLevelPassed = score >= currentLevelData.targetScore;
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
              {isLevelPassed ? <Award className="h-8 w-8" /> : <Target className="h-8 w-8" />}
              {isLevelPassed ? 'Level Complete!' : 'Level Failed'}
            </CardTitle>
            <CardDescription>
              {isLevelPassed ? 'Great job! The forest is recovering!' : 'Try again to restore the forest!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-8xl mb-4">{isLevelPassed ? '🌲' : '🌱'}</div>
              <h3 className="text-2xl font-semibold text-gray-800">{currentLevelData.name}</h3>
              <p className="text-gray-600">{currentLevelData.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{comboCount}</div>
                  <div className="text-sm text-gray-600">Combos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(forestRestoration)}%</div>
                  <div className="text-sm text-gray-600">Forest Restored</div>
                </CardContent>
              </Card>
            </div>

            {specialEffects.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Special Effects Used:</h3>
                <div className="flex gap-2">
                  {specialEffects.map((effect, index) => (
                    <Badge key={index} variant="secondary" className="bg-yellow-200 text-yellow-800">
                      {effect === 'water-seed' ? '💧🌱→🌳' : '☀️🌳→🌲🌲🌲'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-center space-y-4">
              <div className="text-lg text-gray-700">
                Target: <span className="font-bold text-green-600">{currentLevelData.targetScore}</span> points
              </div>
              <div className="flex gap-4 justify-center">
                {isLevelPassed ? (
                  <Button onClick={handleLevelComplete} size="lg" className="bg-green-600 hover:bg-green-700">
                    {currentLevel < forestLevels.length - 1 ? 'Next Level' : 'Complete Game'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => setGamePhase('playing')} size="lg" className="bg-green-600 hover:bg-green-700">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'game-complete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
              <Award className="h-8 w-8" />
              Forest Restored!
            </CardTitle>
            <CardDescription>Congratulations! You've brought the forest back to life!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-8xl mb-4">🌲🌳🌲</div>
              <h3 className="text-2xl font-semibold text-gray-800">Thriving Ecosystem</h3>
              <p className="text-gray-600">The forest is now healthy and full of life!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{comboCount}</div>
                  <div className="text-sm text-gray-600">Total Combos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">Forest Restored</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center space-y-4">
              <div className="text-lg text-gray-700">
                You completed all <span className="font-bold text-green-600">{forestLevels.length}</span> levels and 
                restored the entire forest!
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={initializeGame} size="lg" className="bg-green-600 hover:bg-green-700">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Play Again
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
    <div className={`min-h-screen bg-gradient-to-b ${currentLevelData.background} p-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
                  <TreePine className="h-6 w-6" />
                  Forest Match - {currentLevelData.name}
                </CardTitle>
                <CardDescription>{currentLevelData.description}</CardDescription>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Score: {score}</span>
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Moves: {movesLeft}</span>
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">Level: {currentLevel + 1}/5</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Target: {currentLevelData.targetScore}</span>
                <span>Forest: {Math.round(forestRestoration)}%</span>
              </div>
              <Progress value={(score / currentLevelData.targetScore) * 100} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Special Effects Display */}
        {specialEffects.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold">Special Effects:</span>
                {specialEffects.map((effect, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-200 text-yellow-800">
                    {effect === 'water-seed' ? '💧🌱→🌳' : '☀️🌳→🌲🌲🌲'}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Game Board */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-8 gap-1 max-w-2xl mx-auto">
              {gameBoard && gameBoard.length > 0 ? (
                gameBoard.map((row, rowIndex) =>
                  row && row.length > 0 ? (
                    row.map((element, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${getElementColor(element)}
                          ${selectedElement?.row === rowIndex && selectedElement?.col === colIndex 
                            ? 'border-blue-500 scale-110 shadow-lg' 
                            : 'border-gray-300 hover:scale-105'
                          }
                          ${isAnimating ? 'animate-pulse' : ''}
                        `}
                        onClick={() => handleElementClick(rowIndex, colIndex)}
                      >
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {element?.emoji || '❓'}
                        </div>
                      </div>
                    ))
                  ) : null
                )
              ) : (
                <div className="col-span-8 text-center py-8 text-gray-500">
                  Loading game board...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-600">
              <p>Click two adjacent elements to swap them. Match 3+ of the same type to score points!</p>
              <p className="mt-1">Special combinations create powerful effects to help restore the forest.</p>
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetGameState}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset Board
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Forest Match Game Critical Error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">💥</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Critical Error</h3>
            <p className="text-gray-600 mb-4">The game encountered a critical error. Please refresh the page.</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default ForestMatchGame;
