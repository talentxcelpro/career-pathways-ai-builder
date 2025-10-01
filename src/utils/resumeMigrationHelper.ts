/**
 * Resume Migration Helper
 * Utilities to help migrate from old resume builder routes to new unified builder
 */

export const LEGACY_ROUTE_MAPPINGS = {
  '/resume-builder/upload-enhanced': '/resume/upload',
  '/resume-builder/upload': '/resume/upload',
  '/resume/builder': '/resume',
  '/resume/editor': '/resume/build',
  '/resume/edit': '/resume/build',
  '/tools/resume-builder': '/resume',
  '/resume-builder': '/resume',
} as const;

/**
 * Maps a legacy resume route to the new unified route
 */
export function mapLegacyRoute(oldRoute: string): string {
  // Check exact matches first
  if (oldRoute in LEGACY_ROUTE_MAPPINGS) {
    return LEGACY_ROUTE_MAPPINGS[oldRoute as keyof typeof LEGACY_ROUTE_MAPPINGS];
  }

  // Handle routes with IDs
  if (oldRoute.includes('/resume/edit/')) {
    return oldRoute.replace('/resume/edit/', '/resume/build/');
  }
  if (oldRoute.includes('/resume/editor/')) {
    return oldRoute.replace('/resume/editor/', '/resume/build/');
  }
  if (oldRoute.includes('/resume-builder/edit/')) {
    return oldRoute.replace('/resume-builder/edit/', '/resume/build/');
  }

  // Return original if no mapping found
  return oldRoute;
}

/**
 * Checks if a route is a legacy resume builder route
 */
export function isLegacyResumeRoute(route: string): boolean {
  return (
    route in LEGACY_ROUTE_MAPPINGS ||
    route.includes('/resume-builder') ||
    route.includes('/resume/edit/') ||
    route.includes('/resume/editor/')
  );
}

/**
 * Migration status constants
 */
export const MIGRATION_STATUS = {
  COMPLETED: 'All routes migrated to unified builder',
  IN_PROGRESS: 'Migration in progress',
  PENDING: 'Migration pending',
} as const;
