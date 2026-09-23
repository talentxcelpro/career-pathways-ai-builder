/**
 * USAJOBS OPM REST API Data Types
 * Reference: https://developer.usajobs.gov/API-Documentation/Search
 */

export interface USAJobsPositionLocation {
  LocationName: string;            // e.g. "Washington, District of Columbia"
  CountryCode: string;             // e.g. "United States"
  CountrySubDivisionCode: string;  // e.g. "District of Columbia"
  CityName: string;                // e.g. "Washington"
  Longitude?: number;
  Latitude?: number;
}

export interface USAJobsPositionRemuneration {
  MinimumRange: string;            // e.g. "112015.00"
  MaximumRange: string;            // e.g. "145617.00"
  RateIntervalCode: string;        // e.g. "Per Year", "Per Hour"
  Description?: string;
}

export interface USAJobsItem {
  MatchedObjectId: string;         // e.g. "765432100"
  MatchedObjectDescriptor: {
    PositionID: string;
    PositionTitle: string;
    PositionURI: string;           // USAJOBS announcement URL
    ApplyURI: string[];            // Official application link
    PositionLocation: USAJobsPositionLocation[];
    OrganizationName: string;      // e.g. "Department of the Navy"
    DepartmentName: string;        // e.g. "Department of Defense"
    SubAgency?: string;
    JobCategory: Array<{ Name: string; Code: string }>;
    JobGrade: Array<{ Code: string }>;
    PositionSchedule: Array<{ Name: string; Code: string }>;
    PositionOfferingType: Array<{ Name: string; Code: string }>;
    QualificationSummary?: string;
    PositionRemuneration: USAJobsPositionRemuneration[];
    PublicationStartDate: string;  // e.g. "2025-08-20T00:00:00.0000"
    ApplicationCloseDate: string;  // e.g. "2025-09-30T23:59:59.9999"
    PositionFormattedDescription?: Array<{
      Label: string;
      LabelDescription: string;
    }>;
    UserArea?: {
      Details?: {
        JobSummary?: string;
        WhoMayApply?: {
          Name: string;
          Code: string;
        };
        LowGrade?: string;
        HighGrade?: string;
        PromotionPotential?: string;
        TeleworkEligible?: boolean;
      };
    };
  };
}

export interface USAJobsSearchResponse {
  LanguageCode: string;
  SearchResult: {
    SearchResultCount: number;
    SearchResultCountAll: number;
    SearchResultItems: USAJobsItem[];
  };
}
