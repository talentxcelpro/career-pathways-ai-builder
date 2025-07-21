import React from 'react';
import { useParams } from 'react-router-dom';
import CompanyDetail from '../CompanyDetail';

const PublicCompanyDetail = () => {
  const { slug } = useParams();
  return <CompanyDetail />;
};

export default PublicCompanyDetail;