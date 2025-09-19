import { Request, Response } from 'express';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { Parser } from 'json2csv';

export const getQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, limit = 10, offset = 0, includeInactive } = req.query;
    
    const filter: any = { isActive: includeInactive ? { $in: [true, false] } : true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter)
      .select('title description category difficulty totalPoints timeLimit questions')
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuizById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id).select('title description category difficulty totalPoints timeLimit questions');
    
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const quiz = await Quiz.create(body);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(400).json({ error: 'Invalid quiz payload' });
  }
};

export const updateQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body;
    const quiz = await Quiz.findByIdAndUpdate(id, body, { new: true });
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }
    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(400).json({ error: 'Invalid update payload' });
  }
};

export const approveQuestion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { quizId, questionIndex, approved } = req.body as { quizId: string; questionIndex: number; approved: boolean };
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }
    if (!quiz.questions[questionIndex]) {
      res.status(400).json({ error: 'Question index out of range' });
      return;
    }
    (quiz.questions[questionIndex] as any).approved = approved;
    await quiz.save();
    res.json({ success: true, data: quiz.questions[questionIndex] });
  } catch (error) {
    console.error('Approve question error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
};

export const exportQuizzesCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const quizzes = await Quiz.find({}) as any[];
    const rows = quizzes.flatMap((q: any) => q.questions.map((question: any, idx: number) => ({
      quizId: (q._id as any)?.toString?.() ?? String(q.id ?? ''),
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      questionIndex: idx,
      question: question.question,
      optionA: question.options[0],
      optionB: question.options[1],
      optionC: question.options[2],
      optionD: question.options[3],
      correctAnswer: question.correctAnswer,
      points: question.points,
      approved: (question as any).approved ?? false
    })));
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('quizzes.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

export const submitQuizAttempt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { quizId, answers } = req.body;
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get the quiz to validate answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Calculate score and XP
    let correctAnswers = 0;
    let totalScore = 0;
    const processedAnswers = answers.map((answer: any, index: number) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points;
      }

      return {
        questionId: (question as any)?._id?.toString?.() ?? String(index),
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0
      };
    });

    const xpEarned = Math.floor(totalScore * 2); // 2 XP per point
    const timeSpent = answers.reduce((total: number, answer: any) => total + (answer.timeSpent || 0), 0);

    // Create quiz attempt record
    const quizAttempt = new QuizAttempt({
      userId: firebaseUid,
      quizId,
      answers: processedAnswers,
      score: totalScore,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeSpent,
      completed: true,
      xpEarned
    });

    await quizAttempt.save();

    // Update user stats
    const user = await User.findOne({ firebaseUid });
    let newlyEarnedBadges: string[] = [];
    if (user) {
      const newXp = user.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      // Check for new badges
      const candidateBadges: string[] = [];
      if (user.completedQuizzes === 0) {
        candidateBadges.push('first_quiz');
      }
      if (correctAnswers === quiz.questions.length) {
        candidateBadges.push('quiz_master');
      }
      if (newLevel >= 10) {
        candidateBadges.push('level_10');
      }

      newlyEarnedBadges = candidateBadges.filter((badge: string) => !user.badges.includes(badge));
      const updatedBadges = [...user.badges, ...newlyEarnedBadges];

      await User.findByIdAndUpdate(user._id, {
        xp: newXp,
        level: newLevel,
        badges: updatedBadges,
        completedQuizzes: user.completedQuizzes + 1,
        lastActive: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        score: totalScore,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        xpEarned,
        timeSpent,
        newBadges: newlyEarnedBadges
      }
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserQuizHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const { limit = 10, offset = 0 } = req.query;

    if (!firebaseUid) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const attempts = await QuizAttempt.find({ userId: firebaseUid })
      .populate('quizId', 'title category difficulty')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    res.json({
      success: true,
      data: attempts.map(attempt => ({
        id: attempt._id,
        quiz: attempt.quizId,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        xpEarned: attempt.xpEarned,
        timeSpent: attempt.timeSpent,
        completed: attempt.completed,
        createdAt: attempt.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user quiz history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
