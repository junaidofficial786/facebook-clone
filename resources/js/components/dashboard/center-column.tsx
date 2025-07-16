import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, ThumbsUp, Bold, Italic, Underline, Image as ImageIcon, X, MoreVertical, Bookmark, EyeOff, Flag, Link2 } from 'lucide-react';

const fakePosts = [
  {
    id: 1,
    user: { name: 'Ali Raza', image: 'https://randomuser.me/api/portraits/men/21.jpg' },
    timestamp: '2 hours ago',
    content: 'This is my first post! Loving this new Facebook clone 🚀',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    user: { name: 'Sara Khan', image: 'https://randomuser.me/api/portraits/women/22.jpg' },
    timestamp: '1 hour ago',
    content: 'Check out this beautiful view!',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  },
];

export default function CenterColumn() {
  const [editorValue, setEditorValue] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simple formatting handlers
  const insertTag = (tag: string, closeTag?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = editorValue.substring(0, start);
    const selected = editorValue.substring(start, end);
    const after = editorValue.substring(end);
    setEditorValue(before + tag + selected + (closeTag || tag) + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + tag.length + selected.length + (closeTag ? closeTag.length : tag.length);
    }, 0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Custom Post Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Toolbar */}
          <div className="flex gap-2 mb-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('<b>', '</b>')}><Bold className="h-4 w-4" /></Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('<i>', '</i>')}><Italic className="h-4 w-4" /></Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => insertTag('<u>', '</u>')}><Underline className="h-4 w-4" /></Button>
            <label className="inline-flex items-center cursor-pointer">
              <ImageIcon className="h-4 w-4 mr-1" />
              <input type="file" accept="image/*" className="hidden" onChange={e => setMedia(e.target.files?.[0] || null)} />
            </label>
          </div>
          <textarea
            ref={textareaRef}
            value={editorValue}
            onChange={e => setEditorValue(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full rounded-md border border-input bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none mb-2 shadow-sm"
          />
          {media && (
            <div className="mb-2">
              <img src={URL.createObjectURL(media)} alt="Preview" className="max-h-48 rounded-lg border" />
            </div>
          )}
          <Button className="w-full">Post</Button>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {fakePosts.map(post => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.user.image} alt={post.user.name} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.user.name}</div>
                <div className="text-xs text-muted-foreground">{post.timestamp}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-red-100 text-muted-foreground" aria-label="Remove post">
                <X className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-full" aria-label="Post options">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center gap-2"><Bookmark className="h-4 w-4" /> Save Post</DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2"><EyeOff className="h-4 w-4" /> Hide Post</DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2"><Flag className="h-4 w-4" /> Report Post</DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Copy Link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') }} />
            {post.image && (
              <img src={post.image} alt="Post" className="mt-3 rounded-lg max-h-80 w-full object-cover" />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> Like</Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> Comment</Button>
            </div>
            <Input placeholder="Write a comment..." />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
