
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageSquare, MoreHorizontal, Send } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { currentUser } = useAuth();
  const { likePost, unlikePost, addComment } = useData();
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  const isLiked = post.likes && Array.isArray(post.likes) && currentUser ? post.likes.includes(currentUser.id) : false;
  
  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    try {
      if (isLiked) {
        await unlikePost(post.id, currentUser.id);
      } else {
        await likePost(post.id, currentUser.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    
    try {
      await addComment(post.id, newComment);
      setNewComment('');
      setShowComments(true);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const postCreationTime = typeof post.createdAt === 'string' 
    ? new Date(post.createdAt) 
    : post.createdAt;
  
  return (
    <Card className="mb-4">
      <CardHeader className="px-4 pt-4 pb-2 space-y-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage 
                src={post.userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName)}&background=random`} 
                alt={post.userName} 
              />
              <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{post.userName}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {post.userRole}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(postCreationTime, { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report</DropdownMenuItem>
              {currentUser?.id === post.userId && (
                <DropdownMenuItem>Delete</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-2">
        <p className="whitespace-pre-line">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mt-3">
            <img 
              src={post.imageUrl} 
              alt="Post attachment" 
              className="rounded-md max-h-96 w-full object-cover" 
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 pt-0 pb-4 flex flex-col">
        <div className="flex justify-between items-center w-full py-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLikeToggle}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="px-2" onClick={() => setShowComments(!showComments)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.commentsCount || 0}</span>
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="w-full pt-2 border-t">
            <div className="flex gap-2 mt-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[40px] flex-1"
                rows={1}
              />
              <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
