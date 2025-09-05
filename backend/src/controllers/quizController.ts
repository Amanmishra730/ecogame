import { Request, Response } from 'express';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

export const getQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, limit = 10, offset = 0 } = req.query;
    
    const filter: any = { isActive: true };
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
        questionId: question._id.toString(),
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
    if (user) {
      const newXp = user.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      // Check for new badges
      const newBadges = [...user.badges];
      if (user.completedQuizzes === 0 && !newBadges.includes('first_quiz')) {
        newBadges.push('first_quiz');
      }
      if (correctAnswers === quiz.questions.length && !newBadges.includes('quiz_master')) {
        newBadges.push('quiz_master');
      }
      if (newLevel >= 10 && !newBadges.includes('level_10')) {
        newBadges.push('level_10');
      }

      await User.findByIdAndUpdate(user._id, {
        xp: newXp,
        level: newLevel,
        badges: newBadges,
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
        newBadges: user ? newBadges.filter(badge => !user.badges.includes(badge)) : []
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
