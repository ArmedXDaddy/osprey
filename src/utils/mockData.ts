
import { Service, ServiceType, Post, Event, Group, Session, SessionEnrollment, Message, JoinRequest, User, UserRole } from '@/types';

// Generate mock user profiles for different roles
export const generateMockProfiles = (): User[] => {
  return [
    {
      id: 'mock-user-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'user',
      profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'Fitness enthusiast looking to connect with like-minded people',
      location: 'New York, NY',
      followers: 23,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      socialLinks: {
        instagram: 'alexfit',
        twitter: 'alexj'
      }
    },
    {
      id: 'mock-influencer-1',
      name: 'Jessica Williams',
      email: 'jessica@example.com',
      role: 'influencer',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'Fitness influencer, yoga instructor, and nutrition enthusiast. Sharing my journey to inspire others.',
      location: 'Los Angeles, CA',
      followers: 15700,
      verified: true,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      socialLinks: {
        instagram: 'jessica_fit',
        youtube: 'jessicafitness',
        tiktok: 'jessicaw'
      }
    },
    {
      id: 'mock-coach-1',
      name: 'Michael Davis',
      email: 'michael@example.com',
      role: 'coach',
      profileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'Certified personal trainer with 10+ years of experience. Specializing in strength training and weight loss.',
      location: 'Chicago, IL',
      followers: 2480,
      verified: true,
      createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000),
      socialLinks: {
        instagram: 'coach_mike',
        website: 'mikefitness.com'
      }
    },
    {
      id: 'mock-company-1',
      name: 'FitGear Inc.',
      email: 'contact@fitgear.example.com',
      role: 'company',
      profileImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'Premium fitness equipment and apparel. Helping you achieve your fitness goals with quality products.',
      location: 'San Francisco, CA',
      followers: 12600,
      verified: true,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      socialLinks: {
        instagram: 'fitgear_official',
        twitter: 'fitgear',
        website: 'fitgear.example.com'
      }
    },
    {
      id: 'mock-user-2',
      name: 'Sam Rodriguez',
      email: 'sam@example.com',
      role: 'user',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'New to fitness, looking for guidance and community support.',
      location: 'Miami, FL',
      followers: 12,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-influencer-2',
      name: 'Taylor Chen',
      email: 'taylor@example.com',
      role: 'influencer',
      profileImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'Fitness model and lifestyle influencer. Passionate about holistic health and wellness.',
      location: 'Austin, TX',
      followers: 68500,
      verified: true,
      createdAt: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000),
      socialLinks: {
        instagram: 'taylor_fitness',
        youtube: 'taylorfitlife'
      }
    },
    {
      id: 'mock-coach-2',
      name: 'Olivia Martinez',
      email: 'olivia@example.com',
      role: 'coach',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'Nutrition coach and personal trainer. Specializing in women's health and postpartum fitness.',
      location: 'Seattle, WA',
      followers: 3250,
      verified: true,
      createdAt: new Date(Date.now() - 310 * 24 * 60 * 60 * 1000),
      socialLinks: {
        instagram: 'coach_olivia',
        website: 'oliviafitness.example.com'
      }
    },
    {
      id: 'mock-company-2',
      name: 'NutriBoost',
      email: 'info@nutriboost.example.com',
      role: 'company',
      profileImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      bio: 'Nutrition supplements and protein products for athletes and fitness enthusiasts.',
      location: 'Boston, MA',
      followers: 9870,
      verified: true,
      createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
      socialLinks: {
        instagram: 'nutriboost',
        twitter: 'nutriboost_official',
        website: 'nutriboost.example.com'
      }
    }
  ];
};

