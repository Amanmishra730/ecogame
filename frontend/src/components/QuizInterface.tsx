import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const quizQuestions = [
  {
    id: 1,
    question: "What percentage of plastic waste ends up in landfills?",
    options: ["30%", "50%", "79%", "90%"],
    correct: 2,
    explanation: "About 79% of plastic waste ends up in landfills or the environment."
  },
  {
    id: 2,
    question: "Which activity saves the most water at home?",
    options: ["Shorter showers", "Fixing leaks", "Using dishwasher", "Turning off tap"],
    correct: 1,
    explanation: "Fixing leaks can save thousands of gallons per year!"
  },
  {
    id: 3,
    question: "What's the most eco-friendly transportation option?",
    options: ["Electric car", "Public bus", "Bicycle", "Walking"],
    correct: 3,
    explanation: "Walking produces zero emissions and is great exercise!"
  },
  {
    id: 4,
    question: "Which energy source is completely renewable?",
    options: ["Natural gas", "Nuclear", "Solar", "Coal"],
    correct: 2,
    explanation: "Solar energy comes from the sun and will never run out."
  },
  {
    id: 5,
    question: "How long does it take for a plastic bottle to decompose?",
    options: ["50 years", "100 years", "450 years", "1000 years"],
    correct: 2,
    explanation: "Plastic bottles take about 450 years to fully decompose!"
  }
];

interface QuizInterfaceProps {
  onComplete: (score: number) => void;
}

export const QuizInterface = ({ onComplete }: QuizInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

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
            You scored {finalScore} out of {quizQuestions.length} questions
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

  return (
    <Card className="max-w-2xl mx-auto bg-white/60">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Eco Quiz</CardTitle>
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