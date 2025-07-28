import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/layouts/app/app-shell';
import { useForm } from '@inertiajs/react';

export default function GroupsCreate() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    visibility: 'public',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('groups.store'));
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
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              required
            />
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              rows={4}
              required
            />
            {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">Visibility</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={data.visibility}
              onChange={e => setData('visibility', e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            {errors.visibility && <div className="text-red-500 text-sm mt-1">{errors.visibility}</div>}
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={processing}>
            {processing ? 'Creating...' : 'Create Group'}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
