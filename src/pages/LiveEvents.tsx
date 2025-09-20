import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin, Video, Mic, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LiveEvents = () => {
  return (
    <>
      <Helmet>
        <title>Live Events | Professional Webinars & Networking</title>
        <meta name="description" content="Join live professional events, webinars, and networking sessions. Connect with industry experts and grow your career." />
        <link rel="canonical" href="https://talentxcel.in/live-events" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Video className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Live Events</h1>
            </div>
            <p className="text-muted-foreground">Join live professional events and connect with industry experts</p>
          </div>

          <div className="grid gap-6">
            {/* Live Now */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-600">LIVE NOW</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">AI in the Workplace: Future Trends</h3>
                    <p className="text-muted-foreground mb-4">Join industry experts discussing how AI is transforming modern workplaces and what it means for your career.</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>1,247 attending</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Started 15 min ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Live</Badge>
                      <Badge variant="outline">Technology</Badge>
                      <Badge variant="outline">Career Development</Badge>
                    </div>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Play className="h-4 w-4 mr-2" />
                    Join Live
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Remote Team Leadership Workshop",
                      description: "Learn effective strategies for leading remote teams in the modern workplace.",
                      date: "Tomorrow",
                      time: "2:00 PM EST",
                      attendees: 456,
                      type: "Workshop",
                      category: "Leadership",
                      speaker: "Sarah Johnson, VP of Engineering"
                    },
                    {
                      title: "Data Science Career Panel",
                      description: "Panel discussion with leading data scientists about career paths and opportunities.",
                      date: "Dec 15",
                      time: "3:00 PM EST",
                      attendees: 789,
                      type: "Panel",
                      category: "Data Science",
                      speaker: "Multiple Industry Experts"
                    },
                    {
                      title: "Cybersecurity Essentials for Professionals",
                      description: "Essential cybersecurity knowledge every professional should know.",
                      date: "Dec 18",
                      time: "1:00 PM EST",
                      attendees: 234,
                      type: "Webinar",
                      category: "Cybersecurity",
                      speaker: "Mike Chen, Security Director"
                    }
                  ].map((event, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees} registered</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{event.type}</Badge>
                            <Badge variant="secondary">{event.category}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Speaker: {event.speaker}</p>
                        </div>
                        <Button variant="outline">Register</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Browse by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Technology", count: 12, icon: Video },
                    { name: "Leadership", count: 8, icon: Users },
                    { name: "Career Development", count: 15, icon: Calendar },
                    { name: "Networking", count: 6, icon: Mic }
                  ].map((category, i) => (
                    <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 text-center">
                        <category.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-medium">{category.name}</h3>
                        <Badge variant="secondary" className="mt-1">{category.count} events</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Past Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Recent Recordings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Building Resilient Teams", views: "2.3k", duration: "45 min", rating: 4.8 },
                    { title: "Future of Work Trends", views: "1.8k", duration: "60 min", rating: 4.6 },
                    { title: "Effective Communication", views: "3.1k", duration: "40 min", rating: 4.9 },
                    { title: "Project Management Tips", views: "1.5k", duration: "35 min", rating: 4.7 }
                  ].map((recording, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{recording.title}</h3>
                        <Play className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{recording.views} views</span>
                        <span>{recording.duration}</span>
                        <span>⭐ {recording.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveEvents;