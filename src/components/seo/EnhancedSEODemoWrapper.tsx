import React from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedSEODemo } from './EnhancedSEODemo';

export const EnhancedSEODemoWrapper: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  
  // Map URL parameter to contentType
  const getContentType = (): 'job' | 'post' | 'tool' | 'course' => {
    switch (type) {
      case 'job':
      case 'jobs':
        return 'job';
      case 'post':
      case 'posts':
      case 'network':
        return 'post';
      case 'tool':
      case 'tools':
        return 'tool';
      case 'course':
      case 'courses':
      case 'learning':
        return 'course';
      default:
        return 'job'; // Default fallback
    }
  };

  return <EnhancedSEODemo contentType={getContentType()} />;
};