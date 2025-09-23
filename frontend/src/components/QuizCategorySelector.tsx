import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Cloud, 
  Trees, 
  Droplets, 
  Sprout, 
  Recycle,
  ArrowLeft,
  Brain
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";

const quizCategories = [
  {
    id: "general",
    name: "General Environmental Awareness",
    description: "Test your overall knowledge about environmental issues and sustainability",
    icon: Brain,
    color: "bg-blue-500",
    questions: 5
  },
  {
    id: "climate",
    name: "Climate Change",
    description: "Learn about global warming, carbon emissions, and climate solutions",
    icon: Cloud,
    color: "bg-orange-500",
    questions: 5
  },
  {
    id: "wildlife",
    name: "Wildlife & Forests",
    description: "Explore biodiversity, forest conservation, and wildlife protection",
    icon: Trees,
    color: "bg-green-500",
    questions: 5
  },
  {
    id: "water",
    name: "Water & Pollution",
    description: "Understand water conservation, pollution control, and marine life",
    icon: Droplets,
    color: "bg-cyan-500",
    questions: 5
  },
  {
    id: "farming",
    name: "Forests, Farming & Sustainability",
    description: "Discover sustainable agriculture, forest management, and food systems",
    icon: Sprout,
    color: "bg-emerald-500",
    questions: 5
  },
  {
    id: "waste",
    name: "Waste, Energy & Solutions",
    description: "Master recycling, renewable energy, and waste reduction strategies",
    icon: Recycle,
    color: "bg-purple-500",
    questions: 5
  }
];

interface QuizCategorySelectorProps {
  onSelectCategory: (category: string) => void;
  onBack: () => void;
}

export const QuizCategorySelector = ({ onSelectCategory, onBack }: QuizCategorySelectorProps) => {
  const [customQuizzes, setCustomQuizzes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Only show quizzes that are explicitly active
        const q = query(
          collection(db, 'quizzes'),
          where('isActive', '==', true),
          orderBy('title'),
          limit(30)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setCustomQuizzes(items);
      } catch (e) {
        // fail silently in UI, keep defaults
        console.warn('Failed to load custom quizzes', e);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Choose Your Quiz Category</CardTitle>
              <CardDescription>
                Select a topic that interests you and test your environmental knowledge!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card 
              key={category.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-white/60"
              onClick={() => onSelectCategory(category.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${category.color} text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.questions} questions
                  </Badge>
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
                <Button 
                  className="w-full mt-4"
                  variant="outline"
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {customQuizzes.length > 0 && (
        <Card className="bg-white/60">
          <CardHeader>
            <CardTitle className="text-xl">Your Quizzes</CardTitle>
            <CardDescription>Quizzes created in your Firebase project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customQuizzes.map(q => (
                <Card key={q.id} className="hover:shadow-lg transition-all bg-white/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{q.title}</CardTitle>
                    <CardDescription className="text-xs">{q.category} • {q.difficulty}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm line-clamp-3">{q.description}</CardDescription>
                    <Button className="w-full mt-3" onClick={() => onSelectCategory(`firestore:${q.id}`)}>Start Quiz</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card className="bg-white/60">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Quiz Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground">30 Total Questions</div>
                <div>5 questions per category</div>
              </div>
              <div>
                <div className="font-medium text-foreground">20 XP per Question</div>
                <div>Earn points for correct answers</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Instant Feedback</div>
                <div>Learn with explanations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
