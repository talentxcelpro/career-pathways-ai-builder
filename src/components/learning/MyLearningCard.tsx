
import React from 'react';
import { CourseProgress } from './CourseProgress';

interface MyLearningCardProps {
  userCourse: any;
}

export const MyLearningCard: React.FC<MyLearningCardProps> = ({ userCourse }) => {
  return <CourseProgress userCourse={userCourse} />;
};
