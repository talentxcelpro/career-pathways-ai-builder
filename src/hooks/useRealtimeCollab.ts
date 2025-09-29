import { useState, useEffect } from 'react';

interface Document {
  id: string;
  title: string;
  activeCollaborators: number;
  lastModified: string;
  isLive: boolean;
  collaborators: Array<{
    name: string;
    avatar?: string;
  }>;
}

interface DocumentConfig {
  type: 'document' | 'project';
}

export const useRealtimeCollab = () => {
  const [activeDocuments, setActiveDocuments] = useState<Document[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock active documents
    setActiveDocuments([
      {
        id: '1',
        title: 'Q4 Strategy Document',
        activeCollaborators: 3,
        lastModified: '5 min ago',
        isLive: true,
        collaborators: [
          { name: 'Sarah Chen' },
          { name: 'Mike Johnson' },
          { name: 'Lisa Park' }
        ]
      },
      {
        id: '2',
        title: 'Product Roadmap 2024',
        activeCollaborators: 2,
        lastModified: '1 hour ago',
        isLive: true,
        collaborators: [
          { name: 'David Kim' },
          { name: 'Emma Wilson' }
        ]
      },
      {
        id: '3',
        title: 'Team Meeting Notes',
        activeCollaborators: 0,
        lastModified: '1 day ago',
        isLive: false,
        collaborators: [
          { name: 'Alex Thompson' },
          { name: 'Maya Patel' },
          { name: 'John Smith' },
          { name: 'Jane Doe' }
        ]
      }
    ]);
  }, []);

  const createDocument = async (config: DocumentConfig) => {
    setIsLoading(true);
    try {
      const newDocument: Document = {
        id: Date.now().toString(),
        title: config.type === 'document' ? 'New Document' : 'New Project',
        activeCollaborators: 1,
        lastModified: 'now',
        isLive: true,
        collaborators: [
          { name: 'You' }
        ]
      };
      setActiveDocuments(prev => [newDocument, ...prev]);
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinDocument = async (documentId: string) => {
    setIsLoading(true);
    try {
      // Mock joining document
      setActiveDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, activeCollaborators: doc.activeCollaborators + 1 }
            : doc
        )
      );
    } catch (error) {
      console.error('Failed to join document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeDocuments,
    collaborators,
    createDocument,
    joinDocument,
    isLoading
  };
};