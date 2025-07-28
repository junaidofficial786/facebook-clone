// Helper to build comment tree from flat array
export function buildCommentTree(comments: any[]) {
    const map: { [key: number]: any } = {};
    const roots: any[] = [];
    comments.forEach(comment => {
        map[comment.id] = { ...comment, children: [] };
    });
    comments.forEach(comment => {
        if (comment.parent_id) {
            if (map[comment.parent_id]) {
                map[comment.parent_id].children.push(map[comment.id]);
            }
        } else {
            roots.push(map[comment.id]);
        }
    });
    return roots;
}

// Update renderMentions to use allUsers
import { Link } from '@inertiajs/react';
import React from 'react';
export function renderMentions(content: string, allUsers: any[]) {
    // Build a map of first word (lowercased) to id for quick lookup
    const firstNameToId: Record<string, number> = {};
    (allUsers || []).forEach(user => {
        if (user && user.name && user.id) {
            const first = user.name.split(' ')[0].toLowerCase();
            firstNameToId[first] = user.id;
        }
    });
    // Regex to match @ followed by a single word (stop at first space or punctuation)
    const regex = /(@[A-Za-z0-9_.]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }
        const mention = match[1];
        const first = mention.slice(1).toLowerCase();
        const id = firstNameToId[first];
        if (id) {
            parts.push(
                <Link key={key++} href={`/settings/profile/${id}`} className="mention">
                    {mention}
                </Link>
            );
        } else {
            parts.push(
                <span key={key++} className="mention">{mention}</span>
            );
        }
        lastIndex = match.index + mention.length;
    }
    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }
    return parts;
}
