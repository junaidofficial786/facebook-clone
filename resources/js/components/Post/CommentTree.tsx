import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CustomDialog from '@/components/ui/CustomDialog';
import { Link } from '@inertiajs/react';
import { ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CommentTree = ({
  comments,
  postId,
  allUsers,
  replyingTo,
  setReplyingTo,
  replyInputs,
  handleReplyInputChange,
  handleReplySubmit,
  reactions,
  handleCommentReact,
  reactingPostId,
  hoveredCommentId,
  handleCommentMouseEnter,
  handleCommentMouseLeave,
  openReactionDialog,
  closeReactionDialog,
  loadingReactionUsers,
  reactionUsers,
  handleEmojiClick,
  renderMentions
}) => {
  // Define the delayed hover handlers inside CommentTree so they are in scope
  const commentLikeHoverTimeout = useRef({});
  const [localHoveredCommentId, setLocalHoveredCommentId] = useState(null);

  const handleCommentLikeMouseEnter = (commentId) => {
    if (commentLikeHoverTimeout.current[commentId]) clearTimeout(commentLikeHoverTimeout.current[commentId]);
    commentLikeHoverTimeout.current[commentId] = setTimeout(() => {
      setLocalHoveredCommentId(commentId);
    }, 400);
  };
  const handleCommentLikeMouseLeave = (commentId) => {
    if (commentLikeHoverTimeout.current[commentId]) clearTimeout(commentLikeHoverTimeout.current[commentId]);
    setLocalHoveredCommentId(null);
  };

  return comments.map(comment => (
    <div key={comment.id} className="flex items-start gap-2 mt-2" style={{ marginLeft: comment.parent_id ? 32 : 0 }}>
      <Avatar className="h-7 w-7">
        <AvatarImage src={comment.user?.profile_pic} alt={comment.user?.name} />
        <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
        <div className="font-medium text-sm flex items-center gap-2">
          <Link href={`/settings/profile/${comment.user?.id}`} className="text-black font-medium hover:underline">{comment.user?.name}</Link>
          <span className="text-xs text-muted-foreground font-normal">{comment.created_at_human}</span>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-line">{renderMentions(comment.content, allUsers)}</div>
        <div className="flex gap-3 mt-1 items-center">
          <div
            className="relative w-fit"
            onMouseEnter={() => handleCommentLikeMouseEnter(comment.id)}
            onMouseLeave={() => handleCommentLikeMouseLeave(comment.id)}
          >
            {localHoveredCommentId === comment.id && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white dark:bg-gray-800 rounded-full shadow px-3 py-1 border border-gray-200 dark:border-gray-700 transition-all">
                {reactions.map(r => (
                  <button
                    key={r.id}
                    className={`text-xl hover:scale-125 transition-transform duration-100${comment.my_reaction && comment.my_reaction.name === r.name ? ' ring-2 ring-blue-400' : ''}`}
                    title={r.name}
                    onClick={() => handleCommentReact(comment.id, r.id, comment.my_reaction?.name === r.name ? r.id : undefined)}
                    type="button"
                    disabled={reactingPostId === comment.id}
                  >
                    {r.icon}
                  </button>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 py-0.5 text-xs h-7 cursor-pointer ${comment.liked_by_me ? 'text-blue-600' : ''}`}
              onClick={() => comment.liked_by_me ? handleCommentReact(comment.id, comment.my_reaction?.id, comment.my_reaction?.id) : handleCommentReact(comment.id, reactions.find(r => r.name === 'Like')?.id || reactions[0]?.id)}
              disabled={reactingPostId === comment.id}
            >
              {comment.my_reaction && comment.my_reaction.icon ? (
                <span className="text-lg">{comment.my_reaction.icon}</span>
              ) : (
                <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.liked_by_me ? 'text-blue-600' : 'text-gray-700'}`} />
              )}
              <span>{comment.my_reaction ? comment.my_reaction.name : 'Like'}</span>
            </Button>
          </div>
          {comment.reactions_summary && comment.reactions_summary.length > 0 && (
            <span className="flex items-center gap-0.5 ml-2">
              {comment.reactions_summary.map((r) => (
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
          {openReactionDialog && openReactionDialog.commentId === comment.id && (
            <CustomDialog open={true} onClose={closeReactionDialog} title="Users who reacted">
              {loadingReactionUsers ? (
                <div className="py-4 text-center">Loading...</div>
              ) : reactionUsers.length > 0 ? (
                <ul className="py-2">
                  {reactionUsers.map((user) => (
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
          <div className="mt-2 flex gap-2">
            <Input
              placeholder={`Reply to ${comment.user?.name}...`}
              className="h-8 text-sm"
              value={replyInputs[comment.id] || ''}
              onChange={e => handleReplyInputChange(comment.id, e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReplySubmit(postId, comment.id);
                }
              }}
            />
            <Button
              variant="default"
              onClick={() => handleReplySubmit(postId, comment.id)}
              disabled={!(replyInputs[comment.id] && replyInputs[comment.id].trim())}
              className="h-8"
            >
              Reply
            </Button>
          </div>
        )}
        {comment.children && comment.children.length > 0 && (
          <CommentTree
            comments={comment.children}
            postId={postId}
            allUsers={allUsers}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyInputs={replyInputs}
            handleReplyInputChange={handleReplyInputChange}
            handleReplySubmit={handleReplySubmit}
            reactions={reactions}
            handleCommentReact={handleCommentReact}
            reactingPostId={reactingPostId}
            hoveredCommentId={hoveredCommentId}
            handleCommentMouseEnter={handleCommentMouseEnter}
            handleCommentMouseLeave={handleCommentMouseLeave}
            openReactionDialog={openReactionDialog}
            closeReactionDialog={closeReactionDialog}
            loadingReactionUsers={loadingReactionUsers}
            reactionUsers={reactionUsers}
            handleEmojiClick={handleEmojiClick}
            renderMentions={renderMentions}
          />
        )}
      </div>
    </div>
  ));
};
export default CommentTree;
