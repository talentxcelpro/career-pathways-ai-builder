import React from 'react';
import { AdminCourseManager } from '@/components/learning/AdminCourseManager';
import { LMSUrlGenerator } from '@/components/admin/LMSUrlGenerator';

const AdminCourses = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <LMSUrlGenerator />
      <AdminCourseManager />
    </div>
  );
};

export default AdminCourses;