
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, ExternalLink } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  tags: string[];
}

interface PortfolioGridProps {
  items: PortfolioItem[];
}

export const PortfolioGrid = ({ items }: PortfolioGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Project
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
