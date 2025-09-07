import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { resumeTemplates as allTemplates, ResumeTemplate } from '@/data/resumeTemplates';
import { TemplatePreviewModal } from '@/components/resume/templates/TemplatePreviewModal';
import { MobileTemplatePreviewModal } from '@/components/resume/templates/MobileTemplatePreviewModal';

const TemplateGallery = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('ats-score');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Build categories dynamically from data
  const categorySet = Array.from(new Set(allTemplates.map(t => t.category)));
  const categories = [{ value: 'all', label: 'All Templates' }, ...categorySet.map(c => ({ value: c, label: c }))];

  const templates: ResumeTemplate[] = allTemplates;

  const filteredTemplates = templates.filter(template => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = template.name.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.features.some(f => f.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'ats-score':
        return b.atsScore - a.atsScore;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <>
      <Helmet>
        <title>Resume Templates | 50+ ATS-Optimized Templates | TalentXcel</title>
        <meta
          name="description"
          content="Choose from 50+ professional resume templates. ATS-optimized designs for every industry and experience level. Free and premium options available." />
        <link rel="canonical" href="https://talentxcel.in/templates" />
        <meta property="og:title" content="Professional Resume Templates - TalentXcel" />
        <meta property="og:description" content="ATS-optimized resume templates for every career stage" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Professional Resume Templates
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Choose from our collection of ATS-optimized templates designed by career experts.
              Get hired faster with templates that pass through applicant tracking systems.
            </p>

            {/* Stats */}
            {/* ... keep existing code (hero stats visuals) */}
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ats-score">ATS Score</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="relative">
                    <img
                      src={template.preview}
                      alt={`${template.name} resume template preview - ${template.category} style, ATS-friendly`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="gap-2" onClick={() => setPreviewTemplateId(template.id)}>
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Link to={`/resume/builder?template=${template.id}`} className="inline-flex">
                        <Button size="sm" className="gap-2">
                          Use Template
                        </Button>
                      </Link>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {template.isPremium && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Zap className="h-3 w-3" />
                          PRO
                        </Badge>
                      )}
                    </div>

                    {/* ATS Score */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={template.atsScore >= 95 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        ATS {template.atsScore}%
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Features */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((f) => (
                          <Badge key={f} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Link to={`/resume/builder?template=${template.id}`} className="w-full">
                        <Button className="w-full">
                          Use This Template
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setPreviewTemplateId(template.id)}>
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* ... keep existing code (CTA section visuals) */}
      </div>

      {/* Preview Modal */}
      {previewTemplateId && (
        isMobile ? (
          <MobileTemplatePreviewModal
            isOpen={!!previewTemplateId}
            onClose={() => setPreviewTemplateId(null)}
            templateId={previewTemplateId}
            onSelect={(id) => navigate(`/resume/builder?template=${id}`)}
          />
        ) : (
          <TemplatePreviewModal
            isOpen={!!previewTemplateId}
            onClose={() => setPreviewTemplateId(null)}
            templateId={previewTemplateId}
            onSelect={(id) => navigate(`/resume/builder?template=${id}`)}
          />
        )
      )}
    </>
  );
};

export default TemplateGallery;