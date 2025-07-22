import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/layouts/app/app-shell';

export default function GroupsCreate() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add backend logic
    alert(`Group Created!\nName: ${name}\nDescription: ${description}\nVisibility: ${visibility}`);
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Visibility</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <Button type="submit" variant="primary" className="w-full">Create Group</Button>
        </form>
      </div>
    </AppShell>
  );
}
