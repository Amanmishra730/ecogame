import { useEffect, useState } from "react";
import { 
  Trophy, 
  Star, 
  Leaf, 
  Droplet,
  Recycle,
  TreePine,
  Flower2,
  Award,
  Target
} from "lucide-react";

interface FloatingElement {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const GamingBackground = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  const icons = [Trophy, Star, Leaf, Droplet, Recycle, TreePine, Flower2, Award, Target];

  useEffect(() => {
    const createElements = () => {
      const newElements: FloatingElement[] = [];
      for (let i = 0; i < 12; i++) {
        newElements.push({
          id: i,
          icon: icons[Math.floor(Math.random() * icons.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 15,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 5,
        });
      }
      setElements(newElements);
    };

    createElements();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/forest-bg.jpg')" }}
      />
      
      {/* Floating nature elements */}
      {elements.map((element) => {
        const Icon = element.icon;
        return (
          <div
            key={element.id}
            className="absolute animate-float opacity-15 hover:opacity-25 transition-opacity"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDuration: `${element.duration}s`,
              animationDelay: `${element.delay}s`,
              fontSize: `${element.size}px`,
            }}
          >
            <div 
              className="text-eco-bright animate-spin"
              style={{ 
                animationDuration: `${element.duration * 2}s`,
                animationDirection: Math.random() > 0.5 ? 'normal' : 'reverse'
              }}
            >
              <Icon />
            </div>
          </div>
        );
      })}

      {/* Floating leaf particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`leaf-${i}`}
            className="absolute w-2 h-2 bg-eco-bright/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Corner nature decorative elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <TreePine className="w-16 h-16 text-eco-bright animate-bounce" style={{ animationDuration: '3s' }} />
      </div>
      <div className="absolute bottom-4 left-4 opacity-10">
        <Leaf className="w-12 h-12 text-success animate-bounce" style={{ 
          animationDuration: '4s',
          animationDelay: '1s' 
        }} />
      </div>
      <div className="absolute top-1/3 left-8 opacity-10">
        <Flower2 className="w-8 h-8 text-accent animate-spin" style={{ animationDuration: '6s' }} />
      </div>
      <div className="absolute bottom-1/3 right-8 opacity-10">
        <Droplet className="w-10 h-10 text-eco-bright animate-pulse" style={{ animationDuration: '5s' }} />
      </div>
    </div>
  );
};