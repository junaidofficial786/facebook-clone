import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, FileVideo } from 'lucide-react';

export default function CreatePost() {
    const [editorValue, setEditorValue] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Create Post</CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="flex gap-2 mb-2 justify-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer border border-blue-400 text-blue-700 font-semibold rounded-lg px-3 py-1.5 bg-transparent hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-200">
                        <ImageIcon className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-semibold">Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => setMedia(e.target.files?.[0] || null)} />
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer border border-purple-400 text-purple-700 font-semibold rounded-lg px-3 py-1.5 bg-transparent hover:bg-purple-50 transition-colors focus:ring-2 focus:ring-purple-200">
                        <FileVideo className="h-5 w-5 text-purple-500 rotate-90" />
                        <span className="text-sm font-semibold">Video</span>
                        <input type="file" accept="video/*" className="hidden" onChange={e => setMedia(e.target.files?.[0] || null)} />
                    </label>
                </div>
                <Button className="w-full font-bold text-base py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">Post</Button>
            </CardContent>
        </Card>
    );
}
