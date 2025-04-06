
import React from 'react';
import { Post } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.userName}</span>
            </div>
            <p className="mt-2">{post.content}</p>
            {post.image && (
              <div className="mt-3 rounded-md overflow-hidden">
                <img src={post.image} alt="Post" className="w-full h-auto" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{post.likes} likes</span>
          <span>{post.comments} comments</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
