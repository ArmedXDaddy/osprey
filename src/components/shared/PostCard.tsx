
import React, { useState } from 'react';
import { Post, Comment } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useData } from '@/context/DataContext';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  comments?: Comment[];
  showComments?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, comments = [], showComments = false }) => {
  const { likePost, unlikePost } = useData();
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(post.userLikes?.includes(currentUser?.id || '') || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const handleLike = async () => {
    if (!currentUser) return;
    
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
      
      try {
        await unlikePost(post.id);
      } catch (error) {
        // Revert state if API call fails
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        console.error('Failed to unlike post:', error);
      }
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      
      try {
        await likePost(post.id);
      } catch (error) {
        // Revert state if API call fails
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        console.error('Failed to like post:', error);
      }
    }
  };

  // Listen for real-time comments
  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  return (
    <Card className="overflow-hidden mb-4">
      <CardContent className="p-0">
        {/* Post header with user info */}
        <div className="p-4 flex items-center gap-3">
          <Link to={`/profile/${post.userId}`}>
            <Avatar className="h-10 w-10 border">
              <AvatarImage 
                src={post.userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName)}&background=random`} 
                alt={post.userName} 
              />
              <AvatarFallback>{post.userName[0]}</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${post.userId}`} className="hover:underline">
              <p className="font-medium truncate">{post.userName}</p>
            </Link>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full capitalize
                ${post.userRole === 'influencer' ? 'bg-red-100 text-red-800' : 
                  post.userRole === 'coach' ? 'bg-teal-100 text-teal-800' : 
                  post.userRole === 'company' ? 'bg-blue-100 text-blue-800' : 
                  'bg-purple-100 text-purple-800'}`}
              >
                {post.userRole}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Post content */}
        <div className="px-4 pb-4">
          <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
        </div>
        
        {/* Post image if available */}
        {post.image && (
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="py-3 px-4 flex justify-between border-t flex-col">
        <div className="w-full flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            className={`gap-1 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
            disabled={!currentUser}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => setShowCommentsSection(!showCommentsSection)}
          >
            <MessageSquare className="h-5 w-5" />
            <span>{post.comments}</span>
          </Button>
          
          <Button variant="ghost" size="sm">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        
        {showCommentsSection && (
          <div className="w-full border-t mt-2">
            <CommentSection postId={post.id} comments={localComments} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
