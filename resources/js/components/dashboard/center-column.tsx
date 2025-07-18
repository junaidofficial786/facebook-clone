import { useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, ThumbsUp, Bold, Italic, Underline, Image as ImageIcon, X, MoreVertical, Bookmark, EyeOff, Flag, Link2 } from 'lucide-react';

export default function CenterColumn() {
    const [editorValue, setEditorValue] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { posts } = usePage().props as any;
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

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
            {posts && posts.length > 0 ? posts.map((post: any) => (
                <Card key={post.id}>
                    <CardHeader className="flex flex-row items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={post.user?.profile_pic} alt={post.user?.name} />
                                <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{post.user?.name}</div>
                                <div className="text-xs text-muted-foreground">{post.created_at_human}</div>
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
                        <div className="whitespace-pre-line">{post.content}</div>
                        {post.media && post.media.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {post.media.map((media: any, idx: number) => (
                                    <img key={idx} src={media.media_url} alt="Post Media" className="rounded-lg max-h-80 w-full object-cover" />
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        {/* Like and Comment Counts */}
                        <div className="flex gap-4 items-center mb-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`flex items-center gap-1 cursor-pointer ${post.liked_by_me ? 'text-blue-600' : ''}`}
                            >
                                <ThumbsUp className={`h-4 w-4 ${post.liked_by_me ? 'text-blue-600' : 'text-gray-700'}`} />
                                {post.reactions_count || 0} Like
                            </Button>
                            <div className="flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
                                <MessageCircle className="h-4 w-4" />
                                {post.comments?.length || 0}
                            </div>
                        </div>
                        {/* Comments */}
                        {post.comments && post.comments.length > 0 && (
                            <div className="mt-2 flex flex-col gap-3">
                                {post.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex items-start gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={comment.user?.profile_pic} alt={comment.user?.name} />
                                            <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                {comment.user?.name}
                                                <span className="text-xs text-muted-foreground font-normal">{comment.created_at_human}</span>
                                            </div>
                                            <div className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</div>
                                            <div className="flex gap-3 mt-1 items-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`px-2 py-0.5 text-xs h-7 cursor-pointer ${comment.liked_by_me ? 'text-blue-600' : ''}`}
                                                    onClick={() => alert('Like functionality coming soon!')}
                                                >
                                                    <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.liked_by_me ? 'text-blue-600' : 'text-gray-700'}`} />
                                                    Like
                                                </Button>
                                                {comment.likes_count > 0 && (
                                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-xs font-medium ml-1">
                                                        <ThumbsUp className="h-3.5 w-3.5" />
                                                        {comment.likes_count}
                                                    </span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="px-2 py-0.5 text-xs h-7 cursor-pointer"
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                >
                                                    Reply
                                                </Button>
                                            </div>
                                            {replyingTo === comment.id && (
                                                <div className="mt-2">
                                                    <Input placeholder={`Reply to ${comment.user?.name}...`} className="h-8 text-sm" autoFocus />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Input placeholder="Write a comment..." />
                    </CardFooter>
                </Card>
            )) : (
                <div className="text-center text-muted-foreground py-10">No posts found.</div>
            )}
        </div>
    );
}
