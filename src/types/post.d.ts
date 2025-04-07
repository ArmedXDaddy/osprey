
import { UserRole } from './index';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userProfileImage?: string;
  content: string;
  imageUrl?: string; // Changed from image to imageUrl
  commentsCount: number; // Added commentsCount property
  likes: string[]; // Changed to string[] instead of number
  createdAt: Date;
  comments?: Comment[];
}
