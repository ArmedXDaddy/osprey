
import React from 'react';
import { Post } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartIcon, MessageSquare, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          {post.userProfileImage ? (
            <img 
              src={post.userProfileImage} 
              alt={post.userName} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {post.userName.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium">{post.userName}</div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </div>
          </div>
        </div>
        
        <p className="text-gray-800 mb-3">{post.content}</p>
        
        {post.image && (
          <img 
            src={post.image} 
            alt="Post content" 
            className="rounded-md w-full object-cover mb-3" 
          />
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-2 pb-2">
        <div className="flex items-center gap-4 w-full">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <HeartIcon className="h-4 w-4" />
            <span>{post.likes}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-1 ml-auto">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostItem;
