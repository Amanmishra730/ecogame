import Quiz from '../models/Quiz';

export const seedQuizzes = async (): Promise<void> => {
  try {
    // Check if quizzes already exist
    const existingQuizzes = await Quiz.countDocuments();
    if (existingQuizzes > 0) {
      console.log('Quizzes already seeded');
      return;
    }

    const sampleQuizzes = [
      {
        title: "Environmental Basics",
        description: "Test your knowledge of basic environmental concepts",
        category: "environment",
        difficulty: "easy",
        questions: [
          {
            question: "What is the primary cause of global warming?",
            options: [
              "Natural climate cycles",
              "Greenhouse gas emissions",
              "Solar radiation",
              "Ocean currents"
            ],
            correctAnswer: 1,
            explanation: "Greenhouse gas emissions, particularly CO2 from human activities, are the primary cause of global warming.",
            category: "environment",
            difficulty: "easy",
            points: 10
          },
          {
            question: "Which of the following is a renewable energy source?",
            options: [
              "Coal",
              "Natural gas",
              "Solar power",
              "Nuclear power"
            ],
            correctAnswer: 2,
            explanation: "Solar power is a renewable energy source that harnesses energy from the sun.",
            category: "energy",
            difficulty: "easy",
            points: 10
          },
          {
            question: "What percentage of Earth's water is freshwater?",
            options: [
              "2.5%",
              "10%",
              "25%",
              "50%"
            ],
            correctAnswer: 0,
            explanation: "Only about 2.5% of Earth's water is freshwater, and most of it is frozen in glaciers and ice caps.",
            category: "water",
            difficulty: "easy",
            points: 10
          }
        ],
        totalPoints: 30,
        timeLimit: 5
      },
      {
        title: "Recycling Mastery",
        description: "Advanced questions about recycling and waste management",
        category: "recycling",
        difficulty: "medium",
        questions: [
          {
            question: "How long does it take for a plastic bottle to decompose?",
            options: [
              "50 years",
              "450 years",
              "1000 years",
              "Never"
            ],
            correctAnswer: 1,
            explanation: "Plastic bottles can take up to 450 years to decompose in the environment.",
            category: "recycling",
            difficulty: "medium",
            points: 15
          },
          {
            question: "Which material is NOT recyclable in most curbside programs?",
            options: [
              "Aluminum cans",
              "Glass bottles",
              "Styrofoam",
              "Cardboard"
            ],
            correctAnswer: 2,
            explanation: "Styrofoam is not recyclable in most curbside programs due to its low density and contamination issues.",
            category: "recycling",
            difficulty: "medium",
            points: 15
          }
        ],
        totalPoints: 30,
        timeLimit: 7
      }
    ];

    await Quiz.insertMany(sampleQuizzes);
    console.log('✅ Sample quizzes seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error);
  }
};

export const seedAll = async (): Promise<void> => {
  console.log('🌱 Starting database seeding...');
  await seedQuizzes();
  console.log('✅ Database seeding completed');
};
