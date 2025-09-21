import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import app, { auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { QuizAdminService } from "@/lib/quizAdminService";

import { 
  BarChart3, 
  BookOpen, 
  Users, 
  Award, 
  Settings, 
  Search, 
  Bell,
  TrendingUp,
  FileText,
  Trophy,
  Activity,
  Plus,
  Eye,
  Filter,
  MoreHorizontal,
  Calendar,
  Video,
  Clock,
  Download,
  Send,
  Edit,
  Play,
  Pause
} from "lucide-react";

interface QuizFormQuestion {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}


interface LeaderboardRow {
  rank: number;
  initials: string;
  name: string;
  xp: number;
  delta: number;
  quizzes: number;
  certs: number;
}

interface ClassItem {
  id: string;
  title: string;
  teacher: string;
  schedule: string;
  students: number;
  next: string;
  status: 'active' | 'inactive';
}

interface SessionItem {
  id: string;
  title: string;
  teacher: string;
  time: string;
  attendees: number;
  tag: string;
}

export default function Admin() {

  const [activeTab, setActiveTab] = useState('dashboard');
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("environment");
  const [difficulty, setDifficulty] = React.useState<'easy'|'medium'|'hard'>("easy");
  const [timeLimit, setTimeLimit] = React.useState(5);
  const [questions, setQuestions] = React.useState<QuizFormQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Mock data for dashboard
  const stats = {
    totalQuizzes: 142,
    activeClasses: 28,
    xpDistributed: 25680,
    certificatesIssued: 89
  };

  const recentActivity = [
    { name: "Sarah Johnson", action: "completed Nature Quiz", time: "2 hours ago", avatar: "SJ" },
    { name: "Mike Chen", action: "earned Forest Guardian badge", time: "4 hours ago", avatar: "MC" },
    { name: "Emma Davis", action: "started Climate Challenge", time: "6 hours ago", avatar: "ED" }
  ];

  const initialQuizzes = [
    { id: 'q1', title: 'React Fundamentals', createdAt: '2024-01-15', category: 'Frontend Development', questions: 25, attempts: 142, difficulty: 'medium', status: 'active' },
    { id: 'q2', title: 'JavaScript ES6+', createdAt: '2024-01-12', category: 'Programming', questions: 30, attempts: 89, difficulty: 'hard', status: 'active' },
    { id: 'q3', title: 'Climate Basics', createdAt: '2024-02-01', category: 'Environment', questions: 20, attempts: 57, difficulty: 'easy', status: 'draft' },
  ];

  const [allQuizzes, setAllQuizzes] = React.useState(initialQuizzes);

  // Mock data for XP & Leaderboard
  const xpStats = {
    totalXP: 13890,
    activeStudents: 6,
    certificates: 11,
    avgWeeklyXP: 318,
  } as const;

  const leaderboard: LeaderboardRow[] = [
    { rank: 1, initials: 'AJ', name: 'Alice Johnson', xp: 2850, delta: +420, quizzes: 18, certs: 3 },
    { rank: 2, initials: 'BC', name: 'Bob Chen', xp: 2640, delta: +380, quizzes: 16, certs: 2 },
    { rank: 3, initials: 'CD', name: 'Carol Davis', xp: 2420, delta: +290, quizzes: 15, certs: 2 },
  ];

  const badges: { title: string; desc: string; count: number }[] = [
    { title: 'Quiz Master', desc: 'Complete 20 quizzes', count: 3 },
    { title: 'Speed Learner', desc: 'Earn 500 XP in a week', count: 8 },
    { title: 'Consistent', desc: 'Study 7 days in a row', count: 5 },
  ];

  const [xpTab, setXpTab] = useState<'all'|'week'|'month'>('all');
  // Settings state
  const [fullName, setFullName] = useState('Admin User');
  const [email, setEmail] = useState('admin@eco.com');
  const [bio, setBio] = useState('');
  const [notifyNewQuiz, setNotifyNewQuiz] = useState(true);
  const [notifyClassReminders, setNotifyClassReminders] = useState(true);
  const [notifyCertRequests, setNotifyCertRequests] = useState(false);
  const [notifyWeeklyReports, setNotifyWeeklyReports] = useState(true);

  // Mock data for Certifications
  const certStats = { totalIssued: 3, delivered: 2, templates: 4, thisMonth: 12 } as const;
  const certTemplates: { title: string; type: string }[] = [
    { title: 'Classic Blue', type: 'Achievement' },
    { title: 'Modern Gold', type: 'Completion' },
    { title: 'Professional', type: 'Course' },
  ];
  const recentCerts: { name: string; course: string; date: string; template: string; status: 'Delivered'|'Pending' }[] = [
    { name: 'Alice Johnson', course: 'Advanced React Development', date: '2024-01-15', template: 'Classic Blue', status: 'Delivered' },
    { name: 'Bob Chen', course: 'JavaScript Fundamentals', date: '2024-01-14', template: 'Modern Gold', status: 'Pending' },
    { name: 'Carol Davis', course: 'Backend with Node.js', date: '2024-01-13', template: 'Professional', status: 'Delivered' },
  ];

  // Mock data for Class Space
  const classesData: ClassItem[] = [
    { id: 'c1', title: 'Advanced React Patterns', teacher: 'Sarah Johnson', schedule: 'Mon, Wed, Fri - 10:00 AM', students: 24, next: '22/1/2024', status: 'active' },
    { id: 'c2', title: 'JavaScript Fundamentals', teacher: 'Mike Chen', schedule: 'Tue, Thu - 2:00 PM', students: 18, next: '23/1/2024', status: 'active' },
  ];

  const sessionsData: SessionItem[] = [
    { id: 's1', title: 'Advanced React Patterns', teacher: 'Sarah Johnson', time: '10:00 AM', attendees: 24, tag: 'Today' },
    { id: 's2', title: 'JavaScript Fundamentals', teacher: 'Mike Chen', time: '2:00 PM', attendees: 18, tag: 'Tomorrow' },
    { id: 's3', title: 'Backend Development with Node.js', teacher: 'David Wilson', time: '4:00 PM', attendees: 22, tag: 'Tomorrow' },
  ];

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

      
      // Create new quiz object for Class Space
      const newQuiz = {
        id: `q${Date.now()}`,
        title,
        createdAt: new Date().toISOString().split('T')[0],
        category,
        questions: questions.length,
        attempts: 0,
        difficulty,
        status: 'draft' as const
      };
      
      // Add to quizzes array (Class Space)
      setAllQuizzes(prev => [...prev, newQuiz]);
      
      // Also save to Firestore for persistence
      const meta = { title, description, category, difficulty, totalPoints, timeLimit, isActive: false } as const;
      const id = await QuizAdminService.createQuiz(meta, questions);

      
      // Reset form
      setTitle(""); 
      setDescription(""); 
      setQuestions([]); 
      setShowCreateForm(false);
      
      // Show success message
      alert(`Quiz "${title}" created successfully! 
      
✅ Quiz has been added to Class Space
✅ Status: Draft (students cannot access yet)
✅ Next: Go to Class Space to activate the quiz for students

To make it available to students:
1. Go to Class Space section
2. Find your quiz in the table
3. Click the actions menu (⋮) 
4. Select "Activate Quiz"`);
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


  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
          <p className="text-purple-100 mb-6">Your learning platform is thriving with active students and growing engagement.</p>
          <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Eye className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Classes</p>
              <p className="text-3xl font-bold">{stats.activeClasses}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">XP Distributed</p>
              <p className="text-3xl font-bold">{stats.xpDistributed.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Certificates Issued</p>
              <p className="text-3xl font-bold">{stats.certificatesIssued}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% from last month
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student achievements and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>

            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="w-5 h-5 mb-2" />
                Create Quiz
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="w-5 h-5 mb-2" />
                Manage Classes
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Award className="w-5 h-5 mb-2" />
                Issue Certificate
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="w-5 h-5 mb-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderClassSpace = () => (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Class Space - Quiz Management</h2>
          <p className="text-sm text-muted-foreground">Manage quizzes for your classes and students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-xl">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button className="h-12 rounded-xl" onClick={()=>setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create New Quiz
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-3xl font-bold">{allQuizzes.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Quizzes</p>
              <p className="text-3xl font-bold">{allQuizzes.filter(q => q.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="text-3xl font-bold">{allQuizzes.reduce((a,c)=>a+c.attempts,0)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Draft Quizzes</p>
              <p className="text-3xl font-bold">{allQuizzes.filter(q => q.status === 'draft').length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>Manage your quiz collection</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{quiz.title}</div>
                      <div className="text-sm text-muted-foreground">Created: {quiz.createdAt}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {quiz.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.questions} questions</TableCell>
                  <TableCell>{quiz.attempts} attempts</TableCell>
                  <TableCell>
                    <Badge variant={
                      quiz.difficulty === 'easy' ? 'default' : 
                      quiz.difficulty === 'medium' ? 'secondary' : 
                      'destructive'
                    } className={
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                      quiz.difficulty === 'medium' ? 'bg-blue-100 text-blue-700' : 
                      'bg-red-100 text-red-700'
                    }>
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={quiz.status === 'active' ? 'default' : 'secondary'} className={
                      quiz.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }>
                      {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            // Navigate to quiz taking interface for users
                            alert(`Starting quiz: ${quiz.title}\nThis would open the quiz interface for students to take the quiz.`);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Take Quiz (Student View)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Attempts
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Results
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            const newStatus = quiz.status === 'active' ? 'draft' : 'active';
                            setAllQuizzes(prev => prev.map(q => 
                              q.id === quiz.id ? { ...q, status: newStatus } : q
                            ));
                          }}
                          className={quiz.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {quiz.status === 'active' ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Deactivate Quiz
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate Quiz
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Access Section */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Student Access</CardTitle>
          <CardDescription>How students can access and take quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Active Quizzes Available</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Students can access and take quizzes that are marked as "Active" status. 
                    Draft quizzes are only visible to admins.
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-blue-700">Active: {allQuizzes.filter(q => q.status === 'active').length} quizzes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-blue-700">Draft: {allQuizzes.filter(q => q.status === 'draft').length} quizzes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Quiz Taking Process</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Students can take quizzes by clicking "Take Quiz" in the actions menu. 
                    This opens the quiz interface where they can answer questions and submit their responses.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">Progress Tracking</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    All quiz attempts are tracked and can be viewed in the "View Attempts" section. 
                    Admins can export results and monitor student progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Quiz Form Modal */}
      {showCreateForm && (
        <Card className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Quiz</CardTitle>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  ✕
                </Button>
              </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>

                  <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} />
            </div>
            <div>

                  <label className="text-sm font-medium">Category</label>
              <Input value={category} onChange={e=>setCategory(e.target.value)} />
            </div>
            <div>

                  <label className="text-sm font-medium">Difficulty</label>
              <select className="border rounded px-3 py-2 w-full" value={difficulty} onChange={e=>setDifficulty(e.target.value as any)}>

                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
              </select>
            </div>
            <div>

                  <label className="text-sm font-medium">Time Limit (mins)</label>
              <Input type="number" value={timeLimit} onChange={e=>setTimeLimit(parseInt(e.target.value||'0',10))} />
            </div>
          </div>
          <div>

                <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={e=>setDescription(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Questions ({questions.length}) • Total Points: {totalPoints}</h3>

                <Button onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, i) => (

                  <Card key={i} className="p-4">
                    <div className="space-y-3">
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

                          <option value={0}>Correct: Option 1</option>
                          <option value={1}>Correct: Option 2</option>
                          <option value={2}>Correct: Option 3</option>
                          <option value={3}>Correct: Option 4</option>
                    </select>
                    <Input type="number" placeholder="Points" value={q.points} onChange={e=>updateQuestion(i,{points: parseInt(e.target.value||'0',10)})} />
                    <select className="border rounded px-3 py-2" value={q.difficulty} onChange={e=>updateQuestion(i,{difficulty: e.target.value as any})}>

                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
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

        </Card>
      )}
    </div>
  );

  const renderQuizManager = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Create New Quiz</h2>
          <p className="text-sm text-muted-foreground">Build and customize quizzes for your students</p>
        </div>
        <Button onClick={() => setActiveTab('classes')} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          View Created Quizzes
        </Button>
      </div>

      {/* Quiz Creation Form */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>Define the basic information for your quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Quiz Title</label>
              <Input 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                placeholder="Enter quiz title..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input 
                value={category} 
                onChange={e=>setCategory(e.target.value)} 
                placeholder="e.g., Environment, Science..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty Level</label>
              <select 
                className="border rounded px-3 py-2 w-full mt-1" 
                value={difficulty} 
                onChange={e=>setDifficulty(e.target.value as any)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Time Limit (minutes)</label>
              <Input 
                type="number" 
                value={timeLimit} 
                onChange={e=>setTimeLimit(parseInt(e.target.value||'0',10))} 
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={description} 
              onChange={e=>setDescription(e.target.value)} 
              placeholder="Describe what this quiz covers..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Add questions to your quiz ({questions.length} questions • {totalPoints} points)</CardDescription>
            </div>
            <Button onClick={addQuestion} className="h-10">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No questions yet</h3>
              <p className="text-muted-foreground mb-4">Start building your quiz by adding questions</p>
              <Button onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <Card key={i} className="p-4 border-l-4 border-l-blue-500">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Question {i + 1}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={()=>setQuestions(prev=>prev.filter((_,idx)=>idx!==i))}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <Input 
                      placeholder="Enter your question..." 
                      value={q.question} 
                      onChange={e=>updateQuestion(i,{question:e.target.value})} 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-6">{oi + 1}.</span>
                          <Input 
                            placeholder={`Option ${oi+1}`} 
                            value={opt} 
                            onChange={e=>{
                              const copy = [...q.options] as [string,string,string,string];
                              copy[oi] = e.target.value;
                              updateQuestion(i,{ options: copy });
                            }} 
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Correct Answer</label>
                        <select 
                          className="border rounded px-3 py-2 w-full" 
                          value={q.correctAnswer} 
                          onChange={e=>updateQuestion(i,{correctAnswer: parseInt(e.target.value,10)})}
                        >
                          <option value={0}>Option 1</option>
                          <option value={1}>Option 2</option>
                          <option value={2}>Option 3</option>
                          <option value={3}>Option 4</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Points</label>
                        <Input 
                          type="number" 
                          placeholder="Points" 
                          value={q.points} 
                          onChange={e=>updateQuestion(i,{points: parseInt(e.target.value||'0',10)})} 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Difficulty</label>
                        <select 
                          className="border rounded px-3 py-2 w-full" 
                          value={q.difficulty} 
                          onChange={e=>updateQuestion(i,{difficulty: e.target.value as any})}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    
                    <Textarea 
                      placeholder="Explanation (optional)" 
                      value={q.explanation} 
                      onChange={e=>updateQuestion(i,{explanation:e.target.value})} 
                      rows={2}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <p><strong>Total Questions:</strong> {questions.length}</p>
              <p><strong>Total Points:</strong> {totalPoints}</p>
              <p><strong>Estimated Time:</strong> {timeLimit} minutes</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={connectionTest}
                disabled={loading}
              >
                Test Connection
              </Button>
              <Button 
                onClick={submitQuiz} 
                disabled={loading || !title || questions.length === 0}
                className="min-w-32"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </Button>
            </div>
          </div>
          {!title && (
            <p className="text-sm text-red-600 mt-2">Please enter a quiz title</p>
          )}
          {questions.length === 0 && title && (
            <p className="text-sm text-red-600 mt-2">Please add at least one question</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderXPLeaderboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">XP & Leaderboard</h2>
      <p className="text-muted-foreground">XP tracking and leaderboard features coming soon...</p>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Certifications</h2>
      <p className="text-muted-foreground">Certificate management features coming soon...</p>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <p className="text-muted-foreground">System settings and configuration coming soon...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">EcoAdmin v2</h1>
                <p className="text-xs text-muted-foreground">Learning Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search courses, students..." 
                className="pl-10 w-80"
              />
            </div>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500">3</Badge>
            </Button>
            
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">Admin User</p>
                <p className="text-muted-foreground">admin@eco.com</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'quizzes' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Quizzes
              </button>
              
              <button
                onClick={() => setActiveTab('classes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'classes'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Class Space
              </button>
              
              <button
                onClick={() => setActiveTab('xp')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'xp'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                XP & Leaderboard
              </button>
              
              <button
                onClick={() => setActiveTab('certs')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'certs' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Award className="w-4 h-4" />
                Certifications
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'settings' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'quizzes' && renderQuizManager()}
          {activeTab === 'classes' && renderClassSpace()}
          {activeTab === 'xp' && renderXPLeaderboard()}
          {activeTab === 'certs' && renderCertifications()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
}

