
export interface Service {
  id: string;
  title: string;
  description: string;
  providerId: string;
  providerName: string;
  price: number;
  duration: string;
  available: boolean;
  createdAt: Date;
  sessionType: 'one_on_one' | 'group';
  capacity?: number;
  startTime?: Date;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  image?: string;
  isFree: boolean;
}
