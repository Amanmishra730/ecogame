import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image as ImageIcon, Send } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export const CommunityComposer: React.FC = () => {
  const [caption, setCaption] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [posting, setPosting] = React.useState(false);
  const user = auth.currentUser;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(String(reader.result));
      reader.readAsDataURL(f);
    }
  };

  const submitPost = async () => {
    if (!user) return alert('Please login first');
    if (!caption.trim() && !imageFile) return;
    try {
      setPosting(true);
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        const storage = getStorage();
        const path = `community/${user.uid}/${Date.now()}_${imageFile.name}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, 'communityPosts'), {
        userId: user.uid,
        displayName: user.displayName || user.email || 'User',
        avatarUrl: user.photoURL || null,
        caption: caption.trim(),
        imageUrl: imageUrl || null,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      // reset
      setCaption("");
      setImageFile(null);
      setPreviewUrl("");
    } catch (e:any) {
      alert(e.message || String(e));
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar>
          {user?.photoURL ? <AvatarImage src={user.photoURL} /> : null}
          <AvatarFallback>{(user?.displayName || user?.email || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <Textarea 
          placeholder="Share your eco achievement..."
          value={caption}
          onChange={(e)=>setCaption(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm inline-flex items-center gap-2 cursor-pointer">
          <ImageIcon className="w-4 h-4" />
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          Add photo
        </label>
        <Button onClick={submitPost} disabled={posting}>
          <Send className="w-4 h-4 mr-2" /> {posting ? 'Posting...' : 'Post'}
        </Button>
      </div>
      {previewUrl && (
        <div className="rounded overflow-hidden border">
          <img src={previewUrl} alt="preview" className="w-full max-h-[360px] object-cover" />
        </div>
      )}
    </Card>
  );
};
