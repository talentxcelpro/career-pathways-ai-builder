import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface ResumeSection {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
}

interface SectionEditorProps {
  section?: ResumeSection;
  onUpdate: (content: any) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate }) => {
  if (!section) return null;

  const updateContent = (field: string, value: any) => {
    onUpdate({ ...section.content, [field]: value });
  };

  const addItem = () => {
    const items = section.content.items || [];
    const newItem = createNewItem(section.type);
    onUpdate({ ...section.content, items: [...items, newItem] });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...(section.content.items || [])];
    items[index] = { ...items[index], [field]: value };
    onUpdate({ ...section.content, items });
  };

  const removeItem = (index: number) => {
    const items = section.content.items || [];
    onUpdate({ ...section.content, items: items.filter((_, i) => i !== index) });
  };

  const createNewItem = (type: string) => {
    const baseItem = { id: Date.now().toString() };
    
    switch (type) {
      case 'experience':
        return { ...baseItem, title: '', company: '', location: '', startDate: '', endDate: '', description: '', current: false };
      case 'education':
        return { ...baseItem, degree: '', school: '', location: '', startDate: '', endDate: '', gpa: '' };
      case 'skills':
        return { ...baseItem, name: '', level: 'intermediate', category: 'Technical' };
      case 'projects':
        return { ...baseItem, title: '', description: '', technologies: '', url: '' };
      case 'certifications':
        return { ...baseItem, name: '', issuer: '', date: '', url: '' };
      case 'awards':
        return { ...baseItem, name: '', issuer: '', date: '', description: '' };
      case 'languages':
        return { ...baseItem, name: '', proficiency: 'conversational' };
      case 'volunteer':
        return { ...baseItem, role: '', organization: '', startDate: '', endDate: '', description: '' };
      case 'references':
        return { ...baseItem, name: '', contact: '', relationship: '' };
      case 'interests':
        return { ...baseItem, name: '' };
      default:
        return baseItem;
    }
  };

  const renderPersonalSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={section.content.fullName || ''}
            onChange={(e) => updateContent('fullName', e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={section.content.email || ''}
            onChange={(e) => updateContent('email', e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={section.content.phone || ''}
            onChange={(e) => updateContent('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={section.content.location || ''}
            onChange={(e) => updateContent('location', e.target.value)}
            placeholder="New York, NY"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={section.content.linkedin || ''}
            onChange={(e) => updateContent('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={section.content.website || ''}
            onChange={(e) => updateContent('website', e.target.value)}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>
    </div>
  );

  const renderSummarySection = () => (
    <div>
      <Label htmlFor="summary">Professional Summary</Label>
      <Textarea
        id="summary"
        value={section.content.text || ''}
        onChange={(e) => updateContent('text', e.target.value)}
        placeholder="Write a compelling professional summary..."
        rows={6}
      />
    </div>
  );

  const renderItemsSection = () => {
    const items = section.content.items || [];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add {section.title}</h3>
          <Button onClick={addItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No items added yet. Click "Add Item" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <Card key={item.id || index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {renderItemFields(item, index)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderItemFields = (item: any, index: number) => {
    switch (section.type) {
      case 'experience':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Job Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={item.company || ''}
                onChange={(e) => updateItem(index, 'company', e.target.value)}
                placeholder="TechCorp Inc."
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={item.startDate || ''}
                onChange={(e) => updateItem(index, 'startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="month"
                value={item.endDate || ''}
                onChange={(e) => updateItem(index, 'endDate', e.target.value)}
                disabled={item.current}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="Describe your role and achievements..."
                rows={3}
              />
            </div>
          </div>
        );
      case 'education':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Degree</Label>
              <Input
                value={item.degree || ''}
                onChange={(e) => updateItem(index, 'degree', e.target.value)}
                placeholder="Bachelor of Science"
              />
            </div>
            <div>
              <Label>School</Label>
              <Input
                value={item.school || ''}
                onChange={(e) => updateItem(index, 'school', e.target.value)}
                placeholder="University Name"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={item.startDate || ''}
                onChange={(e) => updateItem(index, 'startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="month"
                value={item.endDate || ''}
                onChange={(e) => updateItem(index, 'endDate', e.target.value)}
              />
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Skill Name</Label>
              <Input
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="JavaScript"
              />
            </div>
            <div>
              <Label>Proficiency Level</Label>
              <select
                className="w-full p-2 border rounded"
                value={item.level || 'intermediate'}
                onChange={(e) => updateItem(index, 'level', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        );
      case 'languages':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Input
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="English"
              />
            </div>
            <div>
              <Label>Proficiency</Label>
              <select
                className="w-full p-2 border rounded"
                value={item.proficiency || 'conversational'}
                onChange={(e) => updateItem(index, 'proficiency', e.target.value)}
              >
                <option value="basic">Basic</option>
                <option value="conversational">Conversational</option>
                <option value="fluent">Fluent</option>
                <option value="native">Native</option>
              </select>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-4">
            <div>
              <Label>Project Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder="Data Pipeline Migration"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Technologies (comma separated)</Label>
              <Input
                value={item.technologies || ''}
                onChange={(e) => updateItem(index, 'technologies', e.target.value)}
                placeholder="Azure, Databricks, Kafka"
              />
            </div>
            <div>
              <Label>Link</Label>
              <Input
                value={item.url || ''}
                onChange={(e) => updateItem(index, 'url', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        );
      case 'certifications':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Certification Name</Label>
              <Input
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="AWS Certified Solutions Architect"
              />
            </div>
            <div>
              <Label>Issuing Organization</Label>
              <Input
                value={item.issuer || ''}
                onChange={(e) => updateItem(index, 'issuer', e.target.value)}
                placeholder="Amazon Web Services"
              />
            </div>
            <div>
              <Label>Issue Date</Label>
              <Input
                type="month"
                value={item.date || ''}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
              />
            </div>
            <div>
              <Label>Credential URL</Label>
              <Input
                value={item.url || ''}
                onChange={(e) => updateItem(index, 'url', e.target.value)}
              />
            </div>
          </div>
        );
      case 'awards':
        return (
          <div className="space-y-4">
            <div>
              <Label>Award Name</Label>
              <Input
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <Label>Issuing Organization</Label>
              <Input
                value={item.issuer || ''}
                onChange={(e) => updateItem(index, 'issuer', e.target.value)}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="month"
                value={item.date || ''}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
      case 'volunteer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Input
                  value={item.role || ''}
                  onChange={(e) => updateItem(index, 'role', e.target.value)}
                />
              </div>
              <div>
                <Label>Organization</Label>
                <Input
                  value={item.organization || ''}
                  onChange={(e) => updateItem(index, 'organization', e.target.value)}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={item.startDate || ''}
                  onChange={(e) => updateItem(index, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={item.endDate || ''}
                  onChange={(e) => updateItem(index, 'endDate', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
      case 'references':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input
                value={item.relationship || ''}
                onChange={(e) => updateItem(index, 'relationship', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Contact Information</Label>
              <Input
                value={item.contact || ''}
                onChange={(e) => updateItem(index, 'contact', e.target.value)}
                placeholder="email or phone"
              />
            </div>
          </div>
        );
      case 'interests':
        return (
          <div>
            <Label>Interest</Label>
            <Input
              value={item.name || ''}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="e.g., Volleyball"
            />
          </div>
        );
      default:
        return (
          <div>
            <Label>Name</Label>
            <Input
              value={item.name || ''}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="Item name"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
        <p className="text-muted-foreground">
          {section.type === 'personal' && 'Enter your basic contact information'}
          {section.type === 'summary' && 'Write a compelling professional summary'}
          {section.type === 'experience' && 'Add your work experience and achievements'}
          {section.type === 'education' && 'List your educational background'}
          {section.type === 'skills' && 'Showcase your technical and soft skills'}
          {!['personal', 'summary', 'experience', 'education', 'skills'].includes(section.type) && 
            `Add ${section.title.toLowerCase()} to enhance your resume`}
        </p>
      </div>

      {section.type === 'personal' && renderPersonalSection()}
      {section.type === 'summary' && renderSummarySection()}
      {['experience', 'education', 'skills', 'projects', 'certifications', 'awards', 'languages', 'volunteer', 'references', 'interests'].includes(section.type) && renderItemsSection()}
    </div>
  );
};