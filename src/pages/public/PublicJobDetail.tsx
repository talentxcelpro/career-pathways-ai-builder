import React from 'react';
import { useParams } from 'react-router-dom';
import JobDetail from '../JobDetail';

const PublicJobDetail = () => {
  const { id } = useParams();
  return <JobDetail />;
};

export default PublicJobDetail;