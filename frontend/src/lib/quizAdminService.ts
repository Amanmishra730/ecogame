import { addDoc, collection, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface QuizQuestionDoc {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy'|'medium'|'hard';
  points: number;
  approved?: boolean;
}

export interface QuizDoc {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy'|'medium'|'hard';
  totalPoints: number;
  timeLimit: number;
  isActive: boolean;
}

export class QuizAdminService {
  static quizzesCol() {
    return collection(db, 'quizzes');
  }

  static quizDoc(id: string) {
    return doc(db, 'quizzes', id);
  }

  static async createQuiz(meta: QuizDoc, questions: QuizQuestionDoc[]) {
    // Create quiz
    const quizRef = await addDoc(this.quizzesCol(), meta);
    // Save questions in subcollection
    for (const q of questions) {
      await addDoc(collection(quizRef, 'questions'), q);
    }
    return quizRef.id;
  }

  static async updateQuiz(id: string, meta: Partial<QuizDoc>) {
    await updateDoc(this.quizDoc(id), meta as any);
  }
}