// Generate mock services
export const generateMockServices = (): Service[] => {
  return [
    {
      id: 'mock-service-1',
      title: 'Personal Training Session',
      description: 'One-on-one fitness coaching tailored to your specific goals and fitness level. Whether you're just starting out or looking to break through a plateau, these personalized sessions will help you achieve results faster.',
      providerId: 'mock-coach-1',
      providerName: 'Michael Davis',
      price: 50,
      duration: '1 hour',
      available: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isOnline: false,
      location: 'Fitness Center, Chicago',
      capacity: 1,
      serviceType: 'one_on_one' as ServiceType,
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      meetingUrl: null
    },
    {
      id: 'mock-service-2', 
      title: 'Online Nutrition Consultation',
      description: 'Personalized nutrition advice to complement your fitness routine. Get a customized meal plan and practical tips to optimize your diet for your specific goals, whether it's weight loss, muscle gain, or improved athletic performance.',
      providerId: 'mock-coach-2',
      providerName: 'Olivia Martinez',
      price: 75,
      duration: '45 minutes',
      available: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      isOnline: true,
      location: null,
      capacity: 1,
      serviceType: 'one_on_one' as ServiceType,
      coverImage: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      meetingUrl: 'https://meet.example.com/nutrition'
    },
    {
      id: 'mock-service-3', 
      title: 'Group HIIT Workout',
      description: 'High-Intensity Interval Training in a motivating group setting. This fast-paced, calorie-burning workout alternates between intense bursts of activity and fixed periods of less-intense activity or rest.',
      providerId: 'mock-coach-1',
      providerName: 'Michael Davis',
      price: 25,
      duration: '30 minutes',
      available: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isOnline: false,
      location: 'City Park, Chicago',
      capacity: 10,
      serviceType: 'group' as ServiceType,
      coverImage: 'https://images.unsplash.com/photo-1571388208497-71bedc66e932?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      meetingUrl: null
    },
    {
      id: 'mock-service-4', 
      title: 'Live Yoga Flow',
      description: 'Join this live online yoga session for a balanced blend of strength, flexibility, and mindfulness practices suitable for all levels.',
      providerId: 'mock-influencer-1',
      providerName: 'Jessica Williams',
      price: 15,
      duration: '1 hour',
      available: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isOnline: true,
      location: null,
      capacity: 30,
      serviceType: 'group' as ServiceType,
      coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      meetingUrl: 'https://zoom.example.com/yoga-flow'
    }
  ];
};

