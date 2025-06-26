
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  index?: boolean;
  children?: RouteConfig[];
}

export interface NavItem {
  title: string;
  path: string;
  icon?: React.ReactElement;
  roles?: string[];
  children?: NavItem[];
}

export type UserRole = 'user' | 'employer' | 'admin';
