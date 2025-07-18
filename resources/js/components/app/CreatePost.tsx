import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';

export default function CreatePost() {
  const [editorValue, setEditorValue] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="flex gap-2 mb-2">
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-blue-50 hover:bg-blue-100 shadow-sm px-4 py-1 transition-colors border border-blue-100">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Attach Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => setMedia(e.target.files?.[0] || null)} />
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-purple-50 hover:bg-purple-100 shadow-sm px-4 py-1 transition-colors border border-purple-100">
            <ImageIcon className="h-5 w-5 text-purple-500 rotate-90" />
            <span className="text-sm font-medium text-purple-700">Attach Video</span>
            <input type="file" accept="video/*" className="hidden" onChange={e => setMedia(e.target.files?.[0] || null)} />
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
  );
}
