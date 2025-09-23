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
import app, { auth, db } from "@/lib/firebase";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { addDoc, collection, serverTimestamp, updateDoc, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { QuizAdminService } from "@/lib/quizAdminService";
import { getDocs, orderBy, query, where, limit as fsLimit, collection as fsCollection } from "firebase/firestore";

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
  Pause,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

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
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("environment");
  const [difficulty, setDifficulty] = React.useState<'easy'|'medium'|'hard'>("easy");
  const [timeLimit, setTimeLimit] = React.useState(5);
  const [questions, setQuestions] = React.useState<QuizFormQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Codespace state
  interface Codespace {
    _id: string;
    code: string;
    adminUserId: string;
    quizId?: string;
    active: boolean;
    expiresAt: string | null;
    name?: string | null;
    createdAt: string;
    updatedAt: string;
  }
  const [codespace, setCodespace] = React.useState<Codespace | null>(null);
  const [csLoading, setCsLoading] = React.useState(false);
  const [csTtl, setCsTtl] = React.useState(120);
  const [csName, setCsName] = React.useState("");
  const [csPermanent, setCsPermanent] = React.useState(true);
  const [csQuizId, setCsQuizId] = React.useState<string>("");
  const [fsQuizzes, setFsQuizzes] = React.useState<{id:string; title:string}[]>([]);
  // All quizzes displayed in Class Space table
  const [allQuizzes, setAllQuizzes] = React.useState<{id:string; title:string; createdAt:string; category:string; questions:number; attempts:number; difficulty:string; status:'active'|'draft'}[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const loadAllQuizzes = async () => {
    try {
      const snap = await getDocs(collection(db, 'quizzes'));
      const arr = snap.docs.map((d:any) => {
        const q = d.data() || {};
        const createdStr: string = q.createdAt?.toDate ? q.createdAt.toDate().toISOString().slice(0,10) : (q.createdAt || new Date().toISOString().slice(0,10));
        const isActive = !!q.isActive;
        const status: 'active' | 'draft' = isActive ? 'active' : 'draft';
        const difficultyStr: string = q.difficulty || 'medium';
        const categoryStr: string = q.category || 'General';
        const questionsCount: number = Array.isArray(q.questions) ? q.questions.length : Number(q.questionsCount || 0);
        const attemptsCount: number = Number(q.attempts || 0);
        return { id: String(d.id), title: String(q.title || 'Untitled'), createdAt: createdStr, category: categoryStr, questions: questionsCount, attempts: attemptsCount, difficulty: difficultyStr, status };
      });
      // Sort by created date desc
      arr.sort((a,b)=> (b.createdAt.localeCompare(a.createdAt)));
      setAllQuizzes(arr);
    } catch (e) {
      console.warn('Failed to load quizzes list', e);
      setAllQuizzes([]);
    }
  };
  const reloadFsQuizzes = async () => {
    try {
      // First try: only active quizzes (avoid composite index by not ordering here)
      let q1 = query(collection(db, 'quizzes'), where('isActive', '==', true));
      let snap = await getDocs(q1);
      let arr = snap.docs.map((d:any) => ({ id: d.id, title: (d.data()?.title || 'Untitled') as string }));
      // Fallback: if none active, show all quizzes so admin can still attach one
      if (arr.length === 0) {
        snap = await getDocs(collection(db, 'quizzes'));
        arr = snap.docs.map((d:any) => ({ id: d.id, title: (d.data()?.title || 'Untitled') as string }));
      }
      // Client-side sort by title for UI consistency
      arr.sort((a,b)=>a.title.localeCompare(b.title));
      setFsQuizzes(arr);
      if (arr.length && !csQuizId) setCsQuizId(arr[0].id);
    } catch (e) {
      console.warn('Failed to load quizzes for codespace', e);
      setFsQuizzes([]);
    }
  };

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  // Edit quiz modal state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editQuizId, setEditQuizId] = React.useState<string>("");
  const [editTitle, setEditTitle] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("");
  const [editDifficulty, setEditDifficulty] = React.useState<'easy'|'medium'|'hard'>("medium");
  const [editTimeLimit, setEditTimeLimit] = React.useState<number>(5);
  const [editDescription, setEditDescription] = React.useState("");

  const startEdit = (quiz: {id:string; title:string; category:string; difficulty:string; createdAt:string}) => {
    setEditQuizId(quiz.id);
    setEditTitle(quiz.title);
    setEditCategory(quiz.category);
    setEditDifficulty((quiz.difficulty as any) || 'medium');
    setEditTimeLimit(timeLimit || 5);
    setEditDescription(description || "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      if (!editQuizId) return;
      await updateDoc(doc(db, 'quizzes', editQuizId), {
        title: editTitle,
        category: editCategory,
        difficulty: editDifficulty,
        timeLimit: editTimeLimit,
        description: editDescription,
        updatedAt: serverTimestamp(),
      });
      await reloadFsQuizzes();
      await loadAllQuizzes();
      setEditOpen(false);
    } catch (e:any) {
      alert(`Failed to save quiz: ${e.message || e}`);
    }
  };

  const removeQuiz = async (id: string) => {
    try {
      if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
      await deleteDoc(doc(db, 'quizzes', id));
      await reloadFsQuizzes();
      await loadAllQuizzes();
    } catch (e:any) {
      alert(`Failed to delete quiz: ${e.message || e}`);
    }
  };

  // Mock data for dashboard
  const stats = {
    totalQuizzes: 142,
    activeClasses: 28,
    xpDistributed: 25680,
    certificatesIssued: 89
  };

  // Codespace helpers
  const fetchCodespace = async () => {
    try {
      setCsLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/codespaces/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Backend has no active codespace; try Firestore mirror
        try {
          if (!currentUser?.uid) { setCodespace(null); return; }
          const mirrorRef = doc(db, 'adminCodespaces', currentUser.uid);
          const mirrorSnap = await getDoc(mirrorRef);
          if (mirrorSnap.exists()) {
            const cs: any = mirrorSnap.data();
            if (cs && cs.active) { setCodespace(cs as any); return; }
          }
          setCodespace(null);
          return;
        } catch {
          setCodespace(null);
          return;
        }
      }
      const data = await res.json();
      setCodespace(data);
      // Mirror to Firestore for persistence in UI
      try {
        if (currentUser?.uid) {
          const mirrorRef = doc(db, 'adminCodespaces', currentUser.uid);
          await setDoc(mirrorRef, { ...data, adminUserId: currentUser.uid, mirroredAt: serverTimestamp() }, { merge: true });
        }
      } catch {}
    } finally {
      setCsLoading(false);
    }
  };

  const createCodespace = async () => {
    try {
      setCsLoading(true);
      const token = await getToken();
      if (!token) { alert('Not authenticated.'); return; }
      const res = await fetch(`/api/codespaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ttlMinutes: csPermanent ? undefined : csTtl,
          quizId: csQuizId || undefined,
          name: csName || undefined,
          permanent: csPermanent
        }),
      });
      if (!res.ok) { const msg = await readError(res); alert(msg); return; }
      const data = await res.json();
      setCodespace(data);
      // Mirror to Firestore so UI can restore after reload
      try {
        if (currentUser?.uid) {
          const mirrorRef = doc(db, 'adminCodespaces', currentUser.uid);
          await setDoc(mirrorRef, { ...data, adminUserId: currentUser.uid, mirroredAt: serverTimestamp() }, { merge: true });
        }
      } catch {}
    } catch (e:any) {
      alert(e.message);
    } finally {
      setCsLoading(false);
    }
  };

  const deactivateCodespace = async () => {
    try {
      setCsLoading(true);
      const token = await getToken();
      if (!token) { alert('Not authenticated.'); return; }
      const res = await fetch(`/api/codespaces/deactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const msg = await readError(res); alert(msg); return; }
      setCodespace(null);
      // Clear Firestore mirror
      try {
        if (currentUser?.uid) {
          const mirrorRef = doc(db, 'adminCodespaces', currentUser.uid);
          await setDoc(mirrorRef, { active: false, updatedAt: serverTimestamp() }, { merge: true });
        }
      } catch {}
    } finally {
      setCsLoading(false);
    }
  };

  React.useEffect(() => { fetchCodespace(); }, []);
  // Refetch codespace when entering Class Space tab
  React.useEffect(() => {
    if (activeTab === 'classes') {
      fetchCodespace();
    }
  }, [activeTab]);
  // Load quizzes for dropdown and the main table
  React.useEffect(() => { reloadFsQuizzes(); loadAllQuizzes(); }, []);

  const [recentActivity, setRecentActivity] = React.useState<{name:string; action:string; time:string; avatar:string}[]>([]);
  React.useEffect(() => {
    (async () => {
      try {
        // Pull most recently updated userProgress docs
        const q = query(fsCollection(db, 'userProgress'), orderBy('updatedAt', 'desc'), fsLimit(5));
        const snap = await getDocs(q);
        const items: any[] = [];
        snap.forEach((d:any) => {
          const u = d.data();
          const name: string = u.displayName || (u.userId || '').slice(0,6);
          const avatar = (name.split(' ').map((w:string)=>w[0]).join('') || 'U').slice(0,2).toUpperCase();
          const time = u.updatedAt ? new Date(u.updatedAt).toLocaleTimeString() : '';
          // Simple activity message
          const action = u.badges > 0 ? `earned ${u.badges} badge${u.badges>1?'s':''}` : `has ${u.xp} XP`;
          items.push({ name, action, time, avatar });
        });
        setRecentActivity(items);
      } catch (e) {
        console.warn('Failed to load recent activity', e);
        setRecentActivity([]);
      }
    })();
  }, []);

  

  // XP & Leaderboard (live from Firestore userProgress)
  const [xpStats, setXpStats] = useState({ totalXP: 0, activeStudents: 0, certificates: 0, avgWeeklyXP: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [badges, setBadges] = useState<{ title: string; desc: string; count: number }[]>([
    { title: 'Quiz Master', desc: 'Complete 20 quizzes', count: 0 },
    { title: 'Speed Learner', desc: 'Earn 500 XP in a week', count: 0 },
    { title: 'Consistent', desc: 'Study 7 days in a row', count: 0 },
  ]);

  React.useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(fsCollection(db, 'userProgress'));
        const rows: LeaderboardRow[] = [];
        let totalXP = 0;
        let certificates = 0;
        let activeStudents = 0;
        let activeXpSum = 0;
        let quizMaster = 0;
        let speedLearnerApprox = 0; // Approx: active this week and xp >= 500
        let consistent = 0;

        const now = Date.now();
        const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

        snap.forEach((d: any) => {
          const u = d.data() || {};
          const xp = Number(u.xp || 0);
          const name: string = u.displayName || (u.userId || 'User');
          const initials = (name.split(' ').map((w: string) => w[0]).join('') || 'U').slice(0, 2).toUpperCase();
          const quizzes = Number(u.completedQuizzes || 0);
          const certs = Number(u.badges || 0);
          const updatedAtMs = u.updatedAt ? new Date(u.updatedAt).getTime() : 0;
          const isActive = !!updatedAtMs && (now - updatedAtMs) <= WEEK_MS; // last 7 days

          totalXP += xp;
          certificates += certs;
          if (isActive) { activeStudents += 1; activeXpSum += xp; }

          if (quizzes >= 20) quizMaster += 1;
          if (isActive && xp >= 500) speedLearnerApprox += 1;
          if (Number(u.streak || 0) >= 7) consistent += 1;

          rows.push({ rank: 0, initials, name, xp, delta: 0, quizzes, certs });
        });

        // Sort and rank
        rows.sort((a, b) => b.xp - a.xp);
        rows.forEach((r, i) => { r.rank = i + 1; });

        setLeaderboard(rows);
        setXpStats({
          totalXP,
          activeStudents,
          avgWeeklyXP: Math.round(activeXpSum / 7),
          certificates,
        });
        setBadges([
          { title: 'Quiz Master', desc: 'Complete 20 quizzes', count: quizMaster },
          { title: 'Speed Learner', desc: 'Earn 500 XP in a week', count: speedLearnerApprox },
          { title: 'Consistent', desc: 'Study 7 days in a row', count: consistent },
        ]);
      } catch (e) {
        console.warn('Failed to load leaderboard data', e);
        setLeaderboard([]);
        setXpStats({ totalXP: 0, activeStudents: 0, certificates: 0, avgWeeklyXP: 0 });
      }
    })();
  }, []);

  const [xpTab, setXpTab] = useState<'all'|'week'|'month'>('all');
  // Settings state
  const [fullName, setFullName] = useState('Admin User');
  const [email, setEmail] = useState('admin@eco.com');
  const [bio, setBio] = useState('');
  const [notifyNewQuiz, setNotifyNewQuiz] = useState(true);
  const [notifyClassReminders, setNotifyClassReminders] = useState(true);
  const [notifyCertRequests, setNotifyCertRequests] = useState(false);
  const [notifyWeeklyReports, setNotifyWeeklyReports] = useState(true);

  // Security settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  // Platform settings state
  const [platformName, setPlatformName] = useState('EduAdmin Learning Platform');
  const [defaultXPPerQuiz, setDefaultXPPerQuiz] = useState<number>(100);
  const [certValidityMonths, setCertValidityMonths] = useState<number>(12);
  const [autoIssueCertificates, setAutoIssueCertificates] = useState(true);
  const [publicLeaderboard, setPublicLeaderboard] = useState(true);

  // Certifications: live from Firestore
  const [certStats, setCertStats] = useState({ totalIssued: 0, delivered: 0, templates: 3, thisMonth: 0 });
  const [certTemplates, setCertTemplates] = useState<{ title: string; type: string }[]>([
    { title: 'Classic Blue', type: 'Achievement' },
    { title: 'Modern Gold', type: 'Completion' },
    { title: 'Professional', type: 'Course' },
  ]);
  const [recentCerts, setRecentCerts] = useState<{ name: string; course: string; date: string; template: string; status: 'Delivered'|'Pending' }[]>([]);

  const loadCertificates = async () => {
    try {
      const now = new Date();
      const thisMonthKey = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}`;
      const q = query(fsCollection(db, 'certificates'), orderBy('createdAt', 'desc'), fsLimit(50));
      const snap = await getDocs(q);
      const rows: { name: string; course: string; date: string; template: string; status: 'Delivered'|'Pending' }[] = [];
      let total = 0, delivered = 0, thisMonth = 0;
      snap.forEach((d:any) => {
        const c = d.data() || {};
        total += 1;
        if ((c.status || 'Delivered') === 'Delivered') delivered += 1;
        const dt = c.createdAt?.toDate ? c.createdAt.toDate() : (c.createdAt ? new Date(c.createdAt) : new Date());
        const key = `${dt.getFullYear()}-${(dt.getMonth()+1).toString().padStart(2,'0')}`;
        if (key === thisMonthKey) thisMonth += 1;
        rows.push({
          name: String(c.studentName || 'Student'),
          course: String(c.course || 'Course'),
          date: dt.toISOString().slice(0,10),
          template: String(c.template || 'Classic Blue'),
          status: (c.status || 'Delivered') as any
        });
      });
      setRecentCerts(rows);
      setCertStats({ totalIssued: total, delivered, templates: certTemplates.length, thisMonth });
    } catch (e) {
      console.warn('Failed to load certificates', e);
      setRecentCerts([]);
      setCertStats(s => ({ ...s, totalIssued: 0, delivered: 0, thisMonth: 0 }));
    }
  };

  React.useEffect(() => { loadCertificates(); }, []);

  // Generate a certificate PNG using Canvas (no extra deps), upload to Storage, return URL
  const renderCertificatePng = async (studentName: string, course: string, dateStr: string) => {
    const width = 1120; const height = 790;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,width,height);
    // Border
    ctx.strokeStyle = '#c9d3de';
    ctx.lineWidth = 2;
    ctx.strokeRect(24,24,width-48,height-48);

    // Top ribbon
    const grad1 = ctx.createLinearGradient(0,0,width,170);
    grad1.addColorStop(0,'#0b5394'); grad1.addColorStop(1,'#043d75');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(220,140,500,60,700,110);
    ctx.bezierCurveTo(880,150,1000,120,1120,60);
    ctx.lineTo(1120,0); ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'rgba(17,76,138,0.5)';
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(240,120,540,80,760,120);
    ctx.bezierCurveTo(940,150,1040,140,1120,100);
    ctx.lineTo(1120,0); ctx.closePath(); ctx.fill();

    // Bottom ribbon
    ctx.fillStyle = 'rgba(17,76,138,0.75)';
    ctx.beginPath();
    ctx.moveTo(0,170);
    ctx.bezierCurveTo(220,30,520,110,740,60);
    ctx.bezierCurveTo(940,15,1050,40,1120,80);
    ctx.lineTo(1120,170); ctx.lineTo(0,170); ctx.closePath();
    ctx.translate(0,height-170); ctx.fill(); ctx.resetTransform();

    ctx.fillStyle = 'rgba(11,83,148,0.5)';
    ctx.beginPath();
    ctx.moveTo(0,170);
    ctx.bezierCurveTo(260,60,520,130,760,90);
    ctx.bezierCurveTo(960,55,1060,80,1120,120);
    ctx.lineTo(1120,170); ctx.lineTo(0,170); ctx.closePath();
    ctx.translate(0,height-170); ctx.fill(); ctx.resetTransform();

    // Headings
    ctx.fillStyle = '#1f2b3a';
    ctx.textAlign = 'center';
    ctx.font = '600 34px Georgia, Times New Roman, serif';
    ctx.fillText('CERTIFICATE', width/2, 160);
    ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('of Achievement'.toUpperCase(), width/2, 190);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('This certificate is proudly presented to', width/2, 225);

    // Name
    ctx.fillStyle = '#2f3b4c';
    ctx.font = 'italic 48px Georgia, Times New Roman, serif';
    ctx.fillText(studentName, width/2, 275);
    // Line
    ctx.strokeStyle = '#c9d3de'; ctx.lineWidth = 2; 
    ctx.beginPath(); ctx.moveTo((width-560)/2, 290); ctx.lineTo((width+560)/2, 290); ctx.stroke();

    // Description
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto';
    const desc = `For outstanding performance and completion of ${course} on ${dateStr}.`;
    ctx.fillText(desc, width/2, 320);

    // Signatures
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
    // left
    ctx.beginPath(); ctx.moveTo(200, height-140); ctx.lineTo(440, height-140); ctx.strokeStyle = '#c9d3de'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillText('Rufus Stewart', 320, height-122);
    ctx.fillText('REPRESENTATIVES', 320, height-106);
    // right
    ctx.beginPath(); ctx.moveTo(width-440, height-140); ctx.lineTo(width-200, height-140); ctx.stroke();
    ctx.fillText('Olivia Wilson', width-320, height-122);
    ctx.fillText('REPRESENTATIVES', width-320, height-106);

    return canvas.toDataURL('image/png');
  };

  const issueCertificate = async (preferredTemplate?: string) => {
    try {
      const studentName = window.prompt('Student name?');
      if (!studentName) return;
      const course = window.prompt('Course/Quiz name?') || 'Course';
      const studentEmail = window.prompt('Student email (optional, for sending link)?') || '';
      const template = preferredTemplate || certTemplates[0]?.title || 'Classic Blue';
      const docRef = await addDoc(fsCollection(db, 'certificates'), {
        studentName,
        studentEmail,
        course,
        template,
        status: 'Pending',
        adminUserId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });
      // Generate PNG and upload
      const dateStr = new Date().toISOString().slice(0,10);
      const dataUrl = await renderCertificatePng(studentName, course, dateStr);
      const storage = getStorage();
      const path = `certificates/${docRef.id}/certificate.png`;
      const fileRef = storageRef(storage, path);
      await uploadString(fileRef, dataUrl, 'data_url');
      const url = await getDownloadURL(fileRef);
      // Update doc with fileUrl and delivered
      await updateDoc(doc(db, 'certificates', docRef.id), { fileUrl: url, status: 'Delivered' });
      await addDoc(fsCollection(db, 'healthchecks'), { source: 'cert-upload', at: serverTimestamp(), certId: docRef.id, ok: true });
      // Refresh list and open link
      await loadCertificates();
      alert('Certificate image generated and uploaded. A download link will open next.');
      if (studentEmail) {
        const subject = encodeURIComponent(`Your Certificate - ${course}`);
        const body = encodeURIComponent(`Hi ${studentName},%0D%0A%0D%0ACongratulations! Here is your certificate:%0D%0A${url}%0D%0A%0D%0ABest regards,%0D%0AEcoLearn`);
        window.open(`mailto:${studentEmail}?subject=${subject}&body=${body}`, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch (e:any) {
      alert(`Failed to issue certificate: ${e.message || e}`);
    }
  };

  const exportCertificates = async () => {
    try {
      const header = 'Student,Course,Date,Template,Status\n';
      const rows = recentCerts.map(c => [c.name, c.course, c.date, c.template, c.status].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
      const csv = header + rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'certificates.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e:any) {
      alert(`Failed to export: ${e.message || e}`);
    }
  };

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

      // Persist to Firestore
      const payload: any = {
        title,
        description,
        category,
        difficulty,
        timeLimit,
        isActive: false,
        attempts: 0,
        questionsCount: questions.length,
        createdAt: serverTimestamp(),
      };
      // Optionally store full questions array
      payload.questions = questions;
      await addDoc(collection(db, 'quizzes'), payload);

      // Refresh UI
      await reloadFsQuizzes();
      await loadAllQuizzes();

      // Reset form
      setTitle("");
      setDescription("");
      setQuestions([]);
      setShowCreateForm(false);

      alert('Quiz created. It is Draft by default. Use the table actions to Activate.');
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
      await addDoc(collection(db, "healthchecks"), {
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
      {/* Back to main EcoLearn */}
      <div className="flex items-center">
        <Link to="/">
          <Button variant="outline" size="sm" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to EcoLearn
          </Button>
        </Link>
      </div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
          {`Welcome back, ${currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Teacher')}!`}
        </h1>
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
              <Button variant="outline" className="h-20 flex-col" onClick={()=>{ setShowCreateForm(true); setActiveTab('classes'); }}>
                <Plus className="w-5 h-5 mb-2" />
                Create Quiz
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={()=> setActiveTab('classes')}>
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
              value={searchQuery}
              onChange={(e)=>setSearchQuery(e.target.value)}
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

      {/* Codespace Access */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Codespace Access</CardTitle>
          <CardDescription>Generate a unique code students can enter to join your quiz session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Class Space Name</label>
                <Input className="w-56" placeholder="e.g. Grade 7 - A" value={csName} onChange={(e)=>setCsName(e.target.value)} />
              </div>
              {!csPermanent && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">TTL (minutes)</label>
                  <Input type="number" className="w-28" value={csTtl} onChange={(e)=>setCsTtl(parseInt(e.target.value||'0',10))} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Permanent</label>
                <Switch checked={csPermanent} onCheckedChange={setCsPermanent} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Quiz</label>
                <select className="h-10 border rounded-md px-3" value={csQuizId} onChange={(e)=>setCsQuizId(e.target.value)}>
                  {fsQuizzes.map(q => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                  {fsQuizzes.length === 0 && <option value="" disabled>No quizzes</option>}
                </select>
                <Button type="button" variant="secondary" onClick={reloadFsQuizzes} className="h-10">
                  Refresh
                </Button>
              </div>
              {fsQuizzes.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No quizzes found. Create a quiz below or check Firestore rules for the `quizzes` collection.
                </div>
              )}
              <Button onClick={createCodespace} disabled={csLoading}>
                {csLoading ? 'Creating...' : 'Create Class Space'}
              </Button>
              {codespace && (
                <Button variant="outline" onClick={deactivateCodespace} disabled={csLoading}>
                  Deactivate Class Space
                </Button>
              )}
            </div>
            {codespace ? (
              <div className="flex flex-wrap items-center gap-4 p-4 border rounded-xl bg-muted/30">
                {codespace.name && (
                  <div>
                    <div className="text-sm text-muted-foreground">Class Space</div>
                    <div className="font-medium">{codespace.name}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Active Code</div>
                  <div className="text-3xl font-bold tracking-widest">{codespace.code}</div>
                </div>
                {codespace.expiresAt ? (
                  <div>
                    <div className="text-sm text-muted-foreground">Expires At</div>
                    <div className="font-medium">{new Date(codespace.expiresAt).toLocaleString()}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium"><span className="px-2 py-0.5 rounded bg-green-100 text-green-700">Permanent</span></div>
                  </div>
                )}
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(codespace.code);
                      alert('Codespace code copied!');
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No active codespace. Generate a new code for your class to join.</div>
            )}
          </div>
        </CardContent>
      </Card>

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
              {allQuizzes
                .filter(q => !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((quiz) => (
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
                        <DropdownMenuItem onClick={() => startEdit(quiz)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Attempts
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={() => removeQuiz(quiz.id)}>
                          🗑️ Delete Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Results
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={async () => {
                            try {
                              const newStatus = quiz.status === 'active' ? 'draft' : 'active';
                              await updateDoc(doc(db, 'quizzes', quiz.id), { isActive: newStatus === 'active' });
                              setAllQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, status: newStatus } : q));
                              await reloadFsQuizzes();
                              await loadAllQuizzes();
                            } catch (e:any) {
                              alert(`Failed to update quiz: ${e.message || e}`);
                            }
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">XP & Leaderboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Track student progress and engagement</p>
        </div>
        <Button variant="outline" className="rounded-lg">
          <Trophy className="w-4 h-4 mr-2" />
          Manage XP Rules
        </Button>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total XP Distributed</p>
              <p className="text-3xl font-bold mt-1">{xpStats.totalXP.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-3xl font-bold mt-1">{xpStats.activeStudents}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Certificates Earned</p>
              <p className="text-3xl font-bold mt-1">{xpStats.certificates}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Weekly XP</p>
              <p className="text-3xl font-bold mt-1">{xpStats.avgWeeklyXP}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <Card className="lg:col-span-2 rounded-xl">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  Student Leaderboard
                </CardTitle>
                <CardDescription>Rankings based on XP and achievements</CardDescription>
              </div>
              <div className="bg-muted rounded-full text-xs px-2 py-1 text-muted-foreground hidden sm:block">All Time</div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="mb-4">
              <div className="inline-flex bg-muted rounded-md p-1">
                <button
                  onClick={() => setXpTab('all')}
                  className={`px-4 py-2 text-sm rounded-md transition ${xpTab === 'all' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setXpTab('week')}
                  className={`px-4 py-2 text-sm rounded-md transition ${xpTab === 'week' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setXpTab('month')}
                  className={`px-4 py-2 text-sm rounded-md transition ${xpTab === 'month' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Quizzes</TableHead>
                    <TableHead>Certificates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((row) => (
                    <TableRow key={row.rank}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {row.rank === 1 ? (
                            <span className="text-yellow-500">🥇</span>
                          ) : row.rank === 2 ? (
                            <span className="text-gray-400">🥈</span>
                          ) : row.rank === 3 ? (
                            <span className="text-amber-700">🥉</span>
                          ) : (
                            <span className="text-muted-foreground">#{row.rank}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{row.initials}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{row.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{row.xp.toLocaleString()}</span>
                          <span className="text-xs text-green-600">+{Math.abs(row.delta)} this week</span>
                        </div>
                      </TableCell>
                      <TableCell>{row.quizzes}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" /> {row.certs}
                          </span>
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Badges */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Achievement Badges</CardTitle>
            <CardDescription>Student milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {badges.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-sm text-muted-foreground">{b.desc}</div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="rounded-full">{b.count} students</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certifications</h2>
          <p className="text-sm text-muted-foreground mt-1">Issue and track student certificates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg" onClick={exportCertificates}>
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
          <Button className="rounded-lg" onClick={() => issueCertificate()}>
            <Award className="w-4 h-4 mr-2" /> Issue Certificate
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Issued</p>
              <p className="text-3xl font-bold mt-1">{certStats.totalIssued}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-3xl font-bold mt-1">{certStats.delivered}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Send className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Templates</p>
              <p className="text-3xl font-bold mt-1">{certStats.templates}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Issued this Month</p>
              <p className="text-3xl font-bold mt-1">{certStats.thisMonth}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent certificates */}
        <Card className="lg:col-span-2 rounded-xl">
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
            <CardDescription>Latest certificates issued to students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCerts.map((c, i) => (
                    <TableRow key={`${c.name}-${i}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {c.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{c.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{c.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {c.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">{c.template}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={c.status === 'Delivered' ? 'default' : 'secondary'}
                               className={c.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                          {c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Templates panel */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Certificate Templates</CardTitle>
            <CardDescription>Choose a design to issue a certificate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certTemplates.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.type}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-2" /> Preview</Button>
                    <Button size="sm" onClick={() => issueCertificate(t.title)}><Award className="w-4 h-4 mr-2" /> Use</Button>
                  </div>
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
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your platform preferences and configuration</p>
      </div>

      {/* Top row: Profile and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input className="mt-1" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input className="mt-1" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea className="mt-1" placeholder="Tell us about yourself..." value={bio} onChange={(e)=>setBio(e.target.value)} />
              </div>
              <Button onClick={()=>alert('Profile saved')} className="bg-indigo-600 hover:bg-indigo-600/90">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Notifications</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">New Quiz Submissions</div>
                  <div className="text-sm text-muted-foreground">Get notified when students submit quizzes</div>
                </div>
                <Switch checked={notifyNewQuiz} onCheckedChange={setNotifyNewQuiz} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Class Reminders</div>
                  <div className="text-sm text-muted-foreground">Receive reminders for upcoming classes</div>
                </div>
                <Switch checked={notifyClassReminders} onCheckedChange={setNotifyClassReminders} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Certificate Requests</div>
                  <div className="text-sm text-muted-foreground">Alert when students request certificates</div>
                </div>
                <Switch checked={notifyCertRequests} onCheckedChange={setNotifyCertRequests} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Weekly Reports</div>
                  <div className="text-sm text-muted-foreground">Get weekly platform activity summaries</div>
                </div>
                <Switch checked={notifyWeeklyReports} onCheckedChange={setNotifyWeeklyReports} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Security and Platform Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Security</CardTitle>
            <CardDescription>Manage your security preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input className="mt-1" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input className="mt-1" type="password" placeholder="Enter new password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input className="mt-1" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
              </div>
              <Button variant="outline" onClick={()=>alert('Password updated')}>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Platform Settings</CardTitle>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Platform Name</label>
                <Input className="mt-1" value={platformName} onChange={(e)=>setPlatformName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Default XP per Quiz</label>
                <Input className="mt-1" type="number" value={defaultXPPerQuiz} onChange={(e)=>setDefaultXPPerQuiz(parseInt(e.target.value||'0',10))} />
              </div>
              <div>
                <label className="text-sm font-medium">Certificate Validity (months)</label>
                <Input className="mt-1" type="number" value={certValidityMonths} onChange={(e)=>setCertValidityMonths(parseInt(e.target.value||'0',10))} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-issue Certificates</div>
                  <div className="text-sm text-muted-foreground">Automatically issue certificates on course completion</div>
                </div>
                <Switch checked={autoIssueCertificates} onCheckedChange={setAutoIssueCertificates} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Public Leaderboard</div>
                  <div className="text-sm text-muted-foreground">Show leaderboard to all students</div>
                </div>
                <Switch checked={publicLeaderboard} onCheckedChange={setPublicLeaderboard} />
              </div>

              <Button onClick={()=>alert('Platform settings saved')} className="bg-indigo-600 hover:bg-indigo-600/90">Save Platform Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
                {currentUser?.photoURL && <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || currentUser.email || 'User'} />}
                <AvatarFallback>
                  {((currentUser?.displayName || currentUser?.email || '?')
                    .split(' ')
                    .map(s => s[0])
                    .join('')
                    .toUpperCase()
                    .slice(0,2))}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{currentUser?.displayName || 'Teacher'}</p>
                <p className="text-muted-foreground">{currentUser?.email || '—'}</p>
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

