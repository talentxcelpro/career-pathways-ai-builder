
import { Card, CardContent } from "@/components/ui/card";
import { Award, FileText, CreditCard, Shield } from "lucide-react";

interface Document {
  id: number;
  type: string;
}

interface DocumentTypeCardsProps {
  documents: Document[];
}

export const DocumentTypeCards = ({ documents }: DocumentTypeCardsProps) => {
  const documentTypes = [
    { value: "certification", label: "Certification", icon: Award },
    { value: "education", label: "Education", icon: FileText },
    { value: "identification", label: "Identification", icon: CreditCard },
    { value: "reference", label: "Reference", icon: Shield }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {documentTypes.map((type) => {
        const Icon = type.icon;
        const count = documents.filter(doc => doc.type === type.value).length;
        
        return (
          <Card key={type.value} className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{type.label}s</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
