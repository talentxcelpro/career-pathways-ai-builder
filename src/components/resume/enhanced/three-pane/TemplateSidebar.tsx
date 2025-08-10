import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { resumeTemplates, getTemplatesByCategory, ResumeTemplate } from '@/data/resumeTemplates';
import { TemplatePreview } from './TemplatePreview';
import { TemplatePreviewModal } from '@/components/resume/templates/TemplatePreviewModal';
interface TemplateSidebarProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

interface SortableTemplateProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  onPreview: (templateId: string) => void;
}

const SortableTemplate: React.FC<SortableTemplateProps> = ({ template, isSelected, onSelect, onPreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="bg-background/80 backdrop-blur-sm rounded p-1 shadow-sm">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
      
      <TemplatePreview
        template={template}
        isSelected={isSelected}
        onSelect={onSelect}
        onPreview={onPreview}
      />
    </div>
  );
};

export const TemplateSidebar: React.FC<TemplateSidebarProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recommendedOrder, setRecommendedOrder] = useState<string[]>([]);
  const [allTemplatesOrder, setAllTemplatesOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTemplates = resumeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedTemplates = filteredTemplates.filter(t => t.isRecommended);
  const otherTemplates = filteredTemplates.filter(t => !t.isRecommended);

  // Initialize order arrays if empty
  const getOrderedTemplates = (templates: ResumeTemplate[], orderArray: string[]) => {
    if (orderArray.length === 0) {
      return templates;
    }
    
    const ordered = orderArray
      .map(id => templates.find(t => t.id === id))
      .filter((t): t is ResumeTemplate => t !== undefined);
    
    const unordered = templates.filter(t => !orderArray.includes(t.id));
    return [...ordered, ...unordered];
  };

  const orderedRecommended = getOrderedTemplates(recommendedTemplates, recommendedOrder);
  const orderedAllTemplates = getOrderedTemplates(otherTemplates, allTemplatesOrder);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const handlePreview = (templateId: string) => {
    setPreviewTemplateId(templateId);
    setIsPreviewOpen(true);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeTemplate = filteredTemplates.find(t => t.id === active.id);
    if (!activeTemplate) return;

    const isRecommended = activeTemplate.isRecommended;
    const templates = isRecommended ? orderedRecommended : orderedAllTemplates;
    const setOrder = isRecommended ? setRecommendedOrder : setAllTemplatesOrder;

    const oldIndex = templates.findIndex(t => t.id === active.id);
    const newIndex = templates.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(templates.map(t => t.id), oldIndex, newIndex);
      setOrder(newOrder);
    }
  };

  const activeTemplate = activeId ? filteredTemplates.find(t => t.id === activeId) : null;

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Templates</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Modern">Modern</TabsTrigger>
          </TabsList>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="mt-6 space-y-6">
              {orderedRecommended.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">Recommended</h4>
                    <Badge variant="secondary" className="text-xs">
                      {orderedRecommended.length}
                    </Badge>
                  </div>
                  
                  <SortableContext items={orderedRecommended.map(t => t.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 gap-4">
                      {orderedRecommended.map((template) => (
                        <SortableTemplate
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplate === template.id}
                          onSelect={onTemplateSelect}
                          onPreview={handlePreview}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}
              
              {orderedAllTemplates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">All Templates</h4>
                    <Badge variant="outline" className="text-xs">
                      {orderedAllTemplates.length}
                    </Badge>
                  </div>
                  
                  <SortableContext items={orderedAllTemplates.map(t => t.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 gap-4">
                      {orderedAllTemplates.map((template) => (
                        <SortableTemplate
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplate === template.id}
                          onSelect={onTemplateSelect}
                          onPreview={handlePreview}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No templates found matching your criteria.
                  </p>
                </div>
              )}
            </div>

            <DragOverlay>
              {activeTemplate ? (
                <div className="opacity-90 scale-105 shadow-lg">
                  <TemplatePreview
                    template={activeTemplate}
                    isSelected={selectedTemplate === activeTemplate.id}
                    onSelect={() => {}}
                    onPreview={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Tabs>
      </CardContent>

      {previewTemplateId && (
        <TemplatePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          templateId={previewTemplateId}
          onSelect={(id) => {
            onTemplateSelect(id);
            setIsPreviewOpen(false);
          }}
        />
      )}
    </Card>
  );
};