"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAll = exports.seedQuizzes = void 0;
const Quiz_1 = __importDefault(require("../models/Quiz"));
const seedQuizzes = async () => {
    try {
        // Check if quizzes already exist
        const existingQuizzes = await Quiz_1.default.countDocuments();
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
            },
            {
                title: "Biodiversity & Animal Habitats",
                description: "Learn about animal habitats, endangered species, and biodiversity conservation",
                category: "biodiversity",
                difficulty: "medium",
                questions: [
                    {
                        question: "Which habitat is home to the Bengal Tiger?",
                        options: [
                            "Desert",
                            "Forest",
                            "Ocean",
                            "Arctic"
                        ],
                        correctAnswer: 1,
                        explanation: "Bengal Tigers live in forest habitats, particularly in India and Bangladesh.",
                        category: "biodiversity",
                        difficulty: "medium",
                        points: 15
                    },
                    {
                        question: "What is the primary threat to polar bears?",
                        options: [
                            "Poaching",
                            "Climate change",
                            "Deforestation",
                            "Pollution"
                        ],
                        correctAnswer: 1,
                        explanation: "Climate change is melting Arctic ice, which is the primary habitat for polar bears.",
                        category: "biodiversity",
                        difficulty: "medium",
                        points: 15
                    },
                    {
                        question: "Which animal is NOT endangered?",
                        options: [
                            "Giant Panda",
                            "Blue Whale",
                            "Fennec Fox",
                            "Sea Turtle"
                        ],
                        correctAnswer: 2,
                        explanation: "The Fennec Fox is not currently endangered, while the others are on the endangered species list.",
                        category: "biodiversity",
                        difficulty: "easy",
                        points: 10
                    },
                    {
                        question: "What percentage of marine species are threatened by plastic pollution?",
                        options: [
                            "25%",
                            "50%",
                            "75%",
                            "90%"
                        ],
                        correctAnswer: 2,
                        explanation: "Approximately 75% of marine species are affected by plastic pollution in some way.",
                        category: "biodiversity",
                        difficulty: "hard",
                        points: 20
                    }
                ],
                totalPoints: 60,
                timeLimit: 10
            }
        ];
        await Quiz_1.default.insertMany(sampleQuizzes);
        console.log('✅ Sample quizzes seeded successfully');
    }
    catch (error) {
        console.error('❌ Error seeding quizzes:', error);
    }
};
exports.seedQuizzes = seedQuizzes;
const seedAll = async () => {
    console.log('🌱 Starting database seeding...');
    await (0, exports.seedQuizzes)();
    console.log('✅ Database seeding completed');
};
exports.seedAll = seedAll;
//# sourceMappingURL=seedData.js.map