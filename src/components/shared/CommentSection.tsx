
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/types';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments }) => {
  const { currentUser } = useAuth();
  const { addComment } = useData();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  if (!currentUser) return null;

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(postId, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3 && !showAllComments;

  return (
    <div className="pt-3 space-y-4">
      {/* Comment input */}
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
            alt={currentUser.name}
          />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            className="min-h-[40px] resize-none"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={isSubmitting || !commentText.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
      
      {/* Comments list */}
      {displayedComments.length > 0 && (
        <div className="space-y-3 pl-2">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={comment.userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random`} 
                  alt={comment.userName}
                />
                <AvatarFallback>{comment.userName[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{comment.userName}</p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {hasMoreComments && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAllComments(true)}
              className="text-primary mx-auto block"
            >
              View all {comments.length} comments
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
