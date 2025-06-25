
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PortfolioFormData {
  title: string;
  description: string;
  projectUrl: string;
  type: string;
}

interface PortfolioFormProps {
  formData: PortfolioFormData;
  setFormData: (data: PortfolioFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const PortfolioForm = ({ formData, setFormData, onSubmit, onCancel }: PortfolioFormProps) => {
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your portfolio item.",
        variant: "destructive",
      });
      return;
    }
    onSubmit();
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium mb-4">Add New Portfolio Item</h4>
      <div className="space-y-4">
        <Input
          placeholder="Project title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Textarea
          placeholder="Project description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="min-h-[100px]"
        />
        <Input
          placeholder="Project URL (GitHub, live demo, etc.)"
          value={formData.projectUrl}
          onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
        />
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Add Project</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};
