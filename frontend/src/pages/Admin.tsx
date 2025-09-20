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
  Send
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

  const quizzes = [
    { id: 'q1', title: 'React Fundamentals', createdAt: '2024-01-15', category: 'Frontend Development', questions: 25, attempts: 142, difficulty: 'medium', status: 'active' },
    { id: 'q2', title: 'JavaScript ES6+', createdAt: '2024-01-12', category: 'Programming', questions: 30, attempts: 89, difficulty: 'hard', status: 'active' },
    { id: 'q3', title: 'Climate Basics', createdAt: '2024-02-01', category: 'Environment', questions: 20, attempts: 57, difficulty: 'easy', status: 'draft' },
  ] as const;

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
                +18% from last month
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
                +23% from last month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Learning Progress and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Learning Progress Overview
            </CardTitle>
            <CardDescription>Student engagement and completion rates over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Quiz Completion Rate</span>
                <span className="text-sm font-medium">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '87%'}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Score</span>
                <span className="text-sm font-medium">82%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '82%'}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Student Retention</span>
                <span className="text-sm font-medium">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '94%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your platform preferences and configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm">Full Name</label>
              <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="mt-1"/>
            </div>
            <div>
              <label className="text-sm">Email</label>
              <Input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1"/>
            </div>
            <div>
              <label className="text-sm">Bio</label>
              <Textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Tell us about yourself..." className="mt-1"/>
            </div>
            <Button className="mt-2">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">New Quiz Submissions</div>
                <div className="text-xs text-muted-foreground">Get notified when students submit quizzes</div>
              </div>
              <Switch checked={notifyNewQuiz} onCheckedChange={setNotifyNewQuiz} />
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Class Reminders</div>
                <div className="text-xs text-muted-foreground">Receive reminders for upcoming classes</div>
              </div>
              <Switch checked={notifyClassReminders} onCheckedChange={setNotifyClassReminders} />
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Certificate Requests</div>
                <div className="text-xs text-muted-foreground">Alert when students request certificates</div>
              </div>
              <Switch checked={notifyCertRequests} onCheckedChange={setNotifyCertRequests} />
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Weekly Reports</div>
                <div className="text-xs text-muted-foreground">Get weekly platform activity summaries</div>
              </div>
              <Switch checked={notifyWeeklyReports} onCheckedChange={setNotifyWeeklyReports} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable 2FA</Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Configure platform defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Maintenance Mode</div>
                <div className="text-xs text-muted-foreground">Temporarily disable user access</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Send system emails to users</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      {/* Header and action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certifications</h2>
          <p className="text-sm text-muted-foreground">Manage certificate templates and issue certificates</p>
        </div>
        <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2"/> Issue Certificate</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Issued</p><p className="text-3xl font-bold">{certStats.totalIssued}</p></div><div className="p-3 bg-blue-100 rounded-full"><Award className="w-6 h-6 text-blue-700"/></div></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Delivered</p><p className="text-3xl font-bold">{certStats.delivered}</p></div><div className="p-3 bg-emerald-100 rounded-full"><Send className="w-6 h-6 text-emerald-700"/></div></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Templates</p><p className="text-3xl font-bold">{certStats.templates}</p></div><div className="p-3 bg-orange-100 rounded-full"><FileText className="w-6 h-6 text-orange-700"/></div></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">This Month</p><p className="text-3xl font-bold">{certStats.thisMonth}</p></div><div className="p-3 bg-purple-100 rounded-full"><TrendingUp className="w-6 h-6 text-purple-700"/></div></CardContent></Card>
      </div>

      {/* Templates + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Certificate Templates</CardTitle>
            <CardDescription>Manage your certificate designs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {certTemplates.map((t, i) => (
              <div key={i} className="border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.type}</div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Recently Issued Certificates</CardTitle>
            <CardDescription>Latest certificate awards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCerts.map((c, i) => (
              <div key={i} className="border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8"><AvatarFallback>{c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.course}</div>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground items-center">
                        <Calendar className="w-3 h-3"/> {c.date}
                        <span className="mx-1">•</span>
                        <FileText className="w-3 h-3"/> {c.template}
                        <span className="mx-1">•</span>
                        <Badge className={c.status==='Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}>{c.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Download className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon"><Send className="w-4 h-4"/></Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderXPLeaderboard = () => (
    <div className="space-y-6">
      {/* Header and action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">XP & Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Track student progress and engagement</p>
        </div>
        <Button variant="outline" className="rounded-xl">
          <Trophy className="w-4 h-4 mr-2" /> Manage XP Rules
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total XP Distributed</p><p className="text-3xl font-bold">{xpStats.totalXP.toLocaleString()}</p></div><div className="p-3 bg-yellow-100 rounded-full"><Trophy className="w-6 h-6 text-yellow-700"/></div></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Students</p><p className="text-3xl font-bold">{xpStats.activeStudents}</p></div><div className="p-3 bg-blue-100 rounded-full"><Users className="w-6 h-6 text-blue-700"/></div></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Certificates Earned</p><p className="text-3xl font-bold">{xpStats.certificates}</p></div><div className="p-3 bg-green-100 rounded-full"><Award className="w-6 h-6 text-green-700"/></div></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Avg Weekly XP</p><p className="text-3xl font-bold">{xpStats.avgWeeklyXP}</p></div><div className="p-3 bg-purple-100 rounded-full"><TrendingUp className="w-6 h-6 text-purple-700"/></div></CardContent></Card>
      </div>

      {/* Leaderboard + Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5"/> Student Leaderboard</CardTitle>
              <CardDescription>Rankings based on XP and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="inline-flex bg-muted/50 rounded-lg p-1 mb-4">
                <button onClick={()=>setXpTab('all')} className={`px-4 py-2 rounded-md text-sm ${xpTab==='all'?'bg-white shadow':''}`}>All Time</button>
                <button onClick={()=>setXpTab('week')} className={`px-4 py-2 rounded-md text-sm ${xpTab==='week'?'bg-white shadow':''}`}>This Week</button>
                <button onClick={()=>setXpTab('month')} className={`px-4 py-2 rounded-md text-sm ${xpTab==='month'?'bg-white shadow':''}`}>This Month</button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Quizzes</TableHead>
                    <TableHead>Certificates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map(row => (
                    <TableRow key={row.rank}>
                      <TableCell>
                        {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : row.rank}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarFallback>{row.initials}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium">{row.name}</div>
                            <div className="text-xs text-muted-foreground">+{row.delta} this week</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{row.xp.toLocaleString()}</TableCell>
                      <TableCell>{row.quizzes}</TableCell>
                      <TableCell>{row.certs}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>Student milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {badges.map((b, i) => (
                <div key={i} className="rounded-xl border p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-muted-foreground">{b.desc}</div>
                  </div>
                  <Badge variant="secondary" className="rounded-full">{b.count} students</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderClassSpace = () => (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Space</h2>
          <p className="text-sm text-muted-foreground">Manage your classes and schedule sessions</p>
        </div>
        <Button className="h-12 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Create New Class
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <p className="text-3xl font-bold">{classesData.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{classesData.reduce((a,c)=>a+c.students,0)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Live Classes</p>
              <p className="text-3xl font-bold">2</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Sessions</p>
              <p className="text-3xl font-bold">1</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content: All Classes + Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>Manage your class schedule and enrollment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {classesData.map(c => (
                <div key={c.id} className="border rounded-xl p-4 flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{c.title}</h3>
                      <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{c.teacher}</div>
                    <div className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" /> {c.schedule}
                    </div>
                    <div className="text-sm text-muted-foreground">{c.students} students • Next: {c.next}</div>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Next sessions this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionsData.map(s => (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.teacher}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="rounded-full">{s.tag}</Badge>
                    <div className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" /> {s.time}
                    </div>
                    <div className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" /> {s.attendees}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderQuizManager = () => (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3">
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
              <p className="text-3xl font-bold">{quizzes.length}</p>
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
              <p className="text-3xl font-bold">{quizzes.filter(q=>q.status==='active').length}</p>
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
              <p className="text-3xl font-bold">{quizzes.reduce((a,q)=>a+q.attempts,0)}</p>
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
              <p className="text-3xl font-bold">{quizzes.filter(q=>q.status==='draft').length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Quizzes Table */}
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
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes
                .filter(q=>q.title.toLowerCase().includes(query.toLowerCase()))
                .map((q)=> (
                <TableRow key={q.id}>
                  <TableCell>
                    <div className="font-medium">{q.title}</div>
                    <div className="text-xs text-muted-foreground">Created {q.createdAt}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">{q.category}</Badge>
                  </TableCell>
                  <TableCell>{q.questions} questions</TableCell>
                  <TableCell>{q.attempts} attempts</TableCell>
                  <TableCell>
                    <Badge className={q.difficulty==='hard' ? 'bg-red-100 text-red-700' : q.difficulty==='medium' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                      {q.difficulty.charAt(0).toUpperCase()+q.difficulty.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={q.status==='active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}>
                      {q.status.charAt(0).toUpperCase()+q.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={()=>{ setShowCreateForm(true); setTitle(q.title); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create form panel */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Quiz</CardTitle>
            <CardDescription>Define metadata and add questions</CardDescription>
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
                      alert('Question approved successfully!');
                    }}>Approve</Button>
                    <Button variant="destructive" size="sm" onClick={()=>setQuestions(prev=>prev.filter((_,idx)=>idx!==i))}>Remove</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={submitQuiz} disabled={loading}>
              {loading ? 'Saving...' : 'Save Quiz'}
            </Button>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
            <Button variant="outline" onClick={connectionTest}>Test Connection</Button>
            <Button variant="ghost" onClick={()=>setShowCreateForm(false)}>Close</Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">Project: { (app.options as any).projectId || 'unknown' }</div>
        </CardContent>
        </Card>
      )}
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
