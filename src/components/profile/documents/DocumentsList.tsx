
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Download, Trash2, Award, FileText, CreditCard, Shield } from "lucide-react";

interface Document {
  id: number;
  name: string;
  type: string;
  fileName: string;
  uploadDate: string;
  size: string;
  verified: boolean;
}

interface DocumentsListProps {
  documents: Document[];
  onDownload: (docId: number, fileName: string) => void;
  onDelete: (docId: number) => void;
}

export const DocumentsList = ({ documents, onDownload, onDelete }: DocumentsListProps) => {
  const documentTypes = [
    { value: "certification", label: "Certification", icon: Award },
    { value: "education", label: "Education", icon: FileText },
    { value: "identification", label: "Identification", icon: CreditCard },
    { value: "reference", label: "Reference", icon: Shield }
  ];

  const getDocumentIcon = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.icon : FileText;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => {
        const Icon = getDocumentIcon(doc.type);
        
        return (
          <div key={doc.id}>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                    <Badge variant={doc.verified ? 'default' : 'secondary'}>
                      {doc.verified ? 'Verified' : 'Pending'}
                    </Badge>
                    <Badge variant="outline">
                      {getDocumentTypeLabel(doc.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {doc.fileName} • {doc.size} • Uploaded {doc.uploadDate}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDownload(doc.id, doc.fileName)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            {index < documents.length - 1 && <Separator className="my-4" />}
          </div>
        );
      })}
    </div>
  );
};
