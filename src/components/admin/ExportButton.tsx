
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename: string;
  format?: 'csv' | 'json';
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename, 
  format = 'csv',
  disabled = false 
}) => {
  const exportData = () => {
    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === 'csv') {
        if (data.length === 0) {
          toast.error('No data to export');
          return;
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => 
          Object.values(item).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          ).join(',')
        );
        content = [headers, ...rows].join('\n');
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={exportData}
      disabled={disabled || data.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export {format.toUpperCase()}
    </Button>
  );
};
