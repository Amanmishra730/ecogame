import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
 
const allQuizQuestionsEn = {
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

const allQuizQuestionsPa = {
  general: [
    {
      id: 1,
      question: "ਪਲਾਸਟਿਕ ਕੂੜੇ ਦਾ ਕਿੰਨਾ ਪ੍ਰਤੀਸ਼ਤ ਲੈਂਡਫਿਲ ਵਿੱਚ ਪਹੁੰਚਦਾ ਹੈ?",
      options: ["30%", "50%", "79%", "90%"],
      correct: 2,
      explanation: "ਲਗਭਗ 79% ਪਲਾਸਟਿਕ ਕੂੜਾ ਲੈਂਡਫਿਲ ਜਾਂ ماحول ਵਿੱਚ ਹੀ ਰਹਿ ਜਾਂਦਾ ਹੈ।"
    },
    {
      id: 2,
      question: "ਸਭ ਤੋਂ ਵੱਧ ਪਰਿਆਵਰਣ-ਦੋਸਤ ਯਾਤਰਾ ਵਿਕਲਪ ਕਿਹੜਾ ਹੈ?",
      options: ["ਇਲੈਕਟ੍ਰਿਕ ਕਾਰ", "ਪਬਲਿਕ ਬਸ", "ਸਾਈਕਲ", "ਪੈਦਲ"],
      correct: 3,
      explanation: "ਪੈਦਲ ਜਾਣ ਨਾਲ ਉਤਸਰਜਨ ਜ਼ੀਰੋ ਹੁੰਦਾ ਹੈ ਅਤੇ ਇਹ ਸਿਹਤ ਲਈ ਵੀ ਚੰਗਾ ਹੈ।"
    },
    {
      id: 3,
      question: "ਕਿਹੜਾ ਊਰਜਾ ਸਰੋਤ ਪੂਰੀ ਤਰ੍ਹਾਂ ਨਵੀਨੀਕਰਣਯੋਗ ਹੈ?",
      options: ["ਨੇਚਰਲ ਗੈਸ", "ਨਿਊਕਲਿਅਰ", "ਸੋਲਰ", "ਕੋਲਾ"],
      correct: 2,
      explanation: "ਸੂਰਜੀ ਊਰਜਾ ਸੂਰਜ ਤੋਂ ਆਉਂਦੀ ਹੈ ਅਤੇ ਕਦੇ ਖਤਮ ਨਹੀਂ ਹੁੰਦੀ।"
    },
    {
      id: 4,
      question: "ਜੰਗਲ ਕੱਟ ਦੇ ਮੁੱਖ ਕਾਰਨ ਕੀ ਹਨ?",
      options: ["ਕੁਦਰਤੀ ਅੱਗ", "ਖੇਤੀਬਾੜੀ", "ਜਲਵਾਯੁ ਪਰਿਵਰਤਨ", "ਜੀਵ ਜੰਤੂ"],
      correct: 1,
      explanation: "ਖੇਤੀਬਾੜੀ, ਖ਼ਾਸ ਕਰਕੇ ਪਸ਼ੂ ਪਾਲਣ ਅਤੇ ਫਸਲਾਂ ਲਈ, ਜੰਗਲ ਕੱਟ ਦਾ ਸਭ ਤੋਂ ਵੱਡਾ ਕਾਰਨ ਹੈ।"
    },
    {
      id: 5,
      question: "ਕਿਹੜਾ ਪਦਾਰਥ ਸਭ ਤੋਂ ਲੰਮੇ ਸਮੇਂ ਵਿਚ ਖਤਮ ਹੁੰਦਾ ਹੈ?",
      options: ["ਕਾਗਜ਼", "ਕੱਚ", "ਪਲਾਸਟਿਕ", "ਐਲੂਮੀਨੀਅਮ"],
      correct: 2,
      explanation: "ਕੱਚ ਨੂੰ ਕੁਦਰਤੀ ਤੌਰ 'ਤੇ ਖਤਮ ਹੋਣ ਵਿੱਚ 10 ਲੱਖ ਸਾਲ ਤੱਕ ਲੱਗ ਸਕਦੇ ਹਨ!"
    }
  ],
  climate: [
    {
      id: 1,
      question: "ਜਲਵਾਯੂ ਪਰਿਵਰਤਨ ਦਾ ਮੁੱਖ ਗ੍ਰੀਨਹਾਊਸ ਗੈਸ ਕਿਹੜੀ ਹੈ?",
      options: ["ਆਕਸੀਜਨ", "ਨਾਈਟ੍ਰੋਜਨ", "ਕਾਰਬਨ ਡਾਇਆਕਸਾਈਡ", "ਵਾਟਰ ਵੇਪਰ"],
      correct: 2,
      explanation: "ਕਾਰਬਨ ਡਾਇਆਕਸਾਈਡ ਗ్లోਬਲ ਵਾਰਮਿੰਗ ਲਈ ਮੁੱਖ ਜ਼ਿੰਮੇਵਾਰ ਗੈਸ ਹੈ।"
    },
    {
      id: 2,
      question: "1880 ਤੋਂ ਗਲੋਬਲ ਤਾਪਮਾਨ ਕਿੰਨਾ ਵੱਧਿਆ ਹੈ?",
      options: ["0.5°C", "1.1°C", "2.0°C", "3.5°C"],
      correct: 1,
      explanation: "ਉੱਨੀਵੀਂ ਸਦੀ ਦੇ ਅੰਤ ਤੋਂ ਤਾਪਮਾਨ ਲਗਭਗ 1.1°C ਵੱਧਿਆ ਹੈ।"
    },
    {
      id: 3,
      question: "ਸਭ ਤੋਂ ਵੱਧ ਉਤਸਰਜਨ ਕਿਹੜੇ ਖੇਤਰ ਤੋਂ ਹੁੰਦਾ ਹੈ?",
      options: ["ਆਵਾਜਾਈ", "ਬਿਜਲੀ", "ਖੇਤੀਬਾੜੀ", "ਉਦਯੋਗ"],
      correct: 1,
      explanation: "ਬਿਜਲੀ ਅਤੇ ਹੀਟ ਉਤਪਾਦਨ ਲਗਭਗ 25% ਗਲੋਬਲ ਉਤਸਰਜਨ ਲਈ ਜ਼ਿੰਮੇਵਾਰ ਹੈ।"
    },
    {
      id: 4,
      question: "ਪੈਰਿਸ ਸਮਝੌਤੇ ਦਾ ਤਾਪਮਾਨ ਲਕਸ਼ ਕੀ ਹੈ?",
      options: ["1.5°C", "2.0°C", "3.0°C", "ਕੋਈ ਲਕਸ਼ ਨਹੀਂ"],
      correct: 1,
      explanation: "ਪੈਰਿਸ ਸਮਝੌਤਾ ਗਲੋਬਲ ਵਾਰਮਿੰਗ ਨੂੰ 2°C ਤੋਂ ਘੱਟ, ਸੰਭਵ ਹੋਵੇ ਤਾਂ 1.5°C ਤੱਕ ਸੀਮਿਤ ਕਰਨ ਦਾ ਲਕਸ਼ ਰੱਖਦਾ ਹੈ।"
    },
    {
      id: 5,
      question: "ਸਭ ਤੋਂ ਵੱਧ ਵਰਤੀ ਜਾਣ ਵਾਲਾ ਨਵੀਨੀਕਰਣਯੋਗ ਊਰਜਾ ਸਰੋਤ ਕਿਹੜਾ ਹੈ?",
      options: ["ਸੋਲਰ", "ਵਿੰਡ", "ਹਾਈਡ੍ਰੋਇਲੈਕਟ੍ਰਿਕ", "ਜੀਓਥਰਮਲ"],
      correct: 2,
      explanation: "ਦੁਨੀਆ ਭਰ ਵਿੱਚ ਹਾਈਡ੍ਰੋਇਲੈਕਟ੍ਰਿਕ ਊਰਜਾ ਸਭ ਤੋਂ ਵੱਧ ਵਰਤੀ ਜਾਂਦੀ ਹੈ।"
    }
  ],
  wildlife: [
    {
      id: 1,
      question: "ਹਰ ਰੋਜ਼ ਕਿੰਨੀ ਪ੍ਰਜਾਤੀਆਂ ਲੁਪਤ ਹੁੰਦੀਆਂ ਹਨ?",
      options: ["1-5", "10-20", "50-100", "200-500"],
      correct: 2,
      explanation: "ਵਿਗਿਆਨੀਆਂ ਅਨੁਮਾਨ ਲਗਾਂਦੇ ਹਨ ਕਿ ਮਨੁੱਖੀ ਗਤਿਵਿਧੀਆਂ ਕਾਰਨ ਰੋਜ਼ਾਨਾ 10-20 ਪ੍ਰਜਾਤੀਆਂ ਲੁਪਤ ਹੁੰਦੀਆਂ ਹਨ।"
    },
    {
      id: 2,
      question: "ਦੁਨੀਆ ਦੇ ਜੰਗਲਾਂ ਦਾ ਕਿੰਨਾ ਪ੍ਰਤੀਸ਼ਤ ਖੋ ਗਿਆ ਹੈ?",
      options: ["20%", "35%", "50%", "75%"],
      correct: 2,
      explanation: "ਲਗਭਗ 50% ਮੂਲ ਜੰਗਲ ਮਨੁੱਖੀ ਗਤਿਵਿਧੀਆਂ ਕਾਰਨ ਖੋ ਗਏ ਹਨ।"
    },
    {
      id: 3,
      question: "ਜੰਗਲ ਪੁਨਰਜਨਮ ਲਈ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਜੀਵ ਕਿਹੜਾ ਹੈ?",
      options: ["ਭਾਲੂ", "ਪੰਛੀਆਂ", "ਮੱਖੀਆਂ", "ਹਾਥੀ"],
      correct: 1,
      explanation: "ਬੀਜ ਫੈਲਾਉਣ ਅਤੇ ਜੰਗਲ ਪੁਨਰਜਨਮ ਲਈ ਪੰਛੀ ਬਹੁਤ ਜ਼ਰੂਰੀ ਹਨ।"
    },
    {
      id: 4,
      question: "ਕੋਰਲ ਰੀਫ ਲਈ ਮੁੱਖ ਖਤਰਾ ਕੀ ਹੈ?",
      options: ["ਅਧਿਕ ਮੱਛੀ ਪਕੜ", "ਸਮੁੰਦਰੀ ਅਮਲੀਕਰਨ", "ਟੂਰਿਜ਼ਮ", "ਪ੍ਰਦੂਸ਼ਣ"],
      correct: 1,
      explanation: "CO2 ਅਵਸ਼ੋਸ਼ਣ ਨਾਲ ਸਮੁੰਦਰੀ ਅਮਲੀਕਰਨ ਕੋਰਲ ਰੀਫ ਲਈ ਸਭ ਤੋਂ ਵੱਡਾ ਖਤਰਾ ਹੈ।"
    },
    {
      id: 5,
      question: "ਧਰਤੀ ਦੇ ਕਿੰਨੇ ਹਿੱਸੇ ਨੂੰ ਵਾਈਲਡਲਾਈਫ ਲਈ ਸੰਰੱਖਿਤ ਕੀਤਾ ਗਿਆ ਹੈ?",
      options: ["5%", "15%", "25%", "40%"],
      correct: 1,
      explanation: "ਫਿਲਹਾਲ ਧਰਤੀ ਦੇ ਲਗਭਗ 15% ਭੂਮੀ ਖੇਤਰ ਨੂੰ ਵਾਈਲਡਲਾਈਫ ਸੰਰਕਸ਼ਣ ਲਈ ਰੱਖਿਆ ਗਿਆ ਹੈ।"
    }
  ],
  water: [
    {
      id: 1,
      question: "ਘਰ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ਪਾਣੀ ਬਚਾਉਣ ਵਾਲੀ ਕਿਰਿਆ ਕਿਹੜੀ ਹੈ?",
      options: ["ਛੋਟੀਆਂ ਸ਼ਾਵਰ", "ਲੀਕ ਠੀਕ ਕਰਨਾ", "ਡਿਸ਼ਵਾਸ਼ਰ ਵਰਤਣਾ", "ਟੈਪ ਬੰਦ ਕਰਨਾ"],
      correct: 1,
      explanation: "ਲੀਕ ਠੀਕ ਕਰਨ ਨਾਲ ਸਾਲ ਵਿੱਚ ਹਜ਼ਾਰਾਂ ਗੈਲਨ ਪਾਣੀ ਬਚ ਸਕਦਾ ਹੈ!"
    },
    {
      id: 2,
      question: "ਧਰਤੀ ਦੇ ਪਾਣੀ ਵਿਚੋਂ ਮਿੱਠੇ ਪਾਣੀ ਦਾ ਹਿੱਸਾ ਕਿੰਨਾ ਹੈ?",
      options: ["1%", "3%", "10%", "25%"],
      correct: 1,
      explanation: "ਕੇਵਲ ਲਗਭਗ 3% ਪਾਣੀ ਮਿੱਠਾ ਹੈ ਅਤੇ ਇਸ ਵਿਚੋਂ ਵਧੇਰੇ ਬਰਫ਼ਾਨਿਆਂ ਵਿੱਚ ਜੰਮਿਆ ਹੈ।"
    },
    {
      id: 3,
      question: "ਸਮੁੰਦਰ ਪ੍ਰਦੂਸ਼ਣ ਦਾ ਮੁੱਖ ਸਰੋਤ ਕੀ ਹੈ?",
      options: ["ਆਇਲ ਸਪਿਲ", "ਪਲਾਸਟਿਕ ਕੂੜਾ", "ਸੀਵਰੇਜ", "ਉਦਯੋਗਿਕ ਕੂੜਾ"],
      correct: 1,
      explanation: "ਸਮੁੰਦਰ ਵਿੱਚ ਪ੍ਰਤੀ ਸਾਲ ਮਿਲੀਅਨ ਟਨ ਪਲਾਸਟਿਕ ਦਾਖਲ ਹੁੰਦਾ ਹੈ, ਜੋ ਮੁੱਖ ਪ੍ਰਦੂਸ਼ਣ ਹੈ।"
    },
    {
      id: 4,
      question: "ਬਿਨਾਂ ਪਾਣੀ ਦੇ ਇਨਸਾਨ ਕਿੰਨਾ ਸਮਾਂ ਜੀ ਸਕਦਾ ਹੈ?",
      options: ["1 ਦਿਨ", "3 ਦਿਨ", "1 ਹਫ਼ਤਾ", "2 ਹਫ਼ਤੇ"],
      correct: 1,
      explanation: "ਅਮੂਮਨ ਇਨਸਾਨ 3 ਦਿਨ ਤੋਂ ਵੱਧ ਬਿਨਾਂ ਪਾਣੀ ਦੇ ਨਹੀਂ ਰਹਿ ਸਕਦਾ।"
    },
    {
      id: 5,
      question: "ਸਮੁੰਦਰੀ ਅਮਲੀਕਰਨ ਦਾ ਕਾਰਨ ਕੀ ਹੈ?",
      options: ["ਆਇਲ ਸਪਿਲ", "CO2 ਅਵਸ਼ੋਸ਼ਣ", "ਸੀਵਰੇਜ", "ਅਧਿਕ ਮੱਛੀ ਪਕੜ"],
      correct: 1,
      explanation: "ਵਾਤਾਵਰਨ ਤੋਂ ਵੱਧ CO2 ਸਮੁੰਦਰ ਦੁਆਰਾ ਸੋਖਿਆ ਜਾਣ ਕਾਰਨ ਅਮਲੀਕਰਨ ਹੁੰਦਾ ਹੈ।"
    }
  ],
  farming: [
    {
      id: 1,
      question: "ਸਸਟੇਨੇਬਲ ਖੇਤੀਬਾੜੀ ਕੀ ਹੈ?",
      options: ["ਕੇਵਲ ਆਰਗੈਨਿਕ ਤਰੀਕੇ", "ਪਰੀਵਰਣ ਦੀ ਰੱਖਿਆ ਕਰਨ ਵਾਲੀ ਖੇਤੀ", "ਵੱਡੇ ਪੱਧਰ ਦੀ ਖੇਤੀ", "ਇੰਡੋਰ ਫਾਰਮਿੰਗ"],
      correct: 1,
      explanation: "ਸਸਟੇਨੇਬਲ ਖੇਤੀ ਮੌਜੂਦਾ ਅਤੇ ਭਵਿੱਖੀ ਪੀੜ੍ਹੀਆਂ ਲਈ ਖੁਰਾਕ ਉਤਪਾਦਨ ਕਰਦੇ ਹੋਏ ਪਰੀਵਰਣ ਦੀ ਰੱਖਿਆ ਕਰਦੀ ਹੈ।"
    },
    {
      id: 2,
      question: "ਕਿਹੜੀ ਪ੍ਰਕ੍ਰਿਆ ਮਿੱਟੀ ਕਟਾਅ ਨੂੰ ਰੋਕਦੀ ਹੈ?",
      options: ["ਇੱਕੋ ਫਸਲ", "ਫਸਲ ਚੱਕਰ", "ਭਾਰੀ ਜੋਤ", "ਰਸਾਇਣਕ ਖਾਦ"],
      correct: 1,
      explanation: "ਫਸਲ ਚੱਕਰ ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਬਣਾਈ ਰੱਖਣ ਅਤੇ ਕਟਾਅ ਰੋਕਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।"
    },
    {
      id: 3,
      question: "ਕ੍ਰਿਸ਼ੀ ਲਈ ਗਲੋਬਲ ਪਾਣੀ ਦਾ ਹਿੱਸਾ ਕਿੰਨਾ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ?",
      options: ["30%", "50%", "70%", "90%"],
      correct: 2,
      explanation: "ਕ੍ਰਿਸ਼ੀ ਕੁੱਲ ਮਿੱਠੇ ਪਾਣੀ ਦੇ ਵਰਤੋਂ ਵਿੱਚ ਲਗਭਗ 70% ਦੀ ਹਿੱਸੇਦਾਰੀ ਕਰਦੀ ਹੈ।"
    },
    {
      id: 4,
      question: "ਐਗਰੋਫਾਰੇਸਟਰੀ ਦਾ ਲਾਭ ਕਿਹੜਾ ਹੈ?",
      options: ["ਵੱਧ ਉਪਜ", "ਜੈਵਿਕ ਵਿਭਿੰਨਤਾ", "ਘੱਟ ਖਰਚ", "ਆਸਾਨ ਕਟਾਈ"],
      correct: 1,
      explanation: "ਰੁੱਖਾਂ ਨੂੰ ਫਸਲਾਂ ਨਾਲ ਜੋੜ ਕੇ ਐਗਰੋਫਾਰੇਸਟਰੀ ਜੈਵ ਵਿਭਿੰਨਤਾ ਅਤੇ ਇਕੋ-ਸਿਸਟਮ ਸਿਹਤ ਵਧਾਉਂਦੀ ਹੈ।"
    },
    {
      id: 5,
      question: "ਪਰਮਾਕਲਚਰ ਦਾ ਮੁੱਖ ਉਦੇਸ਼ ਕੀ ਹੈ?",
      options: ["ਅਧਿਕ ਉਤਪਾਦਨ", "ਸਵੈ-ਸਹਾਰਾ ਪ੍ਰਣਾਲੀ", "ਘੱਟ ਦੇਖਭਾਲ", "ਉੱਚ ਮੋਨਾਫਾ"],
      correct: 1,
      explanation: "ਪਰਮਾਕਲਚਰ ਕੁਦਰਤ ਨਾਲ ਮਿਲ ਕੇ ਸਵੈ-ਸਹਾਰਾ ਕ੍ਰਿਸ਼ੀ ਪ੍ਰਣਾਲੀਆਂ ਬਣਾਉਣ ਦਾ ਉਦੇਸ਼ ਰੱਖਦੀ ਹੈ।"
    }
  ],
  waste: [
    {
      id: 1,
      question: "ਪਲਾਸਟਿਕ ਬੋਤਲ ਨੂੰ ਖਤਮ ਹੋਣ ਵਿੱਚ ਕਿੰਨਾ ਸਮਾਂ ਲੱਗਦਾ ਹੈ?",
      options: ["50 ਸਾਲ", "100 ਸਾਲ", "450 ਸਾਲ", "1000 ਸਾਲ"],
      correct: 2,
      explanation: "ਪਲਾਸਟਿਕ ਬੋਤਲਾਂ ਨੂੰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਖਤਮ ਹੋਣ ਵਿੱਚ ਲਗਭਗ 450 ਸਾਲ ਲੱਗਦੇ ਹਨ!"
    },
    {
      id: 2,
      question: "ਕੂੜੇ ਦਾ ਕਿੰਨਾ ਪ੍ਰਤੀਸ਼ਤ ਰੀਸਾਇਕਲ ਹੋ ਸਕਦਾ ਹੈ?",
      options: ["30%", "50%", "75%", "90%"],
      correct: 2,
      explanation: "ਘਰੇਲੂ ਕੂੜੇ ਦਾ ਲਗਭਗ 75% ਰੀਸਾਇਕਲ ਜਾਂ ਕੰਪੋਸਟ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ।"
    },
    {
      id: 3,
      question: "ਸਭ ਤੋਂ ਦੱਖਣ ਨਵੀਨੀਕਰਣਯੋਗ ਊਰਜਾ ਸਰੋਤ ਕਿਹੜਾ ਹੈ?",
      options: ["ਸੋਲਰ", "ਵਿੰਡ", "ਹਾਈਡ੍ਰੋਇਲੈਕਟ੍ਰਿਕ", "ਜੀਓਥਰਮਲ"],
      correct: 2,
      explanation: "ਨਵੀਨੀਕਰਣਯੋਗ ਊਰਜਾ ਸਰੋਤਾਂ ਵਿੱਚ ਹਾਈਡ੍ਰੋਇਲੈਕਟ੍ਰਿਕ ਦੀ ਦੱਖਣਤਾ ਸਭ ਤੋਂ ਵੱਧ ਹੁੰਦੀ ਹੈ।"
    },
    {
      id: 4,
      question: "3R ਸੁਤੰਤਰਤਾ ਕੀ ਹੈ?",
      options: ["Reduce, Reuse, Recycle", "Read, Remember, Repeat", "Run, Rest, Recover", "Research, Review, Report"],
      correct: 0,
      explanation: "3R ਦਰਸਾਉਂਦਾ ਹੈ: ਘਟਾਓ, ਦੁਬਾਰਾ ਵਰਤੋ, ਰੀਸਾਇਕਲ ਕਰੋ — ਵੇਸਟ ਮੈਨੇਜਮੈਂਟ ਦੀ ਬੁਨਿਆਦ।"
    },
    {
      id: 5,
      question: "ਕਿਹੜੇ ਪਦਾਰਥ ਦੀ ਰੀਸਾਇਕਲਿੰਗ ਦਰ ਸਭ ਤੋਂ ਵੱਧ ਹੈ?",
      options: ["ਪਲਾਸਟਿਕ", "ਕਾਗਜ਼", "ਕੱਚ", "ਐਲੂਮੀਨੀਅਮ"],
      correct: 3,
      explanation: "ਐਲੂਮੀਨੀਅਮ ਦੀ ਰੀਸਾਇਕਲਿੰਗ ਦਰ ਲਗਭਗ 65% ਹੈ, ਜਦਕਿ ਪਲਾਸਟਿਕ ਦੀ ਲਗਭਗ 25% ਹੈ।"
    }
  ]
};

interface QuizInterfaceProps {
  onComplete: (score: number) => void;
  category?: string;
}

export const QuizInterface = ({ onComplete, category = "general" }: QuizInterfaceProps) => {
  const { locale } = useI18n();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [fsQuestions, setFsQuestions] = useState<any[] | null>(null);

  // Get questions for the selected category
  const source = locale === "pa" ? allQuizQuestionsPa : allQuizQuestionsEn;
  const isFirestoreQuiz = category.startsWith("firestore:");
  const quizQuestions = useMemo(() => {
    if (isFirestoreQuiz && fsQuestions) {
      return fsQuestions.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        correct: q.correctAnswer,
        explanation: q.explanation || "",
      }));
    }
    return (source as any)[category] || (source as any).general;
  }, [isFirestoreQuiz, fsQuestions, source, category]);

  useEffect(() => {
    (async () => {
      if (!isFirestoreQuiz) return;
      const quizId = category.replace("firestore:", "");
      const snap = await getDocs(collection(doc(db, 'quizzes', quizId), 'questions'));
      const items = snap.docs.map(d => d.data());
      setFsQuestions(items as any[]);
    })();
  }, [category, isFirestoreQuiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast.error(locale === "pa" ? "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਉੱਤਰ ਚੁਣੋ!" : "Please select an answer!");
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (selectedAnswer === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
      toast.success(locale === "pa" ? "ਸਹੀ! +20 ਐਕਸਪੀ" : "Correct! +20 XP", {
        description: quizQuestions[currentQuestion].explanation
      });
    } else {
      toast.error(locale === "pa" ? "ਹਾਲੇ ਸਹੀ ਨਹੀਂ!" : "Not quite right!", {
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
          <CardTitle className="text-2xl text-success">{locale === "pa" ? "ਕੁਇਜ਼ ਸਮਾਪਤ! 🌱" : "Quiz Complete! 🌱"}</CardTitle>
          <CardDescription>
            {getCategoryName(category)} - {locale === "pa" ? "ਤੁਸੀਂ ਸਕੋਰ ਕੀਤਾ" : "You scored"} {finalScore} {locale === "pa" ? "ਵਿੱਚੋਂ" : "out of"} {quizQuestions.length} {locale === "pa" ? "ਸਵਾਲ" : "questions"}
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
              {percentage >= 80 ? (locale === "pa" ? 'ਇਕੋ ਐਕਸਪਰਟ!' : 'Eco Expert!') : 
               percentage >= 60 ? (locale === "pa" ? 'ਵਧੀਆ ਕੰਮ!' : 'Good Job!') : 
               (locale === "pa" ? 'ਸਿੱਖਦੇ ਰਹੋ!' : 'Keep Learning!')}
            </Badge>
            <p className="text-muted-foreground">
              {locale === "pa" ? 'ਤੁਹਾਨੂੰ ਮਿਲੇ' : 'You earned'} {finalScore * 20} {locale === "pa" ? 'ਐਕਸਪੀ!' : 'XP!'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              {locale === "pa" ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : 'Try Again'}
            </Button>
            <Button onClick={() => onComplete(finalScore)}>
              {locale === "pa" ? 'ਸਿੱਖਣਾ ਜਾਰੀ ਰੱਖੋ' : 'Continue Learning'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCategoryName = (category: string) => {
    if (locale === "pa") {
      const pa: { [key: string]: string } = {
        general: "ਸਧਾਰਣ ਪਰਿਆਵਰਣ ਜਾਗਰੂਕਤਾ",
        climate: "ਜਲਵਾਯੂ ਪਰਿਵਰਤਨ",
        wildlife: "ਵਾਈਲਡਲਾਈਫ ਅਤੇ ਜੰਗਲ",
        water: "ਪਾਣੀ ਅਤੇ ਪ੍ਰਦੂਸ਼ਣ",
        farming: "ਜੰਗਲ, ਖੇਤੀ ਅਤੇ ਸੱਸਟੇਨਬਿਲਿਟੀ",
        waste: "ਕੂੜਾ, ਊਰਜਾ ਅਤੇ ਹੱਲ"
      };
      return pa[category] || "ਇਕੋ ਕੁਇਜ਼";
    }
    const en: { [key: string]: string } = {
      general: "General Environmental Awareness",
      climate: "Climate Change",
      wildlife: "Wildlife & Forests",
      water: "Water & Pollution",
      farming: "Forests, Farming & Sustainability",
      waste: "Waste, Energy & Solutions"
    };
    return en[category] || "Eco Quiz";
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
            {currentQuestion === quizQuestions.length - 1 
              ? (locale === "pa" ? 'ਕੁਇਜ਼ ਸਮਾਪਤ' : 'Finish Quiz') 
              : (locale === "pa" ? 'ਅਗਲਾ ਸਵਾਲ' : 'Next Question')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};