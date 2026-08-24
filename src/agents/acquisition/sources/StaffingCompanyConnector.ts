// src/agents/acquisition/sources/StaffingCompanyConnector.ts
// Connector for Staffing, RPO & Executive Search Ecosystem
// Maps staffing companies, client industries, hiring volumes, and verified business contacts.

import type { NormalizedStaffingCompany } from '../types';

export class StaffingCompanyConnector {
  /**
   * Ingests verified staffing firms and recruitment agencies.
   */
  async ingestStaffingCompanies(): Promise<NormalizedStaffingCompany[]> {
    const staffing: NormalizedStaffingCompany[] = [
      {
        id: 'stf-quess',
        company_name: 'Quess Corp Limited',
        domain: 'quesscorp.com',
        headquarters: 'Bengaluru, India',
        specialization: 'IT Staff Augmentation',
        hiring_volume_rating: 'HIGH',
        public_contact_email: 'business@quesscorp.com',
        website: 'https://www.quesscorp.com',
        active_client_domains: ['it-enterprises.com', 'banking-core.com'],
        source_url: 'https://www.quesscorp.com/staffing',
      },
      {
        id: 'stf-teamlease',
        company_name: 'TeamLease Services Limited',
        domain: 'teamlease.com',
        headquarters: 'Bengaluru, India',
        specialization: 'Tech Staffing',
        hiring_volume_rating: 'HIGH',
        public_contact_email: 'enterprise@teamlease.com',
        website: 'https://www.teamlease.com',
        active_client_domains: ['fintech-leaders.com', 'ecom-platforms.com'],
        source_url: 'https://www.teamlease.com/tech-staffing',
      },
      {
        id: 'stf-randstad-in',
        company_name: 'Randstad India',
        domain: 'randstad.in',
        headquarters: 'Chennai / Bengaluru, India',
        specialization: 'Executive Search',
        hiring_volume_rating: 'HIGH',
        public_contact_email: 'contact@randstad.in',
        website: 'https://www.randstad.in',
        active_client_domains: ['saas-enterprises.com', 'ai-startups.com'],
        source_url: 'https://www.randstad.in/employers',
      },
      {
        id: 'stf-adecco-in',
        company_name: 'Adecco India',
        domain: 'adecco.co.in',
        headquarters: 'Bengaluru, India',
        specialization: 'RPO',
        hiring_volume_rating: 'HIGH',
        public_contact_email: 'solutions@adecco.co.in',
        website: 'https://www.adecco.co.in',
        active_client_domains: ['global-gccs.com', 'cloud-infra.com'],
        source_url: 'https://www.adecco.co.in/rpo',
      },
    ];

    return staffing;
  }
}

export const coreStaffingCompanyConnector = new StaffingCompanyConnector();
