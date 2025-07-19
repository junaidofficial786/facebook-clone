import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, FileVideo } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function CreatePost() {
    const [editorValue, setEditorValue] = useState('');
    const [media, setMedia] = useState<File[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { show: showToast } = useToast();
    const [privacy, setPrivacy] = useState('public');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-0">Create Post</CardTitle>
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
                    <label className="inline-flex items-center gap-2 cursor-pointer border border-black text-black font-semibold rounded-lg px-3 py-1.5 bg-transparent hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-black/20">
                        <ImageIcon className="h-5 w-5 text-black" />
                        <span className="text-sm font-semibold">Photo</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            multiple
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
                <Button variant="default" className="w-full font-bold text-base py-2 rounded-lg">Post</Button>
            </CardContent>
        </Card>
    );
}
