
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkApplicantExportProps {
  jobId: string;
  jobTitle: string;
  applicants: any[];
}

interface ExportOptions {
  format: 'csv' | 'zip';
  includeFields: {
    basicInfo: boolean;
    contactInfo: boolean;
    applicationData: boolean;
    resumeFiles: boolean;
  };
  statusFilter: string;
}

export const BulkApplicantExport: React.FC<BulkApplicantExportProps> = ({
  jobId,
  jobTitle,
  applicants
}) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeFields: {
      basicInfo: true,
      contactInfo: true,
      applicationData: false,
      resumeFiles: false
    },
    statusFilter: 'all'
  });

  const filteredApplicants = applicants.filter(app => 
    options.statusFilter === 'all' || app.status === options.statusFilter
  );

  const generateCSV = (data: any[]) => {
    const headers = [];
    const rows = [];

    // Build headers based on selected fields
    if (options.includeFields.basicInfo) {
      headers.push('Name', 'Status', 'Applied Date', 'Match Score');
    }
    if (options.includeFields.contactInfo) {
      headers.push('Email', 'Phone', 'Location');
    }
    if (options.includeFields.applicationData) {
      headers.push('Experience Years', 'Current CTC', 'Expected CTC', 'Notice Period');
    }

    // Build rows
    data.forEach(app => {
      const row = [];
      
      if (options.includeFields.basicInfo) {
        row.push(
          app.profiles?.full_name || 'N/A',
          app.status,
          new Date(app.applied_at).toLocaleDateString(),
          app.ai_match_score ? `${Math.round(app.ai_match_score * 100)}%` : 'N/A'
        );
      }
      
      if (options.includeFields.contactInfo) {
        row.push(
          app.profiles?.email || 'N/A',
          app.profiles?.phone || 'N/A',
          app.profiles?.location || 'N/A'
        );
      }
      
      if (options.includeFields.applicationData) {
        const appData = app.application_data || {};
        row.push(
          appData.yearsOfExperience || 'N/A',
          appData.currentCTC || 'N/A',
          appData.expectedCTC || 'N/A',
          appData.noticePeriod || 'N/A'
        );
      }
      
      rows.push(row);
    });

    // Convert to CSV
    const csvContent = [headers.join(','), ...rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )].join('\n');

    return csvContent;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (filteredApplicants.length === 0) {
      toast.error('No applicants match the selected criteria');
      return;
    }

    setExporting(true);

    try {
      if (options.format === 'csv') {
        const csvContent = generateCSV(filteredApplicants);
        const filename = `${jobTitle.replace(/\s+/g, '_')}_Applicants_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(csvContent, filename);
        toast.success(`Exported ${filteredApplicants.length} applicants to CSV`);
      } else {
        // ZIP export would require additional implementation
        toast.info('ZIP export functionality coming soon');
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export applicant data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Applicants
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Applicant Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select 
              value={options.format} 
              onValueChange={(value: 'csv' | 'zip') => 
                setOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="zip">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    ZIP with Resumes
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Filter by Status</Label>
            <Select 
              value={options.statusFilter} 
              onValueChange={(value) => 
                setOptions(prev => ({ ...prev, statusFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <Label>Include Fields</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basicInfo"
                  checked={options.includeFields.basicInfo}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({
                      ...prev,
                      includeFields: { ...prev.includeFields, basicInfo: !!checked }
                    }))
                  }
                />
                <Label htmlFor="basicInfo">Basic Info (Name, Status, Date)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contactInfo"
                  checked={options.includeFields.contactInfo}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({
                      ...prev,
                      includeFields: { ...prev.includeFields, contactInfo: !!checked }
                    }))
                  }
                />
                <Label htmlFor="contactInfo">Contact Info (Email, Phone)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="applicationData"
                  checked={options.includeFields.applicationData}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({
                      ...prev,
                      includeFields: { ...prev.includeFields, applicationData: !!checked }
                    }))
                  }
                />
                <Label htmlFor="applicationData">Application Details</Label>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''} will be exported
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
