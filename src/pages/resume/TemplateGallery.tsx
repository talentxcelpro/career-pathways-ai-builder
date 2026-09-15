import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Eye, Zap, Sparkles } from 'lucide-react';
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

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="pt-8 pb-6 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[11px] font-extrabold border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ATS-Optimized Designs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Professional Resume Templates
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Curated, recruiter-tested templates engineered to pass ATS filters and highlight your professional achievements.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card/70 backdrop-blur-sm border border-border/80 rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 text-xs font-medium rounded-xl"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10 text-xs font-medium rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value} className="text-xs">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 text-xs font-medium rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ats-score" className="text-xs">ATS Score</SelectItem>
                    <SelectItem value="name" className="text-xs">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2 h-10 text-xs font-bold rounded-xl">
                  <Filter className="h-3.5 w-3.5" />
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
                <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                  onClick={() => setPreviewTemplateId(template.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Preview ${template.name} template`}
                >
                  <div className="relative">
                    <img
                      src={template.preview}
                      alt={`${template.name} resume template preview - ${template.category} style, ATS-friendly`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.src = '/placeholder.svg';
                        img.onerror = null;
                      }}
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="gap-2" onClick={(ev) => { ev.stopPropagation(); setPreviewTemplateId(template.id); }}>
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Link to={`/resume/builder?template=${template.id}`} className="inline-flex" onClick={(ev) => ev.stopPropagation()}>
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
                      <Link to={`/resume/builder?template=${template.id}`} className="w-full" onClick={(ev) => ev.stopPropagation()}>
                        <Button className="w-full">
                          Use This Template
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full" onClick={(ev) => { ev.stopPropagation(); setPreviewTemplateId(template.id); }}>
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