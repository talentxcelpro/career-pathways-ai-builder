import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, BookOpen } from "lucide-react";
import { Publication } from "@/types/enhanced-resume";

interface PublicationsSectionProps {
  data: Publication[];
  onChange: (data: Publication[]) => void;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  data,
  onChange,
}) => {
  const addPublication = () => {
    const newPublication: Publication = {
      id: crypto.randomUUID(),
      title: "",
      journal: "",
      authors: [],
      publicationDate: "",
      url: "",
      doi: "",
      abstract: "",
    };
    onChange([...data, newPublication]);
  };

  const updatePublication = (id: string, field: keyof Publication, value: any) => {
    onChange(
      data.map((pub) =>
        pub.id === id ? { ...pub, [field]: value } : pub
      )
    );
  };

  const removePublication = (id: string) => {
    onChange(data.filter((pub) => pub.id !== id));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Publications
        </CardTitle>
        <Button onClick={addPublication} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Publication
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((publication) => (
          <Card key={publication.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor={`title-${publication.id}`}>Publication Title *</Label>
                      <Input
                        id={`title-${publication.id}`}
                        value={publication.title}
                        onChange={(e) => updatePublication(publication.id, "title", e.target.value)}
                        placeholder="e.g., Machine Learning Applications in Healthcare"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`journal-${publication.id}`}>Journal/Conference *</Label>
                      <Input
                        id={`journal-${publication.id}`}
                        value={publication.journal}
                        onChange={(e) => updatePublication(publication.id, "journal", e.target.value)}
                        placeholder="e.g., Nature Medicine"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`date-${publication.id}`}>Publication Date</Label>
                      <Input
                        id={`date-${publication.id}`}
                        type="month"
                        value={publication.publicationDate}
                        onChange={(e) => updatePublication(publication.id, "publicationDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`authors-${publication.id}`}>Authors</Label>
                    <Input
                      id={`authors-${publication.id}`}
                      value={publication.authors}
                      onChange={(e) => updatePublication(publication.id, "authors", e.target.value)}
                      placeholder="e.g., Smith, J., Doe, A., Johnson, M."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`url-${publication.id}`}>URL</Label>
                      <Input
                        id={`url-${publication.id}`}
                        value={publication.url}
                        onChange={(e) => updatePublication(publication.id, "url", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor={`doi-${publication.id}`}>DOI</Label>
                      <Input
                        id={`doi-${publication.id}`}
                        value={publication.doi}
                        onChange={(e) => updatePublication(publication.id, "doi", e.target.value)}
                        placeholder="10.1000/xyz123"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => removePublication(publication.id)}
                  size="sm"
                  variant="outline"
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor={`abstract-${publication.id}`}>Abstract</Label>
                <Textarea
                  id={`abstract-${publication.id}`}
                  value={publication.abstract}
                  onChange={(e) => updatePublication(publication.id, "abstract", e.target.value)}
                  placeholder="Brief summary of the publication..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No publications added yet.</p>
            <p className="text-sm">Click "Add Publication" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};