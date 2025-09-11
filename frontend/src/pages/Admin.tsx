import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import app, { auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { QuizAdminService } from "@/lib/quizAdminService";

interface QuizFormQuestion {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export default function Admin() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("environment");
  const [difficulty, setDifficulty] = React.useState<'easy'|'medium'|'hard'>("easy");
  const [timeLimit, setTimeLimit] = React.useState(5);
  const [questions, setQuestions] = React.useState<QuizFormQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);

  const addQuestion = () => {
    setQuestions(q => ([...q, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      category,
      difficulty,
      points: 10
    }]));
  };

  const updateQuestion = (index: number, updater: Partial<QuizFormQuestion>) => {
    setQuestions(prev => prev.map((q,i) => i===index ? { ...q, ...updater } : q));
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const getToken = async (): Promise<string | null> => {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    } catch {
      return null;
    }
  };

  const readError = async (res: Response) => {
    const text = await res.text();
    try { const json = JSON.parse(text); return json.error || text; } catch { return text || res.statusText; }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      if (!title || questions.length === 0) { throw new Error('Title and at least one question required'); }
      const meta = { title, description, category, difficulty, totalPoints, timeLimit, isActive: true } as const;
      const id = await QuizAdminService.createQuiz(meta, questions);
      setTitle(""); setDescription(""); setQuestions([]);
      alert(`Quiz created in Firestore with id ${id}`);
    } catch (e:any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    const token = await getToken();
    if (!token) { alert('Not authenticated.'); return; }
    const res = await fetch(`/api/quizzes/export/csv`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) { const msg = await readError(res); alert(msg); return; }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'quizzes.csv'; a.click();
    window.URL.revokeObjectURL(url);
  };

  const connectionTest = async () => {
    try {
      setLoading(true);
      await addDoc(collection(require("@/lib/firebase").db, "healthchecks"), {
        source: "admin-panel",
        createdAt: serverTimestamp(),
      });
      alert("Firestore write OK (healthchecks)");
    } catch (e:any) {
      alert(`Firestore write failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Add or edit quizzes, approve questions, export CSV</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Title</label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Category</label>
              <Input value={category} onChange={e=>setCategory(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Difficulty</label>
              <select className="border rounded px-3 py-2 w-full" value={difficulty} onChange={e=>setDifficulty(e.target.value as any)}>
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Time Limit (mins)</label>
              <Input type="number" value={timeLimit} onChange={e=>setTimeLimit(parseInt(e.target.value||'0',10))} />
            </div>
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea value={description} onChange={e=>setDescription(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Questions ({questions.length}) • Total Points: {totalPoints}</h3>
            <Button onClick={addQuestion} size="sm">Add Question</Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, i) => (
              <Card key={i} className="p-3">
                <div className="space-y-2">
                  <Input placeholder="Question" value={q.question} onChange={e=>updateQuestion(i,{question:e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <Input key={oi} placeholder={`Option ${oi+1}`} value={opt} onChange={e=>{
                        const copy = [...q.options] as [string,string,string,string];
                        copy[oi] = e.target.value;
                        updateQuestion(i,{ options: copy });
                      }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select className="border rounded px-3 py-2" value={q.correctAnswer} onChange={e=>updateQuestion(i,{correctAnswer: parseInt(e.target.value,10)})}>
                      <option value={0}>Correct: 1</option>
                      <option value={1}>Correct: 2</option>
                      <option value={2}>Correct: 3</option>
                      <option value={3}>Correct: 4</option>
                    </select>
                    <Input type="number" placeholder="Points" value={q.points} onChange={e=>updateQuestion(i,{points: parseInt(e.target.value||'0',10)})} />
                    <select className="border rounded px-3 py-2" value={q.difficulty} onChange={e=>updateQuestion(i,{difficulty: e.target.value as any})}>
                      <option value="easy">easy</option>
                      <option value="medium">medium</option>
                      <option value="hard">hard</option>
                    </select>
                  </div>
                  <Textarea placeholder="Explanation" value={q.explanation} onChange={e=>updateQuestion(i,{explanation:e.target.value})} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={async ()=>{
                      const token = await getToken();
                      if (!token) { alert('Not authenticated.'); return; }
                      await fetch(`/api/quizzes/approve`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ quizId: 'DRAFT', questionIndex: i, approved: true })
                      });
                      alert('Marked approved (wire real quizId after create)');
                    }}>Approve</Button>
                    <Button variant="destructive" size="sm" onClick={()=>setQuestions(prev=>prev.filter((_,idx)=>idx!==i))}>Remove</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={submitQuiz} disabled={loading}>{loading ? 'Saving...' : 'Save Quiz'}</Button>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
            <Button variant="outline" onClick={connectionTest}>Test Firestore</Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">Project: { (app.options as any).projectId || 'unknown' }</div>
        </CardContent>
      </Card>
    </div>
  );
}
