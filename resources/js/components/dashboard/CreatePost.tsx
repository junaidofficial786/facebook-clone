import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, FileVideo } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import LoaderOverlay from '@/components/ui/loader';

interface CreatePostProps {
    onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const [editorValue, setEditorValue] = useState('');
    const [media, setMedia] = useState<File[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { show: showToast } = useToast();
    const [privacy, setPrivacy] = useState('public');
    const [loading, setLoading] = useState(false);

    const csrfToken = (typeof document !== 'undefined' && document.querySelector('meta[name="csrf-token"]'))
        ? (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content
        : '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editorValue.trim() && media.length === 0) {
            showToast('Post content or media is required.');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('content', editorValue);
        formData.append('privacy', privacy);
        media.forEach((file) => {
            formData.append('media[]', file);
        });
        try {
            const res = await fetch('/posts', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            if (!res.ok) {
                let errorMsg = 'Failed to create post.';
                try {
                    const data = await res.json();
                    if (data && data.message) errorMsg = data.message;
                } catch {}
                throw new Error(errorMsg);
            }
            setEditorValue('');
            setMedia([]);
            setPrivacy('public');
            showToast('Post created successfully!');
            if (onPostCreated) onPostCreated();
        } catch (err: any) {
            showToast(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            {loading && <LoaderOverlay />}
            <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-0">Create Post</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <textarea
                        ref={textareaRef}
                        value={editorValue}
                        onChange={e => setEditorValue(e.target.value)}
                        placeholder="What's on your mind?"
                        rows={4}
                        name="content"
                        className="w-full rounded-md border border-input bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none mb-2 shadow-sm"
                    />
                    {media.length > 0 && (
                        <div className="mb-2 flex gap-2 flex-wrap">
                            {media.map((file, idx) =>
                                file.type.startsWith('image') ? (
                                    <img key={idx} src={URL.createObjectURL(file)} alt="Preview" className="max-h-32 rounded-lg border" />
                                ) : file.type.startsWith('video') ? (
                                    <video key={idx} src={URL.createObjectURL(file)} className="max-h-32 rounded-lg border" controls />
                                ) : null
                            )}
                        </div>
                    )}
                    <div className="flex gap-2 mb-4 items-center justify-start">
                        <Select value={privacy} onValueChange={setPrivacy}>
                            <SelectTrigger className="w-36 border-black focus:ring-2 focus:ring-black/40">
                                <SelectValue placeholder="Privacy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">
                                    <span className="text-black font-medium">Public</span>
                                </SelectItem>
                                <SelectItem value="friends">
                                    <span className="text-black font-medium">Friends</span>
                                </SelectItem>
                                <SelectItem value="private">
                                    <span className="text-black font-medium">Private</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="privacy" value={privacy} />
                        <label className="inline-flex items-center gap-2 cursor-pointer border border-black text-black font-semibold rounded-lg px-3 py-1.5 bg-transparent hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-black/20">
                            <ImageIcon className="h-5 w-5 text-black" />
                            <span className="text-sm font-semibold">Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                multiple
                                name="media"
                                onChange={e => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 10) {
                                        showToast('Only a maximum of 10 files are allowed.');
                                        setMedia(files.slice(0, 10));
                                    } else {
                                        setMedia(files);
                                    }
                                }}
                            />
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer border border-black text-black font-semibold rounded-lg px-3 py-1.5 bg-transparent hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-black/20">
                            <FileVideo className="h-5 w-5 text-black rotate-90" />
                            <span className="text-sm font-semibold">Video</span>
                            <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                multiple
                                name="media"
                                onChange={e => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 10) {
                                        showToast('Only a maximum of 10 files are allowed.');
                                        setMedia(files.slice(0, 10));
                                    } else {
                                        setMedia(files);
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <Button type="submit" variant="default" className="w-full font-bold text-base py-2 rounded-lg" disabled={loading}>
                        {loading ? 'Posting...' : 'Post'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
