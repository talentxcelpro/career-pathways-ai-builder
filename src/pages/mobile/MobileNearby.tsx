import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin,
  Navigation,
  Users,
  Briefcase,
  Calendar,
  Coffee,
  Building,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';

interface NearbyItem {
  id: string;
  type: 'person' | 'job' | 'event' | 'company';
  title: string;
  subtitle: string;
  distance: string;
  imageUrl?: string;
  badge?: string;
  location: string;
}

export const MobileNearby = () => {
  const navigate = useNavigate();

  const nearbyItems: NearbyItem[] = [
    {
      id: '1',
      type: 'person',
      title: 'Sarah Johnson',
      subtitle: 'Senior Frontend Developer at Google',
      distance: '0.5 km',
      location: 'Coffee Shop District',
      badge: 'Mutual Connection'
    },
    {
      id: '2',
      type: 'job',
      title: 'React Developer',
      subtitle: 'TechCorp Solutions',
      distance: '1.2 km',
      location: 'Business Park',
      badge: 'Remote OK'
    },
    {
      id: '3',
      type: 'event',
      title: 'Tech Networking Meetup',
      subtitle: 'Today 6:00 PM',
      distance: '0.8 km',
      location: 'Innovation Hub',
      badge: '45 attending'
    },
    {
      id: '4',
      type: 'company',
      title: 'StartupXYZ',
      subtitle: 'AI/ML Startup - 25 employees',
      distance: '2.1 km',
      location: 'Tech District',
      badge: 'Hiring'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'person': return <Users className="w-5 h-5" />;
      case 'job': return <Briefcase className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      case 'company': return <Building className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'person': return 'bg-blue-100 text-blue-600';
      case 'job': return 'bg-green-100 text-green-600';
      case 'event': return 'bg-purple-100 text-purple-600';
      case 'company': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <MobileNavWrapper>
      <ScrollArea className="h-[calc(100vh-80px)] ios-scroll">
        <div className="px-4 py-6 space-y-6 pb-20 native-app-style safe-area-top">
          {/* Header */}
          <div className="native-card p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Nearby Opportunities</h1>
            <p className="text-sm text-gray-600">
              Discover people, jobs, and events around you
            </p>
          </div>

          {/* Location Permission */}
          <div className="native-card p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">Enable Location</h3>
                <p className="text-sm text-blue-700">Get personalized nearby recommendations</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Enable
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'People', 'Jobs', 'Events', 'Companies'].map((filter) => (
              <Button
                key={filter}
                variant={filter === 'All' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap touch-feedback"
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Nearby Items */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Near You</h2>
            
            {nearbyItems.map((item) => (
              <Card key={item.id} className="native-card touch-feedback">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(item.type)}`}>
                      {getIcon(item.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.distance}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{item.location}</span>
                      </div>
                      
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="native-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="touch-feedback"
                onClick={() => navigate('/mobile/qr-scanner')}
              >
                <Coffee className="w-4 h-4 mr-2" />
                Meet for Coffee
              </Button>
              <Button 
                variant="outline" 
                className="touch-feedback"
                onClick={() => navigate('/jobs')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Browse All Jobs
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </MobileNavWrapper>
  );
};