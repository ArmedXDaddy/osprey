import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Verified } from 'lucide-react';

const Explore = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Explore</h1>
      <p className="text-muted-foreground">
        Discover new content, connect with experts, and expand your network.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Trending Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trending Influencers */}
          <div className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium mb-3">Top Influencers</h3>
              <ul className="divide-y divide-border">
                {/* Example Influencer */}
                <li className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1531427186611-ecfd6d936e63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="twinkle" />
                      <AvatarFallback>TW</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">Twinkle Whatley <Verified className="inline-block text-blue-500 h-4 w-4 ml-1" /></p>
                      <p className="text-xs text-muted-foreground">Marketing Expert</p>
                    </div>
                  </div>
                  <Link to="/profile/123" className="text-primary hover:underline text-sm">View Profile</Link>
                </li>
                {/* Add more influencers here */}
                <li className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1570295999919-56bcae82799c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80" alt="john" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">John Doe <Verified className="inline-block text-blue-500 h-4 w-4 ml-1" /></p>
                      <p className="text-xs text-muted-foreground">Tech Reviewer</p>
                    </div>
                  </div>
                  <Link to="/profile/456" className="text-primary hover:underline text-sm">View Profile</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Trending Coaches */}
          <div className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium mb-3">Top Coaches</h3>
              <ul className="divide-y divide-border">
                {/* Example Coach */}
                <li className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b2933e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" alt="jane" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">Jane Smith <Verified className="inline-block text-blue-500 h-4 w-4 ml-1" /></p>
                      <p className="text-xs text-muted-foreground">Life Coach</p>
                    </div>
                  </div>
                  <Link to="/profile/789" className="text-primary hover:underline text-sm">View Profile</Link>
                </li>
                {/* Add more coaches here */}
                 <li className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd8a72f9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80" alt="mark" />
                      <AvatarFallback>MB</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">Mark Brown <Verified className="inline-block text-blue-500 h-4 w-4 ml-1" /></p>
                      <p className="text-xs text-muted-foreground">Business Coach</p>
                    </div>
                  </div>
                  <Link to="/profile/101" className="text-primary hover:underline text-sm">View Profile</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium mb-3">Leading Companies</h3>
              <ul className="divide-y divide-border">
                {/* Example Company */}
                <li className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1605296867304-46d4625df7ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="acme" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">Acme Corp <Verified className="inline-block text-blue-500 h-4 w-4 ml-1" /></p>
                      <p className="text-xs text-muted-foreground">Tech Solutions</p>
                    </div>
                  </div>
                  <Link to="/profile/222" className="text-primary hover:underline text-sm">View Profile</Link>
                </li>
                {/* Add more companies here */}
                <li className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1542831323-5398288a7b59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="beta" />
                      <AvatarFallback>BT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">Beta Industries <Verified className="inline-block text-blue-500 h-4 w-4 ml-1" /></p>
                      <p className="text-xs text-muted-foreground">Software Development</p>
                    </div>
                  </div>
                  <Link to="/profile/333" className="text-primary hover:underline text-sm">View Profile</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Trending Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trending Groups Section */}
          {renderTrendingItems()}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Event Card */}
          <Card className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">Tech Conference 2024</h3>
              <p className="text-sm text-muted-foreground">Join industry leaders and innovators...</p>
              <Link to="/events/123" className="inline-block mt-3 text-primary hover:underline text-sm">Learn More</Link>
            </CardContent>
          </Card>
          {/* Add more event cards here */}
           <Card className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">Marketing Webinar</h3>
              <p className="text-sm text-muted-foreground">Learn the latest digital marketing strategies...</p>
              <Link to="/events/456" className="inline-block mt-3 text-primary hover:underline text-sm">Learn More</Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );

  function renderTrendingItems() {
    const trendingGroups = [
      {
        id: "trending-group-1",
        name: "Digital Marketing Strategies",
        description: "Share and learn effective digital marketing techniques and strategies.",
        members: 2345,
        image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
        privacy: "public",
        creatorId: "influencer-1",
        creatorName: "Marketing Expert",
        creatorRole: "influencer" as const,
        createdAt: new Date(),
        rules: ["Be respectful", "No spam", "Stay on topic"]
      },
    ];
  
    const coachGroups = [
      {
        id: "coach-group-1",
        name: "Fitness Transformation",
        description: "Join our fitness community for daily workouts, motivation, and results tracking.",
        members: 1856,
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        privacy: "public",
        creatorId: "coach-1",
        creatorName: "Fitness Coach",
        creatorRole: "coach" as const,
        createdAt: new Date(),
        rules: ["Be supportive", "No negative comments", "Share your progress"]
      },
    ];
  
    const companyGroups = [
      {
        id: "company-group-1",
        name: "Tech Innovators Network",
        description: "A professional network for tech industry leaders and innovators.",
        members: 3211,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        privacy: "private",
        creatorId: "company-1",
        creatorName: "Tech Solutions Inc",
        creatorRole: "company" as const,
        createdAt: new Date(),
        rules: ["Professional conduct only", "Industry-related discussions", "No soliciting"]
      },
    ];
  
    const eventGroups = [
      {
        id: "event-group-1",
        name: "Conference Attendees",
        description: "Connect with other attendees from the upcoming tech conference.",
        members: 587,
        image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1112&q=80",
        privacy: "public",
        creatorId: "influencer-2",
        creatorName: "Event Organizer",
        creatorRole: "influencer" as const,
        createdAt: new Date(),
        rules: ["Discuss conference topics", "Share insights", "Network professionally"]
      },
    ];
  
    return (
      <>
        {trendingGroups.map((group) => (
          <Card key={group.id} className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <Link to={`/groups/${group.id}`} className="inline-block mt-3 text-primary hover:underline text-sm">
                Learn More
              </Link>
            </CardContent>
          </Card>
        ))}
        {coachGroups.map((group) => (
          <Card key={group.id} className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <Link to={`/groups/${group.id}`} className="inline-block mt-3 text-primary hover:underline text-sm">
                Learn More
              </Link>
            </CardContent>
          </Card>
        ))}
        {companyGroups.map((group) => (
          <Card key={group.id} className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <Link to={`/groups/${group.id}`} className="inline-block mt-3 text-primary hover:underline text-sm">
                Learn More
              </Link>
            </CardContent>
          </Card>
        ))}
        {eventGroups.map((group) => (
          <Card key={group.id} className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <Link to={`/groups/${group.id}`} className="inline-block mt-3 text-primary hover:underline text-sm">
                Learn More
              </Link>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }
};

export default Explore;
