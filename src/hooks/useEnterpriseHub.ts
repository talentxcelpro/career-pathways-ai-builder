import { useState, useEffect } from 'react';

interface Meeting {
  id: string;
  title: string;
  participants: number;
  duration: number;
  isRecording: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
}

interface MeetingConfig {
  type: 'instant' | 'scheduled';
}

export const useEnterpriseHub = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for enterprise features
    setMeetings([
      {
        id: '1',
        title: 'Weekly Team Standup',
        participants: 8,
        duration: 45,
        isRecording: true
      },
      {
        id: '2',
        title: 'Client Presentation',
        participants: 12,
        duration: 60,
        isRecording: false
      }
    ]);

    setTeams([
      {
        id: '1',
        name: 'Engineering Team',
        description: 'Core development team working on platform features',
        memberCount: 15,
        isPrivate: false
      },
      {
        id: '2',
        name: 'Product Strategy',
        description: 'Product planning and strategy discussions',
        memberCount: 8,
        isPrivate: true
      }
    ]);
  }, []);

  const startMeeting = async (config: MeetingConfig) => {
    setIsLoading(true);
    try {
      const newMeeting: Meeting = {
        id: Date.now().toString(),
        title: config.type === 'instant' ? 'Quick Meeting' : 'Scheduled Meeting',
        participants: 1,
        duration: 0,
        isRecording: false
      };
      setMeetings(prev => [...prev, newMeeting]);
    } catch (error) {
      console.error('Failed to start meeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async () => {
    setIsLoading(true);
    try {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: 'New Team',
        description: 'Team created for collaboration',
        memberCount: 1,
        isPrivate: false
      };
      setTeams(prev => [...prev, newTeam]);
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    meetings,
    teams,
    startMeeting,
    createTeam,
    isLoading
  };
};