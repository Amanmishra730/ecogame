import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, Image as ImageIcon } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

interface Post {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  caption: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

export const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [commentInputs, setCommentInputs] = React.useState<Record<string,string>>({});
  const currentUser = auth.currentUser;

  React.useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const arr: Post[] = [];
      snap.forEach(d => {
        const p: any = d.data();
        arr.push({
          id: d.id,
          userId: String(p.userId || ''),
          displayName: String(p.displayName || 'User'),
          avatarUrl: p.avatarUrl || undefined,
          caption: String(p.caption || ''),
          imageUrl: p.imageUrl || undefined,
          likesCount: Number(p.likesCount || 0),
          commentsCount: Number(p.commentsCount || 0),
          createdAt: p.createdAt || null,
        });
      });
      setPosts(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleLike = async (postId: string) => {
    if (!currentUser) return alert('Please login first');
    const likeRef = doc(db, 'communityPosts', postId, 'likes', currentUser.uid);
    const likeSnap = await getDoc(likeRef);
    const postRef = doc(db, 'communityPosts', postId);
    if (likeSnap.exists()) {
      // Unlike
      await setDoc(likeRef, { liked: false, at: serverTimestamp() }, { merge: true });
      await updateDoc(postRef, { likesCount: (posts.find(p=>p.id===postId)?.likesCount || 1) - 1 });
    } else {
      // Like
      await setDoc(likeRef, { liked: true, at: serverTimestamp(), userId: currentUser.uid }, { merge: true });
      await updateDoc(postRef, { likesCount: (posts.find(p=>p.id===postId)?.likesCount || 0) + 1 });
    }
  };

  const addComment = async (postId: string) => {
    if (!currentUser) return alert('Please login first');
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    await addDoc(collection(db, 'communityPosts', postId, 'comments'), {
      userId: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email || 'User',
      text,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'communityPosts', postId), {
      commentsCount: (posts.find(p=>p.id===postId)?.commentsCount || 0) + 1,
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  if (loading) return <div className="text-center py-10">Loading community…</div>;

  if (!posts.length) return (
    <div className="text-center py-10 text-muted-foreground">
      No posts yet. Be the first to share your achievement!
    </div>
  );

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Card key={post.id} className="overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <Avatar>
              {post.avatarUrl ? <AvatarImage src={post.avatarUrl} /> : null}
              <AvatarFallback>{post.displayName.slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">{post.displayName}</div>
              <div className="text-xs text-muted-foreground">
                {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : ''}
              </div>
            </div>
          </div>
          {post.imageUrl && (
            <div className="bg-black/5">
              <img src={post.imageUrl} alt="post" className="w-full max-h-[520px] object-cover" />
            </div>
          )}
          <div className="p-4 space-y-3">
            <div className="text-sm whitespace-pre-wrap">{post.caption}</div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => toggleLike(post.id)}>
                <Heart className="w-4 h-4 mr-2" /> {post.likesCount}
              </Button>
              <div className="text-sm text-muted-foreground flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" /> {post.commentsCount}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Add a comment…"
                value={commentInputs[post.id] || ''}
                onChange={(e)=>setCommentInputs(p=>({...p,[post.id]: e.target.value}))}
              />
              <Button size="sm" onClick={()=>addComment(post.id)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
