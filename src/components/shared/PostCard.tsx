
import React, { useState } from 'react';
import { Post } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, MoreHorizontal, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { currentUser } = useAuth();
  const { likePost, unlikePost } = useData();
  const [isLiked, setIsLiked] = useState<boolean>(
    currentUser && post.userLikes ? post.userLikes.includes(currentUser.id) : false
  );
  const [likeCount, setLikeCount] = useState<number>(post.likes || 0);
  const [showComments, setShowComments] = useState<boolean>(false);
  
  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likePost(post.id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };
  
  const handleShare = () => {
    // Implementation for sharing functionality
    console.log('Share post:', post.id);
  };
  
  const handleDelete = () => {
    // Implementation for delete functionality
    console.log('Delete post:', post.id);
  };
  
  const isCurrentUserPost = currentUser && post.userId === currentUser.id;
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.userProfileImage} />
              <AvatarFallback>{post.userName ? post.userName.charAt(0).toUpperCase() : '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.userName}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isCurrentUserPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <p className="mb-4">{post.content}</p>
        
        {post.image && (
          <div className="relative rounded-md overflow-hidden mb-4">
            <img src={post.image} alt="Post content" className="w-full object-cover max-h-96" />
          </div>
        )}
        
        <div className="flex items-center text-gray-500 text-sm">
          <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          <span className="mx-2">•</span>
          <span>{post.comments} {post.comments === 1 ? 'comment' : 'comments'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-1 ${isLiked ? 'text-red-500' : ''}`} 
          onClick={handleLikeToggle}
        >
          <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
          Like
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleCommentToggle}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleShare}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
      
      {showComments && (
        <div className="px-4 py-3 border-t">
          {/* Comment display and input component would go here */}
          <p className="text-gray-500 text-sm text-center">Comments feature coming soon</p>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
