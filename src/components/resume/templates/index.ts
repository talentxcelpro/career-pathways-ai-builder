export { ClassicTemplate } from './ClassicTemplate';
export { ModernTemplate } from './ModernTemplate';
export { CreativeTemplate } from './CreativeTemplate';
export { TechnicalTemplate } from './TechnicalTemplate';
export { ExecutiveTemplate } from './ExecutiveTemplate';
export { AcademicTemplate } from './AcademicTemplate';
export { MinimalistTemplate } from './MinimalistTemplate';
export { SalesTemplate } from './SalesTemplate';
export { HealthcareTemplate } from './HealthcareTemplate';
export { StartupTemplate } from './StartupTemplate';

// Import the templates for the component list
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { TechnicalTemplate } from './TechnicalTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { MinimalistTemplate } from './MinimalistTemplate';
import { SalesTemplate } from './SalesTemplate';
import { HealthcareTemplate } from './HealthcareTemplate';
import { StartupTemplate } from './StartupTemplate';

export const templateList = [
  { id: 'classic', name: 'Classic', component: ClassicTemplate, category: 'Traditional' },
  { id: 'modern', name: 'Modern', component: ModernTemplate, category: 'Contemporary' },
  { id: 'creative', name: 'Creative', component: CreativeTemplate, category: 'Design' },
  { id: 'technical', name: 'Technical', component: TechnicalTemplate, category: 'Engineering' },
  { id: 'executive', name: 'Executive', component: ExecutiveTemplate, category: 'Leadership' },
  { id: 'academic', name: 'Academic', component: AcademicTemplate, category: 'Education' },
  { id: 'minimalist', name: 'Minimalist', component: MinimalistTemplate, category: 'Clean' },
  { id: 'sales', name: 'Sales', component: SalesTemplate, category: 'Business' },
  { id: 'healthcare', name: 'Healthcare', component: HealthcareTemplate, category: 'Medical' },
  { id: 'startup', name: 'Startup', component: StartupTemplate, category: 'Tech' }
];