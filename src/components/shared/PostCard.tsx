
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, MoreHorizontal, Trash2, Share } from "lucide-react";
import { formatDistance } from 'date-fns';
import { Link } from 'react-router-dom';
import { Post, Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import CommentSection from './CommentSection';
import { useData } from '@/context/DataContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
  comments?: Comment[];
}

const PostCard: React.FC<PostCardProps> = ({ post, comments = [] }) => {
  const { currentUser } = useAuth();
  const { likePost, unlikePost, deletePost } = useData();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    return post.userLikes?.includes(currentUser?.id || '') || false;
  });
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await likePost(post.id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  
  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted."
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the post."
      });
    }
  };
  
  const handleShare = () => {
    // Create a URL to the post (this would ideally point to a specific post view)
    const postUrl = `${window.location.origin}/explore?post=${post.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(postUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Post link has been copied to your clipboard."
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard."
      });
    });
  };
  
  const isPostOwner = currentUser && post.userId === currentUser.id;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Link to={`/profile/${post.userId}`}>
              <img 
                src={post.userProfileImage || "https://via.placeholder.com/40"} 
                alt={post.userName}
                className="w-10 h-10 rounded-full mr-3 object-cover" 
              />
            </Link>
            <div>
              <Link to={`/profile/${post.userId}`} className="font-medium hover:underline">
                {post.userName}
              </Link>
              <p className="text-xs text-gray-500">
                {formatDistance(post.createdAt, new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isPostOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="mt-3">
          <p className="whitespace-pre-line">{post.content}</p>
          
          {post.image && (
            <img 
              src={post.image} 
              alt="Post content" 
              className="mt-3 rounded-md w-full max-h-96 object-cover" 
            />
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex justify-between border-t">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={handleLikeToggle}
          >
            <Heart 
              className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
            />
            <span>{likesCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
      
      {showComments && (
        <CommentSection postId={post.id} comments={comments} />
      )}
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post
              and remove all data associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PostCard;