// Generate mock groups 
export const generateMockGroups = (): Group[] => {
  return [
    {
      id: 'mock-group-1',
      name: 'Fitness Enthusiasts',
      description: 'A community for people passionate about fitness and healthy living. Share your journey, ask questions, and connect with like-minded individuals on their fitness path.',
      creatorId: 'mock-coach-1',
      creatorName: 'Michael Davis',
      creatorRole: 'coach',
      members: 45,
      memberIds: ['mock-user-1', 'mock-user-2', 'mock-influencer-2'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'public',
      price: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      pendingRequests: 0,
      rules: ['Be respectful', 'No spam', 'Share your progress'],
      memberLimit: 100
    },
    {
      id: 'mock-group-2',
      name: 'Nutrition & Diet Support',
      description: 'Share tips and get support for your nutrition and diet goals. A place to discuss meal planning, dietary requirements, and healthy eating habits.',
      creatorId: 'mock-coach-2',
      creatorName: 'Olivia Martinez',
      creatorRole: 'coach',
      members: 120,
      memberIds: ['mock-user-1', 'mock-influencer-1'],
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'private',
      price: null,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      pendingRequests: 5,
      rules: ['Share evidence-based information', 'Be supportive', 'No promotion of extreme diets'],
      memberLimit: 150
    },
    {
      id: 'mock-group-3',
      name: 'Premium Workout Plans',
      description: 'Access to premium workout plans with weekly updates. Get structured training programs designed by professionals to help you reach your fitness goals efficiently.',
      creatorId: 'mock-influencer-1',
      creatorName: 'Jessica Williams',
      creatorRole: 'influencer',
      members: 75,
      memberIds: ['mock-user-2'],
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'paid',
      price: 9.99,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      pendingRequests: 0,
      rules: ['Members only content', 'No sharing outside the group', 'Ask questions anytime'],
      memberLimit: 200
    },
    {
      id: 'mock-group-4',
      name: 'Running Club',
      description: 'For running enthusiasts of all levels. Share routes, training tips, race events, and connect with fellow runners in your area.',
      creatorId: 'mock-user-1',
      creatorName: 'Alex Johnson',
      creatorRole: 'user',
      members: 32,
      memberIds: ['mock-coach-1', 'mock-influencer-2'],
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'public',
      price: null,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      pendingRequests: 2,
      rules: ['Support all pace levels', 'Share safety tips', 'Organize weekly runs'],
      memberLimit: 75
    },
    {
      id: 'mock-group-5',
      name: 'FitGear Product Testing',
      description: 'Exclusive group for testing and providing feedback on new FitGear products before they hit the market.',
      creatorId: 'mock-company-1',
      creatorName: 'FitGear Inc.',
      creatorRole: 'company',
      members: 28,
      memberIds: ['mock-influencer-1', 'mock-influencer-2', 'mock-coach-1'],
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'private',
      price: null,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      pendingRequests: 8,
      rules: ['Sign NDA', 'Provide honest feedback', 'Return products when requested'],
      memberLimit: 50
    }
  ];
};

// Generate mock events
export const generateMockEvents = (): Event[] => {
  return [
    {
      id: 'mock-event-1',
      title: 'Summer Fitness Bootcamp',
      description: 'Join us for an intensive outdoor fitness bootcamp. All fitness levels welcome! This event will include circuit training, HIIT, and team-based exercises in a motivating environment.',
      creatorId: 'mock-coach-1',
      creatorName: 'Michael Davis',
      creatorRole: 'coach',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      location: 'Central Park, New York',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'public',
      price: 25,
      attendees: [],
      pendingRequests: 3,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'mock-event-2',
      title: 'Nutrition Workshop',
      description: 'Learn about balanced nutrition and how to prepare healthy meals with our expert nutritionist. This interactive workshop includes meal planning guidance and recipe demonstrations.',
      creatorId: 'mock-coach-2',
      creatorName: 'Olivia Martinez',
      creatorRole: 'coach',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in future
      location: 'Community Center, Seattle',
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'private',
      price: 15,
      attendees: [],
      pendingRequests: 7,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'mock-event-3',
      title: 'Yoga in the Park',
      description: 'Join our free community yoga session in the park. Bring your mat and enjoy a relaxing flow suitable for all levels. Connect with nature and other yoga enthusiasts.',
      creatorId: 'mock-influencer-1',
      creatorName: 'Jessica Williams',
      creatorRole: 'influencer',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      location: 'Sunset Park, Los Angeles',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'public',
      price: null,
      attendees: [],
      pendingRequests: 0,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'mock-event-4',
      title: 'Product Launch: New Fitness Tracker',
      description: 'Be the first to see our latest fitness tracker with advanced health monitoring features. Product demonstration, Q&A session, and special launch day discounts available.',
      creatorId: 'mock-company-1',
      creatorName: 'FitGear Inc.',
      creatorRole: 'company',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days in future
      location: 'FitGear Headquarters, San Francisco',
      image: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'public',
      price: null,
      attendees: [],
      pendingRequests: 12,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'mock-event-5',
      title: 'Marathon Training Group',
      description: 'Weekly training sessions for the upcoming city marathon. Professional guidance, pacing strategies, and nutrition advice for marathon preparation.',
      creatorId: 'mock-influencer-2',
      creatorName: 'Taylor Chen',
      creatorRole: 'influencer',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      location: 'Riverside Track, Austin',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      privacy: 'private',
      price: 30,
      attendees: [],
      pendingRequests: 5,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    }
  ];
};

// Generate mock posts
export const generateMockPosts = (): Post[] => {
  return [
    {
      id: 'mock-post-1',
      userId: 'mock-influencer-1',
      userName: 'Jessica Williams',
      userRole: 'influencer',
      userProfileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Just wrapped up an amazing yoga session with 30 participants! Remember that consistency is key in your practice. Even 10 minutes a day can make a huge difference in your flexibility and mindfulness. #YogaEveryday',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      likesCount: 156,
      commentsCount: 12
    },
    {
      id: 'mock-post-2',
      userId: 'mock-coach-1',
      userName: 'Michael Davis',
      userRole: 'coach',
      userProfileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Tip of the day: Progressive overload is essential for building strength. Gradually increase weight, frequency, or reps to keep challenging your muscles and avoid plateaus. What's your favorite strength training exercise?',
      image: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      likesCount: 92,
      commentsCount: 24
    },
    {
      id: 'mock-post-3',
      userId: 'mock-company-1',
      userName: 'FitGear Inc.',
      userRole: 'company',
      userProfileImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Exciting news! Our new line of sustainable workout gear made from recycled materials is dropping next month. Early access will be available for our community members. Stay tuned! #SustainableFitness',
      image: 'https://images.unsplash.com/photo-1556718232-31d96801b6f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      likesCount: 210,
      commentsCount: 45
    },
    {
      id: 'mock-post-4',
      userId: 'mock-user-1',
      userName: 'Alex Johnson',
      userRole: 'user',
      userProfileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Hit a new personal record today - 5K in 23 minutes! Been following Coach Michael's training plan for 6 weeks and seeing great results. Never thought I'd enjoy running this much!',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      likesCount: 34,
      commentsCount: 8
    },
    {
      id: 'mock-post-5',
      userId: 'mock-coach-2',
      userName: 'Olivia Martinez',
      userRole: 'coach',
      userProfileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Nutrition myth busting: Carbs are NOT the enemy! They're essential for energy, especially if you're active. Focus on whole grains, fruits, and vegetables for quality carbohydrates that fuel your workouts and recovery.',
      image: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      likesCount: 187,
      commentsCount: 32
    },
    {
      id: 'mock-post-6',
      userId: 'mock-influencer-2',
      userName: 'Taylor Chen',
      userRole: 'influencer',
      userProfileImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Morning routine check! ☀️ 5am wake-up, meditation, 5-mile run, protein smoothie, and now ready to tackle the day. What does your morning routine look like?',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
      likesCount: 342,
      commentsCount: 76
    }
  ];
};

// Generate mock sessions data
export const generateMockSessions = (): Session[] => {
  return [
    {
      id: 'mock-session-1',
      serviceId: 'mock-service-1',
      coachId: 'mock-coach-1',
      coachName: 'Michael Davis',
      title: 'Strength Training Fundamentals',
      description: 'Learn proper techniques for basic strength exercises including squats, deadlifts, and bench press.',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      location: 'Fitness Center, Chicago',
      isOnline: false,
      meetingUrl: null,
      capacity: 1,
      enrolled: 0,
      price: 50,
      isAvailable: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-session-2',
      serviceId: 'mock-service-2',
      coachId: 'mock-coach-2',
      coachName: 'Olivia Martinez',
      title: 'Personalized Nutrition Planning',
      description: 'One-on-one consultation to create a nutrition plan tailored to your specific goals and dietary requirements.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      startTime: '2:00 PM',
      endTime: '2:45 PM',
      location: null,
      isOnline: true,
      meetingUrl: 'https://meet.example.com/nutrition-session-2',
      capacity: 1,
      enrolled: 1,
      price: 75,
      isAvailable: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-session-3',
      serviceId: 'mock-service-3',
      coachId: 'mock-coach-1',
      coachName: 'Michael Davis',
      title: 'Group HIIT Challenge',
      description: 'High-intensity interval training session designed to burn calories and improve cardiovascular fitness.',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day in future
      startTime: '5:30 PM',
      endTime: '6:00 PM',
      location: 'City Park, Chicago',
      isOnline: false,
      meetingUrl: null,
      capacity: 10,
      enrolled: 5,
      price: 25,
      isAvailable: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-session-4',
      serviceId: 'mock-service-4',
      coachId: 'mock-influencer-1',
      coachName: 'Jessica Williams',
      title: 'Vinyasa Flow Yoga',
      description: 'Dynamic yoga practice connecting breath with movement for improved strength and flexibility.',
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days in future
      startTime: '8:00 AM',
      endTime: '9:00 AM',
      location: null,
      isOnline: true,
      meetingUrl: 'https://zoom.example.com/yoga-flow-session',
      capacity: 30,
      enrolled: 12,
      price: 15,
      isAvailable: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Generate mock session enrollments
export const generateMockSessionEnrollments = (): SessionEnrollment[] => {
  return [
    {
      id: 'mock-enrollment-1',
      sessionId: 'mock-session-2',
      userId: 'mock-user-1',
      userName: 'Alex Johnson',
      userEmail: 'alex@example.com',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 75,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-enrollment-2',
      sessionId: 'mock-session-3',
      userId: 'mock-user-1',
      userName: 'Alex Johnson',
      userEmail: 'alex@example.com',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 25,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-enrollment-3',
      sessionId: 'mock-session-3',
      userId: 'mock-user-2',
      userName: 'Sam Rodriguez',
      userEmail: 'sam@example.com',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 25,
      createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-enrollment-4',
      sessionId: 'mock-session-4',
      userId: 'mock-user-1',
      userName: 'Alex Johnson',
      userEmail: 'alex@example.com',
      status: 'pending',
      paymentStatus: 'unpaid',
      amount: 15,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Generate mock messages for group chats
export const generateMockMessages = (): Message[] => {
  return [
    {
      id: 'mock-message-1',
      groupId: 'mock-group-1',
      userId: 'mock-coach-1',
      userName: 'Michael Davis',
      userRole: 'coach',
      userProfileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Welcome everyone to the Fitness Enthusiasts group! Feel free to introduce yourselves and share your fitness goals.',
      createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-message-2',
      groupId: 'mock-group-1',
      userId: 'mock-user-1',
      userName: 'Alex Johnson',
      userRole: 'user',
      userProfileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Hi everyone! I\'m Alex from New York. My goal is to improve my running endurance and maybe train for a half marathon by the end of the year.',
      createdAt: new Date(Date.now() - 28.9 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-message-3',
      groupId: 'mock-group-1',
      userId: 'mock-user-2',
      userName: 'Sam Rodriguez',
      userRole: 'user',
      userProfileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Hello from Miami! I\'m new to fitness and looking to build a consistent workout routine. Any tips for beginners would be much appreciated!',
      createdAt: new Date(Date.now() - 28.8 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-message-4',
      groupId: 'mock-group-1',
      userId: 'mock-coach-1',
      userName: 'Michael Davis',
      userRole: 'coach',
      userProfileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Great to see everyone joining! @Sam - For beginners, consistency is key. Start with 2-3 workouts per week and gradually increase. Focus on proper form before increasing intensity.',
      createdAt: new Date(Date.now() - 28.7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-message-5',
      groupId: 'mock-group-2',
      userId: 'mock-coach-2',
      userName: 'Olivia Martinez',
      userRole: 'coach',
      userProfileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Welcome to the Nutrition & Diet Support group! This is a safe space to discuss nutrition topics, share recipes, and support each other\'s dietary goals.',
      createdAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-message-6',
      groupId: 'mock-group-2',
      userId: 'mock-user-1',
      userName: 'Alex Johnson',
      userRole: 'user',
      userProfileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      content: 'Hi Olivia! I\'ve been struggling with post-workout nutrition. Any recommendations for good recovery meals that aren\'t too heavy?',
      createdAt: new Date(Date.now() - 58.5 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Generate mock join requests
export const generateMockJoinRequests = (): JoinRequest[] => {
  return [
    {
      id: 'mock-request-1',
      groupId: 'mock-group-2',
      userId: 'mock-user-2',
      userName: 'Sam Rodriguez',
      userProfileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      status: 'pending',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-request-2',
      groupId: 'mock-group-2',
      userId: 'mock-coach-1',
      userName: 'Michael Davis',
      userProfileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      status: 'pending',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-request-3',
      eventId: 'mock-event-2',
      userId: 'mock-user-1',
      userName: 'Alex Johnson',
      userProfileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      status: 'pending',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock-request-4',
      eventId: 'mock-event-2',
      userId: 'mock-user-2',
      userName: 'Sam Rodriguez',
      userProfileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      status: 'pending',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    }
  ];
};
