/**
 * TalentXcel Global Jobs Network — API Detector
 * Detects CKAN, Socrata, OPM/USAJOBS-style open government endpoints.
 */

export interface DetectedAPI {
  apiType: 'CKAN' | 'SOCRATA' | 'USAJOBS_STYLE' | 'REST_JSON';
  endpoint: string;
  version?: string;
}

export class APIDetector {
  public static inspectEndpoint(url: string, responseHeaders?: Record<string, string>): DetectedAPI | null {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('/api/3/action/package_search') || lowerUrl.includes('/api/action/datastore_search')) {
      return { apiType: 'CKAN', endpoint: url };
    }
    if (lowerUrl.includes('/resource/') && lowerUrl.includes('.json')) {
      return { apiType: 'SOCRATA', endpoint: url };
    }
    if (lowerUrl.includes('/api/search') && lowerUrl.includes('usajobs')) {
      return { apiType: 'USAJOBS_STYLE', endpoint: url };
    }
    if (lowerUrl.includes('/api/v') || lowerUrl.includes('/api/jobs')) {
      return { apiType: 'REST_JSON', endpoint: url };
    }
    return null;
  }
}
