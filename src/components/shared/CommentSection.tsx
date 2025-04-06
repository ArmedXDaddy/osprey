import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/types';
import { MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments }) => {
  const { currentUser } = useAuth();
  const { addComment, deleteComment, updateComment } = useData();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');

  if (!currentUser) return null;

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(postId);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editedCommentText.trim()) return;
    
    try {
      await updateComment(commentId, editedCommentText);
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      
                      {(currentUser.id === comment.userId) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStartEdit(comment)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(comment.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                        className="min-h-[60px] resize-none text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-7 px-2"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleSaveEdit(comment.id)}
                          className="h-7 px-2"
                          disabled={!editedCommentText.trim() || editedCommentText === comment.content}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
                  )}
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
