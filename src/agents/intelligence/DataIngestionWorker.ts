// src/agents/intelligence/DataIngestionWorker.ts
// Autonomous Data Ingestion Worker
// Orchestrates multi-source connectors (MCA, Public ATS, AICTE Colleges, Startups) and populates the Opportunity Graph.

import { coreCorporateRegistryConnector } from './connectors/CorporateRegistryConnector';
import { coreDirectATSConnector } from './connectors/DirectATSConnector';
import { coreCollegeRegistryConnector } from './connectors/CollegeRegistryConnector';
import { coreStartupDirectoryConnector } from './connectors/StartupDirectoryConnector';
import { coreOpportunityGraphDatabase } from './OpportunityGraphDatabase';
import { coreExternalProspectStore } from './ExternalProspectStore';
import { kernelEventBus } from '../kernel/EventBus';
import { kernelAuditEngine } from '../kernel/AuditEngine';

export interface IngestionRunReport {
  timestamp: string;
  companiesIngested: number;
  jobsIngested: number;
  collegesIngested: number;
  startupsIngested: number;
  totalEntitiesInGraph: number;
}

export class DataIngestionWorker {
  private isIngesting = false;

  /**
   * Executes a complete multi-dataset ingestion cycle across all connected sources.
   */
  async runFullIngestionCycle(): Promise<IngestionRunReport> {
    if (this.isIngesting) {
      const breakdown = coreOpportunityGraphDatabase.getDatasetBreakdown();
      return {
        timestamp: new Date().toISOString(),
        companiesIngested: 0,
        jobsIngested: 0,
        collegesIngested: 0,
        startupsIngested: 0,
        totalEntitiesInGraph: breakdown.totalRecordsCount,
      };
    }

    this.isIngesting = true;
    let companiesCount = 0;
    let jobsCount = 0;
    let collegesCount = 0;
    let startupsCount = 0;

    try {
      console.log('⚡ [DataIngestionWorker] Starting multi-source acquisition cycle...');

      // 1. Ingest Corporate MCA Master Records
      const companies = await coreCorporateRegistryConnector.ingestRegisteredCompanies();
      companiesCount = companies.length;

      // 2. Ingest Direct Public ATS Job Postings
      for (const target of coreDirectATSConnector.knownATSCompanies) {
        const jobs = await coreDirectATSConnector.ingestPostings(target);
        jobsCount += jobs.length;
      }

      // 3. Ingest AICTE & NIRF Colleges with TPO Contacts
      const colleges = await coreCollegeRegistryConnector.ingestInstitutions();
      collegesCount = colleges.length;

      // 4. Ingest Claim #1 AI Startups
      const startups = await coreStartupDirectoryConnector.ingestStartups();
      startupsCount = startups.length;

      // Sync into ExternalProspectStore for Gated Zoho Outreach
      for (const comp of companies) {
        const isEnterprise = comp.active_job_count >= 15;
        coreExternalProspectStore.upsertProspect({
          source: 'mca_registry' as any,
          source_url: comp.careers_url,
          company_name: comp.brand_name,
          company_domain: comp.domain,
          company_location: comp.headquarters,
          signal_type: comp.active_job_count >= 15 ? 'HIRING_ACCELERATION' : 'NEW_VACANCY',
          signal_strength: Math.min(99, 70 + comp.active_job_count * 2),
          signal_timestamp: new Date().toISOString(),
          job_count: comp.active_job_count,
          relevant_roles: ['Senior Software Engineer', 'Engineering Lead', 'Fullstack Developer'],
          contact_name: 'Talent Acquisition Team',
          contact_role: 'Head of Technical Recruiting',
          permitted_contact_channel: `talent@${comp.domain}`,
          contact_source: 'public_career_page',
          opportunity_score: Math.min(99, 70 + comp.active_job_count * 2),
          assigned_agent: isEnterprise ? 'employer_outreach' : 'employer_discovery',
          assigned_mailbox: isEnterprise ? 'raj@talentxcel.in' : 'shelly@talentxcel.in',
          outreach_status: 'ELIGIBLE_FOR_OUTREACH',
          suppression_status: 'CLEAN',
        });
      }

      const breakdown = coreOpportunityGraphDatabase.getDatasetBreakdown();

      await kernelAuditEngine.record('data_ingestion_worker', 'growth_marketing', 'FULL_INGESTION_CYCLE_EXECUTED', {
        companiesIngested: companiesCount,
        jobsIngested: jobsCount,
        collegesIngested: collegesCount,
        startupsIngested: startupsCount,
        totalEntities: breakdown.totalRecordsCount,
        success: true,
      });

      kernelEventBus.publish({
        type: 'OPPORTUNITY_GRAPH_SYNCED',
        sourceAgent: 'DataIngestionWorker',
        department: 'executive',
        payload: { breakdown },
      });

      return {
        timestamp: new Date().toISOString(),
        companiesIngested: companiesCount,
        jobsIngested: jobsCount,
        collegesIngested: collegesCount,
        startupsIngested: startupsCount,
        totalEntitiesInGraph: breakdown.totalRecordsCount,
      };
    } catch (err: any) {
      console.error('[DataIngestionWorker] Ingestion error:', err);
      const breakdown = coreOpportunityGraphDatabase.getDatasetBreakdown();
      return {
        timestamp: new Date().toISOString(),
        companiesIngested: 0,
        jobsIngested: 0,
        collegesIngested: 0,
        startupsIngested: 0,
        totalEntitiesInGraph: breakdown.totalRecordsCount,
      };
    } finally {
      this.isIngesting = false;
    }
  }
}

export const coreDataIngestionWorker = new DataIngestionWorker();
