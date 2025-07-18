import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, ThumbsUp, X, MoreVertical, Bookmark, EyeOff, Flag, Link2 } from 'lucide-react';
import CreatePost from '@/components/dashboard/CreatePost';
import axios from 'axios';

export default function Feed() {
    const [editorValue, setEditorValue] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const { posts: initialPosts } = usePage().props as any;
    const [posts, setPosts] = useState(initialPosts?.data || []);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const loadingRef = useRef(loading);
    const hasMoreRef = useRef(hasMore);
    const pageRef = useRef(page);
    const inFlightPages = useRef<Set<number>>(new Set());
    const didLogRef = useRef(false);

    useEffect(() => {
        if (!didLogRef.current) {
            console.log('center-column page');
            didLogRef.current = true;
        }
    }, []);

    useEffect(() => {
        loadingRef.current = loading;
        hasMoreRef.current = hasMore;
        pageRef.current = page;
    }, [loading, hasMore, page]);

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

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const fetchMorePosts = useCallback(async () => {
        const nextPage = pageRef.current + 1;

        if (loadingRef.current || !hasMoreRef.current || inFlightPages.current.has(nextPage)) return;

        inFlightPages.current.add(nextPage);
        setLoading(true);
        try {
            const res = await axios.get(`/api/posts?page=${nextPage}`);
            setPosts((prev: any[]) => [...prev, ...res.data.data]);
            setHasMore(res.data.next_page_url !== null);
            setPage(nextPage);
            pageRef.current = nextPage;
        } catch (e) {
            console.error('Error fetching posts:', e);
        }
        setLoading(false);
        inFlightPages.current.delete(nextPage);
    }, []);

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout | null = null;

        const handleScroll = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                if (
                    window.innerHeight + window.scrollY + 100 >=
                    document.documentElement.scrollHeight
                ) {
                    fetchMorePosts();
                }
            }, 150);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [fetchMorePosts]);

    return (
        <div className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto">
            <CreatePost />

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
            )) : <div>No posts found.</div>}

            {loading && <div className="text-center py-4 text-muted-foreground">Loading...</div>}
            {!hasMore && <div className="text-center py-4 text-muted-foreground">No more posts</div>}
        </div>
    );
}
