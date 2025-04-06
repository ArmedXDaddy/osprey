
export interface Announcement {
  id: string;
  eventId: string;
  creatorId: string;
  creatorName: string;
  content: string;
  createdAt: Date;
  pinned?: boolean;
}
