import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const allQuizQuestions = {
  general: [
    {
      id: 1,
      question: "What percentage of plastic waste ends up in landfills?",
      options: ["30%", "50%", "79%", "90%"],
      correct: 2,
      explanation: "About 79% of plastic waste ends up in landfills or the environment."
    },
    {
      id: 2,
      question: "What's the most eco-friendly transportation option?",
      options: ["Electric car", "Public bus", "Bicycle", "Walking"],
      correct: 3,
      explanation: "Walking produces zero emissions and is great exercise!"
    },
    {
      id: 3,
      question: "Which energy source is completely renewable?",
      options: ["Natural gas", "Nuclear", "Solar", "Coal"],
      correct: 2,
      explanation: "Solar energy comes from the sun and will never run out."
    },
    {
      id: 4,
      question: "What is the main cause of deforestation?",
      options: ["Natural fires", "Agriculture", "Climate change", "Wildlife"],
      correct: 1,
      explanation: "Agriculture, especially for livestock and crops, is the leading cause of deforestation."
    },
    {
      id: 5,
      question: "Which material takes the longest to decompose?",
      options: ["Paper", "Glass", "Plastic", "Aluminum"],
      correct: 2,
      explanation: "Glass can take up to 1 million years to decompose naturally!"
    }
  ],
  climate: [
    {
      id: 1,
      question: "What is the main greenhouse gas causing climate change?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Water Vapor"],
      correct: 2,
      explanation: "Carbon dioxide is the primary greenhouse gas responsible for global warming."
    },
    {
      id: 2,
      question: "How much has global temperature risen since 1880?",
      options: ["0.5°C", "1.1°C", "2.0°C", "3.5°C"],
      correct: 1,
      explanation: "Global temperatures have risen about 1.1°C since the late 19th century."
    },
    {
      id: 3,
      question: "Which sector produces the most greenhouse gas emissions?",
      options: ["Transportation", "Electricity", "Agriculture", "Industry"],
      correct: 1,
      explanation: "Electricity and heat production account for about 25% of global emissions."
    },
    {
      id: 4,
      question: "What is the Paris Agreement's temperature goal?",
      options: ["1.5°C", "2.0°C", "3.0°C", "No specific goal"],
      correct: 1,
      explanation: "The Paris Agreement aims to limit global warming to well below 2°C, preferably 1.5°C."
    },
    {
      id: 5,
      question: "Which renewable energy source is most widely used?",
      options: ["Solar", "Wind", "Hydroelectric", "Geothermal"],
      correct: 2,
      explanation: "Hydroelectric power is the most widely used renewable energy source globally."
    }
  ],
  wildlife: [
    {
      id: 1,
      question: "How many species go extinct each day?",
      options: ["1-5", "10-20", "50-100", "200-500"],
      correct: 2,
      explanation: "Scientists estimate 10-20 species go extinct each day due to human activities."
    },
    {
      id: 2,
      question: "What percentage of the world's forests have been lost?",
      options: ["20%", "35%", "50%", "75%"],
      correct: 2,
      explanation: "About 50% of the world's original forests have been lost to human activities."
    },
    {
      id: 3,
      question: "Which animal is most important for forest regeneration?",
      options: ["Bears", "Birds", "Bees", "Elephants"],
      correct: 1,
      explanation: "Birds are crucial for seed dispersal and forest regeneration."
    },
    {
      id: 4,
      question: "What is the main threat to coral reefs?",
      options: ["Overfishing", "Ocean acidification", "Tourism", "Pollution"],
      correct: 1,
      explanation: "Ocean acidification from CO2 absorption is the biggest threat to coral reefs."
    },
    {
      id: 5,
      question: "How much of Earth's land is protected for wildlife?",
      options: ["5%", "15%", "25%", "40%"],
      correct: 1,
      explanation: "About 15% of Earth's land area is currently protected for wildlife conservation."
    }
  ],
  water: [
    {
      id: 1,
      question: "Which activity saves the most water at home?",
      options: ["Shorter showers", "Fixing leaks", "Using dishwasher", "Turning off tap"],
      correct: 1,
      explanation: "Fixing leaks can save thousands of gallons per year!"
    },
    {
      id: 2,
      question: "What percentage of Earth's water is freshwater?",
      options: ["1%", "3%", "10%", "25%"],
      correct: 1,
      explanation: "Only about 3% of Earth's water is freshwater, and most is frozen in glaciers."
    },
    {
      id: 3,
      question: "What is the main source of ocean pollution?",
      options: ["Oil spills", "Plastic waste", "Sewage", "Industrial waste"],
      correct: 1,
      explanation: "Plastic waste is the primary source of ocean pollution, with millions of tons entering annually."
    },
    {
      id: 4,
      question: "How long can a person survive without water?",
      options: ["1 day", "3 days", "1 week", "2 weeks"],
      correct: 1,
      explanation: "A person can typically survive only 3 days without water."
    },
    {
      id: 5,
      question: "What causes ocean acidification?",
      options: ["Oil spills", "CO2 absorption", "Sewage", "Overfishing"],
      correct: 1,
      explanation: "Ocean acidification is caused by the ocean absorbing excess CO2 from the atmosphere."
    }
  ],
  farming: [
    {
      id: 1,
      question: "What is sustainable agriculture?",
      options: ["Using only organic methods", "Farming that protects the environment", "Large-scale farming", "Indoor farming"],
      correct: 1,
      explanation: "Sustainable agriculture protects the environment while producing food for current and future generations."
    },
    {
      id: 2,
      question: "Which farming practice helps prevent soil erosion?",
      options: ["Monoculture", "Crop rotation", "Heavy tilling", "Chemical fertilizers"],
      correct: 1,
      explanation: "Crop rotation helps maintain soil health and prevents erosion by varying plant types."
    },
    {
      id: 3,
      question: "What percentage of global water use is for agriculture?",
      options: ["30%", "50%", "70%", "90%"],
      correct: 2,
      explanation: "Agriculture accounts for about 70% of global freshwater use."
    },
    {
      id: 4,
      question: "Which is a benefit of agroforestry?",
      options: ["Higher yields", "Biodiversity", "Lower costs", "Easier harvesting"],
      correct: 1,
      explanation: "Agroforestry combines trees with crops, increasing biodiversity and ecosystem health."
    },
    {
      id: 5,
      question: "What is the main goal of permaculture?",
      options: ["Maximum production", "Self-sustaining systems", "Low maintenance", "High profits"],
      correct: 1,
      explanation: "Permaculture aims to create self-sustaining agricultural systems that work with nature."
    }
  ],
  waste: [
    {
      id: 1,
      question: "How long does it take for a plastic bottle to decompose?",
      options: ["50 years", "100 years", "450 years", "1000 years"],
      correct: 2,
      explanation: "Plastic bottles take about 450 years to fully decompose!"
    },
    {
      id: 2,
      question: "What percentage of waste can be recycled?",
      options: ["30%", "50%", "75%", "90%"],
      correct: 2,
      explanation: "About 75% of household waste can be recycled or composted."
    },
    {
      id: 3,
      question: "Which renewable energy source is most efficient?",
      options: ["Solar", "Wind", "Hydroelectric", "Geothermal"],
      correct: 2,
      explanation: "Hydroelectric power has the highest efficiency rate among renewable energy sources."
    },
    {
      id: 4,
      question: "What is the 3R principle?",
      options: ["Reduce, Reuse, Recycle", "Read, Remember, Repeat", "Run, Rest, Recover", "Research, Review, Report"],
      correct: 0,
      explanation: "The 3R principle stands for Reduce, Reuse, Recycle - the foundation of waste management."
    },
    {
      id: 5,
      question: "Which material has the highest recycling rate?",
      options: ["Plastic", "Paper", "Glass", "Aluminum"],
      correct: 3,
      explanation: "Aluminum has the highest recycling rate at about 65%, compared to 25% for plastic."
    }
  ]
};

