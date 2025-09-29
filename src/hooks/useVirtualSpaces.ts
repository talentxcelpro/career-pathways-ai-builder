import { useState, useEffect } from 'react';

interface VirtualSpace {
  id: string;
  name: string;
  description: string;
  type: 'vr' | 'ar' | 'standard';
  max_capacity: number;
  current_participants: number;
  created_at: string;
}

interface ActiveSession {
  id: string;
  space_name: string;
  space_type: 'vr' | 'ar' | 'standard';
  host_name: string;
  participant_count: number;
  duration: number;
}

interface SpaceConfig {
  name: string;
  type: 'vr' | 'ar' | 'standard';
  capacity: number;
}

export const useVirtualSpaces = () => {
  const [spaces, setSpaces] = useState<VirtualSpace[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for virtual spaces
    setSpaces([
      {
        id: '1',
        name: 'Career Networking VR',
        description: 'Virtual reality space for professional networking',
        type: 'vr',
        max_capacity: 20,
        current_participants: 8,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'AR Interview Prep',
        description: 'Augmented reality interview practice room',
        type: 'ar',
        max_capacity: 10,
        current_participants: 3,
        created_at: new Date().toISOString()
      }
    ]);

    setActiveSessions([
      {
        id: '1',
        space_name: 'Weekly Career Chat',
        space_type: 'vr',
        host_name: 'Alex Thompson',
        participant_count: 12,
        duration: 45
      },
      {
        id: '2',
        space_name: 'Mock Interview Session',
        space_type: 'ar',
        host_name: 'Maya Patel',
        participant_count: 6,
        duration: 30
      }
    ]);
  }, []);

  const createSpace = async (config: SpaceConfig) => {
    setIsLoading(true);
    try {
      const newSpace: VirtualSpace = {
        id: Date.now().toString(),
        name: config.name,
        description: `${config.type.toUpperCase()} space for professional interaction`,
        type: config.type,
        max_capacity: config.capacity,
        current_participants: 0,
        created_at: new Date().toISOString()
      };
      
      setSpaces(prev => [...prev, newSpace]);
    } catch (error) {
      console.error('Failed to create virtual space:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Mock joining a session
      console.log('Joining session:', sessionId);
      // Update participant count
      setActiveSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, participant_count: session.participant_count + 1 }
            : session
        )
      );
    } catch (error) {
      console.error('Failed to join session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    spaces,
    activeSessions,
    createSpace,
    joinSession,
    isLoading
  };
};