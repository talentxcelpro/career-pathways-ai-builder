
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface UploadFormData {
  name: string;
  type: string;
  file: File | null;
}

interface DocumentUploadFormProps {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const DocumentUploadForm = ({ formData, setFormData, onSubmit, onCancel }: DocumentUploadFormProps) => {
  const { toast } = useToast();
  
  const documentTypes = [
    { value: "certification", label: "Certification" },
    { value: "education", label: "Education" },
    { value: "identification", label: "Identification" },
    { value: "reference", label: "Reference" }
  ];

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please provide a document name.",
        variant: "destructive",
      });
      return;
    }
    onSubmit();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Upload New Document</CardTitle>
        <CardDescription>Add certificates, education documents, or professional credentials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Document name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        
        <div>
          <label className="text-sm font-medium mb-2 block">Document Type</label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Choose File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Upload Document</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};
