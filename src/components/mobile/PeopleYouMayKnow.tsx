import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  mutualConnections: number;
  badges?: string[];
}

const samplePeople: Person[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    mutualConnections: 12,
    badges: ['Hiring']
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    title: 'Product Manager',
    company: 'Microsoft',
    mutualConnections: 8,
    badges: ['Open to work']
  },
  {
    id: '3',
    name: 'Emily Johnson',
    title: 'UX Designer',
    company: 'Apple',
    mutualConnections: 15
  }
];

export const PeopleYouMayKnow: React.FC = () => {
  const handleConnect = (personId: string) => {
    console.log('Connecting to:', personId);
  };

  const handleDismiss = (personId: string) => {
    console.log('Dismissing:', personId);
  };

  return (
    <Card className="rounded-none border-0 border-b border-gray-100 bg-white shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">
          People you may know
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {samplePeople.map((person) => (
            <div key={person.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {person.name}
                    </h4>
                    {person.badges?.map((badge, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs rounded-full bg-green-100 text-green-700"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {person.title} at {person.company}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {person.mutualConnections} mutual connections
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-4 py-1 h-8 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => handleConnect(person.id)}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Connect
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full p-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                  onClick={() => handleDismiss(person.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-primary hover:bg-primary/5 rounded-2xl mt-4"
          >
            See all suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};