interface QuizInterfaceProps {
  onComplete: (score: number) => void;
  category?: string;
}

export const QuizInterface = ({ onComplete, category = "general" }: QuizInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  // Get questions for the selected category
  const quizQuestions = allQuizQuestions[category as keyof typeof allQuizQuestions] || allQuizQuestions.general;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer!");
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (selectedAnswer === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
      toast.success("Correct! +20 XP", {
        description: quizQuestions[currentQuestion].explanation
      });
    } else {
      toast.error("Not quite right!", {
        description: quizQuestions[currentQuestion].explanation
      });
    }

    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz completed
        setTimeout(() => {
          onComplete(score + (selectedAnswer === quizQuestions[currentQuestion].correct ? 1 : 0));
        }, 1000);
      }
    }, 2000);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  if (currentQuestion >= quizQuestions.length) {
    const finalScore = score;
    const percentage = (finalScore / quizQuestions.length) * 100;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-success">Quiz Complete! 🌱</CardTitle>
          <CardDescription>
            {getCategoryName(category)} - You scored {finalScore} out of {quizQuestions.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-accent">{percentage}%</div>
          <div className="space-y-2">
            <Badge 
              variant="secondary"
              className={`text-lg px-4 py-2 ${
                percentage >= 80 ? 'bg-success/10 text-success' :
                percentage >= 60 ? 'bg-accent/10 text-accent' :
                'bg-warning/10 text-warning'
              }`}
            >
              {percentage >= 80 ? 'Eco Expert!' : 
               percentage >= 60 ? 'Good Job!' : 
               'Keep Learning!'}
            </Badge>
            <p className="text-muted-foreground">
              You earned {finalScore * 20} XP!
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => onComplete(finalScore)}>
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      general: "General Environmental Awareness",
      climate: "Climate Change",
      wildlife: "Wildlife & Forests",
      water: "Water & Pollution",
      farming: "Forests, Farming & Sustainability",
      waste: "Waste, Energy & Solutions"
    };
    return categoryNames[category] || "Eco Quiz";
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white/60">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getCategoryName(category)}</CardTitle>
          <Badge variant="outline">
            {currentQuestion + 1} / {quizQuestions.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          <div className="grid gap-3">
            {question.options.map((option, index) => {
              let buttonClass = "justify-start h-auto p-4 text-left";
              
              if (showResult) {
                if (index === question.correct) {
                  buttonClass += " bg-success/10 border-success text-success";
                } else if (index === selectedAnswer && index !== question.correct) {
                  buttonClass += " bg-destructive/10 border-destructive text-destructive";
                } else {
                  buttonClass += " opacity-50";
                }
              } else if (selectedAnswer === index) {
                buttonClass += " bg-primary/10 border-primary";
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {showResult && index === question.correct && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                      {showResult && index === selectedAnswer && index !== question.correct && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      {!showResult && selectedAnswer === index && (
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      )}
                    </div>
                    <span className="flex-grow">{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {!showResult && (
          <Button 
            onClick={handleNext}
            className="w-full"
            disabled={selectedAnswer === null}
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};