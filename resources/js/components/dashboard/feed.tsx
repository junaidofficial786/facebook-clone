import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, ThumbsUp, X, MoreVertical, Bookmark, EyeOff, Flag, Link2, Loader, Globe, Users, Lock, Eye, Download } from 'lucide-react';
import CreatePost from '@/components/dashboard/CreatePost';
import axios from 'axios';
import LoaderOverlay from '@/components/ui/loader';
import Toast from '@/components/ui/toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from '@/components/ui/dialog';
import CustomDialog from '@/components/ui/CustomDialog';
import { Link } from '@inertiajs/react';

export default function Feed() {
    const [editorValue, setEditorValue] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const { posts: initialPosts, auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const [posts, setPosts] = useState(initialPosts?.data || []);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<number|null>(null);
    const [openReactionDialog, setOpenReactionDialog] = useState<{ postId?: number, commentId?: number, reactionId: number } | null>(null);
    const [reactionUsers, setReactionUsers] = useState<any[]>([]);
    const [loadingReactionUsers, setLoadingReactionUsers] = useState(false);
    const [openMediaDialog, setOpenMediaDialog] = useState<{ postId: number } | null>(null);
    const [expandedPostIds, setExpandedPostIds] = useState<number[]>([]);
    const [viewMedia, setViewMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
    const [reactions, setReactions] = useState<{id:number, name:string, icon:string}[]>([]);
    const [reactingPostId, setReactingPostId] = useState<number|null>(null);

    const loadingRef = useRef(loading);
    const hasMoreRef = useRef(hasMore);
    const pageRef = useRef(page);
    const inFlightPages = useRef<Set<number>>(new Set());
    const didLogRef = useRef(false);
    const feedContainerRef = useRef<HTMLDivElement>(null);

    const fetchPosts = async () => {
        try {
            const res = await axios.get('/api/posts');
            setPosts(res.data.data || []);
            setHasMore(res.data.next_page_url !== null);
            setPage(1);
        } catch (e) {
            // Optionally handle error
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        loadingRef.current = loading;
        hasMoreRef.current = hasMore;
        pageRef.current = page;
    }, [loading, hasMore, page]);

    useEffect(() => {
        axios.get('/api/reactions').then(res => setReactions(res.data));
    }, []);

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

    const handleDelete = async (postId: number) => {
        setDeleting(true);
        setDeleteId(postId);
        try {
            await axios.delete(`/posts/${postId}`);
            setPosts((prev: any[]) => prev.filter((p) => p.id !== postId));
            setToastMessage('Post successfully deleted');
            setShowToast(true);
        } catch (e) {
            setToastMessage('Unable to delete.');
            setShowToast(true);
        }
        setDeleting(false);
        setDeleteId(null);
    };

    const openDeleteDialog = (postId: number) => setConfirmDeleteId(postId);
    const closeDeleteDialog = () => setConfirmDeleteId(null);

    const handleEmojiClick = async (postId: number | undefined, reactionId: number, commentId?: number) => {
        setOpenReactionDialog(commentId ? { commentId, reactionId } : { postId, reactionId });
        setLoadingReactionUsers(true);
        try {
            let res;
            if (commentId) {
                res = await axios.get(`/comments/${commentId}/reactions/${reactionId}`);
            } else {
                res = await axios.get(`/posts/${postId}/reactions/${reactionId}`);
            }
            setReactionUsers(res.data.users || []);
        } catch (e) {
            setReactionUsers([]);
        }
        setLoadingReactionUsers(false);
    };
    const closeReactionDialog = () => {
        setOpenReactionDialog(null);
        setReactionUsers([]);
    };

    const handleReact = async (postId: number, reactionId: number) => {
      setReactingPostId(postId);
      try {
        await axios.post(`/api/posts/${postId}/react`, { reaction_id: reactionId });
        await fetchPosts();
      } finally {
        setReactingPostId(null);
      }
    };

    const handleUnreact = async (postId: number) => {
      setReactingPostId(postId);
      try {
        await axios.delete(`/api/posts/${postId}/react`);
        await fetchPosts();
      } finally {
        setReactingPostId(null);
      }
    };

    // Scroll listener on feed container
    useEffect(() => {
        const container = feedContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (
                container.scrollTop + container.clientHeight + 100 >=
                container.scrollHeight
            ) {
                fetchMorePosts();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [fetchMorePosts]);

    return (
        <>
            {deleting && <LoaderOverlay />}
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
            <div ref={feedContainerRef} className="flex flex-col gap-6 h-full min-h-0 max-h-screen overflow-y-auto feed-scroll">
                <CreatePost onPostCreated={fetchPosts} />

                {posts && posts.length > 0 ? posts.map((post: any) => (
                    <Card key={post.id}>
                        <CardHeader className="flex flex-row items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={post.user?.profile_pic} alt={post.user?.name} />
                                    <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">
                                        <Link href={`/settings/profile/${post.user?.id}`} className="text-black font-medium hover:underline">{post.user?.name}</Link>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {post.created_at_human}
                                        {/* Visibility Indicator: Only show for current user's posts */}
                                        {post.user?.id === currentUserId && (
                                            <>
                                                {post.visibility === 'public' && (
                                                    <span className="flex items-center gap-1 ml-2"><Globe className="h-3.5 w-3.5" /> Public</span>
                                                )}
                                                {post.visibility === 'friends' && (
                                                    <span className="flex items-center gap-1 ml-2"><Users className="h-3.5 w-3.5" /> Friends</span>
                                                )}
                                                {post.visibility === 'private' && (
                                                    <span className="flex items-center gap-1 ml-2"><Lock className="h-3.5 w-3.5" /> Private</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-auto">
                                {/* Cross button: Only show for current user's posts */}
                                {post.user?.id === currentUserId && (
                                    <>
                                        <Dialog open={confirmDeleteId === post.id} onOpenChange={(open) => !open && closeDeleteDialog()}>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-red-100 text-muted-foreground" aria-label="Remove post" onClick={() => openDeleteDialog(post.id)} disabled={deleting && deleteId === post.id}>
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Delete Post</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-2">Are you sure you want to delete this post?</div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="secondary">Cancel</Button>
                                                    </DialogClose>
                                                    <Button variant="destructive" onClick={async () => { await handleDelete(post.id); closeDeleteDialog(); }} disabled={deleting && deleteId === post.id}>
                                                        {deleting && deleteId === post.id ? 'Deleting...' : 'Confirm Delete'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                )}
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
                            {/* Post images grid */}
                            {post.media && post.media.length > 0 && (
                                <div className="mt-3 w-full">
                                    {(() => {
                                        const images = expandedPostIds.includes(post.id) ? post.media : post.media.slice(0, 4);
                                        if (images.length === 1) {
                                            const media = images[0];
                                            return (
                                                <div className="relative group">
                                                    {media.media_type === 'video' ? (
                                                        <video
                                                            src={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                            className="rounded-lg w-full max-h-[500px] mx-auto object-contain bg-black"
                                                            style={{ aspectRatio: 'auto' }}
                                                            controls
                                                            preload="none"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                            alt="Post Media"
                                                            className="rounded-lg w-full max-h-[500px] object-cover"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <button
                                                            className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                            onClick={e => { e.preventDefault(); setViewMedia({ url: media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`, type: media.media_type }); }}
                                                            title="View"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <a
                                                            href={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                            download
                                                            className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                            title="Download"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        // 2 media
                                        else if (images.length === 2) {
                                            return (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {images.map((media: any, idx: number) => (
                                                        <div key={idx} className="relative group">
                                                            {media.media_type === 'video' ? (
                                                                <video
                                                                    src={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                                    className="rounded-lg w-full h-72 object-cover"
                                                                    controls
                                                                    preload="none"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                                    alt="Post Media"
                                                                    className="rounded-lg w-full h-72 object-cover"
                                                                    loading="lazy"
                                                                />
                                                            )}
                                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <button
                                                                    className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                    onClick={e => { e.preventDefault(); setViewMedia({ url: media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`, type: media.media_type }); }}
                                                                    title="View"
                                                                >
                                                                    <Eye className="w-5 h-5" />
                                                                </button>
                                                                <a
                                                                    href={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                                    download
                                                                    className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                    title="Download"
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    <Download className="w-5 h-5" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        // 3 media
                                        else if (images.length === 3) {
                                            return (
                                                <div className="grid grid-cols-2 gap-2 h-72">
                                                    <div className="relative group col-span-1 row-span-2">
                                                        {images[0].media_type === 'video' ? (
                                                            <video
                                                                src={images[0].media_url?.startsWith('http') ? images[0].media_url : `/storage/${images[0].media_url}`}
                                                                className="rounded-lg w-full h-full object-cover"
                                                                controls
                                                                preload="none"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={images[0].media_url?.startsWith('http') ? images[0].media_url : `/storage/${images[0].media_url}`}
                                                                alt="Post Media"
                                                                className="rounded-lg w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <button
                                                                className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                onClick={e => { e.preventDefault(); setViewMedia({ url: images[0].media_url?.startsWith('http') ? images[0].media_url : `/storage/${images[0].media_url}`, type: images[0].media_type }); }}
                                                                title="View"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                            <a
                                                                href={images[0].media_url?.startsWith('http') ? images[0].media_url : `/storage/${images[0].media_url}`}
                                                                download
                                                                className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                title="Download"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <Download className="w-5 h-5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 h-full">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="relative group flex-1">
                                                                {images[i].media_type === 'video' ? (
                                                                    <video
                                                                        src={images[i].media_url?.startsWith('http') ? images[i].media_url : `/storage/${images[i].media_url}`}
                                                                        className="rounded-lg w-full h-full object-cover"
                                                                        controls
                                                                        preload="none"
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={images[i].media_url?.startsWith('http') ? images[i].media_url : `/storage/${images[i].media_url}`}
                                                                        alt="Post Media"
                                                                        className="rounded-lg w-full h-full object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                )}
                                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                    <button
                                                                        className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                        onClick={e => { e.preventDefault(); setViewMedia({ url: images[i].media_url?.startsWith('http') ? images[i].media_url : `/storage/${images[i].media_url}`, type: images[i].media_type }); }}
                                                                        title="View"
                                                                    >
                                                                        <Eye className="w-5 h-5" />
                                                                    </button>
                                                                    <a
                                                                        href={images[i].media_url?.startsWith('http') ? images[i].media_url : `/storage/${images[i].media_url}`}
                                                                        download
                                                                        className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                        title="Download"
                                                                        onClick={e => e.stopPropagation()}
                                                                    >
                                                                        <Download className="w-5 h-5" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        // 4 or more
                                        else {
                                            return (
                                                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                                                    {images.map((media: any, idx: number) => (
                                                        <div key={idx} className="relative group">
                                                            {media.media_type === 'video' ? (
                                                                <video
                                                                    src={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                                    className="rounded-lg w-full h-48 object-cover"
                                                                    controls
                                                                    preload="none"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                                    alt="Post Media"
                                                                    className="rounded-lg w-full h-48 object-cover"
                                                                    loading="lazy"
                                                                />
                                                            )}
                                                            {!expandedPostIds.includes(post.id) && idx === 3 && post.media.length > 4 && (
                                                                <button
                                                                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-lg font-semibold backdrop-blur-sm"
                                                                    onClick={() => setExpandedPostIds(ids => [...ids, post.id])}
                                                                >
                                                                    +{post.media.length - 4} more
                                                                </button>
                                                            )}
                                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <button
                                                                    className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                    onClick={e => { e.preventDefault(); setViewMedia({ url: media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`, type: media.media_type }); }}
                                                                    title="View"
                                                                >
                                                                    <Eye className="w-5 h-5" />
                                                                </button>
                                                                <a
                                                                    href={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`}
                                                                    download
                                                                    className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                                                                    title="Download"
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    <Download className="w-5 h-5" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            )}
                            {/* All Photos Dialog */}
                            {openMediaDialog && openMediaDialog.postId === post.id && (
                                <CustomDialog open={true} onClose={() => setOpenMediaDialog(null)} title="All Photos">
                                    <div className="grid grid-cols-2 gap-2">
                                        {post.media.map((media: any, idx: number) => (
                                            <img key={idx} src={media.media_url?.startsWith('http') ? media.media_url : `/storage/${media.media_url}`} alt="Post Media" className="rounded-lg max-h-80 w-full object-cover" loading="lazy" />
                                        ))}
                                    </div>
                                </CustomDialog>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="flex gap-4 items-center mb-1">
                                <div className="relative group w-fit">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex gap-2 bg-white dark:bg-gray-800 rounded-full shadow px-3 py-1 border border-gray-200 dark:border-gray-700 transition-all">
                                        {reactions.map(r => (
                                            <button
                                                key={r.id}
                                                className="text-xl hover:scale-125 transition-transform duration-100"
                                                title={r.name}
                                                onClick={() => handleReact(post.id, r.id)}
                                                type="button"
                                                disabled={reactingPostId === post.id}
                                            >
                                                {r.icon}
                                            </button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`flex items-center gap-1 cursor-pointer ${post.liked_by_me ? 'text-blue-600' : ''}`}
                                        onClick={() => post.liked_by_me ? handleUnreact(post.id) : handleReact(post.id, reactions.find(r => r.name === 'Like')?.id || reactions[0]?.id)}
                                        disabled={reactingPostId === post.id}
                                    >
                                        {post.my_reaction && post.my_reaction.icon ? (
                                            <span className="text-xl">{post.my_reaction.icon}</span>
                                        ) : (
                                            <ThumbsUp className={`h-4 w-4 ${post.liked_by_me ? 'text-blue-600' : 'text-gray-700'}`} />
                                        )}
                                        <span>{post.my_reaction ? post.my_reaction.name : 'Like'}</span>
                                    </Button>
                                </div>
                                {/* Reaction Users Dialog */}
                                {openReactionDialog && openReactionDialog.postId === post.id && (
                                    <CustomDialog open={true} onClose={closeReactionDialog} title="Users who reacted">
                                        {loadingReactionUsers ? (
                                            <div className="py-4 text-center">Loading...</div>
                                        ) : reactionUsers.length > 0 ? (
                                            <ul className="py-2">
                                                {reactionUsers.map((user: any) => (
                                                    <li key={user.id} className="py-1 flex items-center gap-2">
                                                        <Avatar className="h-6 w-6"><AvatarImage src={user.profile_pic} alt={user.name} /><AvatarFallback>{user.name?.[0]}</AvatarFallback></Avatar>
                                                        <span>{user.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="py-4 text-center text-muted-foreground">No users found.</div>
                                        )}
                                    </CustomDialog>
                                )}
                                <div className="flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
                                    <MessageCircle className="h-4 w-4" />
                                    {post.comments?.length || 0}
                                </div>
                            </div>
                            {/* Reactions below Like button */}
                            {post.reactions_summary && post.reactions_summary.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1">
                                        {post.reactions_summary.map((r: any) => (
                                            <span
                                                key={r.reaction_id}
                                                title={r.name}
                                                className="text-lg cursor-pointer px-1 rounded hover:bg-gray-200"
                                                onClick={e => { e.stopPropagation(); handleEmojiClick(post.id, r.reaction_id); }}
                                            >
                                                {r.icon}
                                            </span>
                                        ))}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {post.reactions_count} user{post.reactions_count !== 1 ? 's' : ''} reacted to this post
                                    </span>
                                </div>
                            )}
                            {/* Comments and comment input */}
                            <div className="mt-2 flex flex-col gap-3">
                                {post.comments && post.comments.length > 0 && post.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex items-start gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={comment.user?.profile_pic} alt={comment.user?.name} />
                                            <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                <Link href={`/settings/profile/${comment.user?.id}`} className="text-black font-medium hover:underline">{comment.user?.name}</Link>
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
                                                    {comment.my_reaction && comment.my_reaction.icon ? (
                                                        <span className="text-lg">{comment.my_reaction.icon}</span>
                                                    ) : (
                                                        <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.liked_by_me ? 'text-blue-600' : 'text-gray-700'}`} />
                                                    )}
                                                    <span>{comment.my_reaction ? comment.my_reaction.name : 'Like'}</span>
                                                </Button>
                                                {/* Comment reactions summary */}
                                                {comment.reactions_summary && comment.reactions_summary.length > 0 && (
                                                    <span className="flex items-center gap-0.5 ml-2">
                                                        {comment.reactions_summary.map((r: any) => (
                                                            <span
                                                                key={r.reaction_id}
                                                                title={r.name}
                                                                className="text-lg cursor-pointer px-1 rounded hover:bg-gray-200"
                                                                onClick={e => { e.stopPropagation(); handleEmojiClick(undefined, r.reaction_id, comment.id); }}
                                                            >
                                                                {r.icon} <span className="text-xs align-middle">{r.count}</span>
                                                            </span>
                                                        ))}
                                                    </span>
                                                )}
                                                {/* Comment Reaction Users Dialog */}
                                                {openReactionDialog && openReactionDialog.commentId === comment.id && (
                                                    <CustomDialog open={true} onClose={closeReactionDialog} title="Users who reacted">
                                                        {loadingReactionUsers ? (
                                                            <div className="py-4 text-center">Loading...</div>
                                                        ) : reactionUsers.length > 0 ? (
                                                            <ul className="py-2">
                                                                {reactionUsers.map((user: any) => (
                                                                    <li key={user.id} className="py-1 flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6"><AvatarImage src={user.profile_pic} alt={user.name} /><AvatarFallback>{user.name?.[0]}</AvatarFallback></Avatar>
                                                                        <span>{user.name}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="py-4 text-center text-muted-foreground">No users found.</div>
                                                        )}
                                                    </CustomDialog>
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
                                <Input placeholder="Write a comment..." />
                            </div>
                        </CardFooter>
                    </Card>
                )) : <div>No posts found.</div>}

                {loading && <div className="text-center py-4 text-muted-foreground">Loading...</div>}
                {!hasMore && <div className="text-center py-4 text-muted-foreground">No more posts</div>}
            </div>
            {/* Media View Modal */}
            {viewMedia && (
                <Dialog open={!!viewMedia} onOpenChange={open => !open && setViewMedia(null)}>
                    <DialogContent className="max-w-3xl flex flex-col items-center justify-center">
                        <button className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-2" onClick={() => setViewMedia(null)}>
                            <X className="w-6 h-6" />
                        </button>
                        {viewMedia.type === 'image' ? (
                            <img src={viewMedia.url} alt="View Media" className="max-h-[80vh] max-w-full rounded-lg" loading="lazy" />
                        ) : (
                            <video src={viewMedia.url} controls autoPlay className="max-h-[80vh] max-w-full rounded-lg bg-black object-contain" preload="none" style={{ aspectRatio: 'auto' }} />
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
