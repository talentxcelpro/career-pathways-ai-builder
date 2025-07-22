import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  batchNumber: number;
  totalTime?: number;
  usersPerSecond?: number;
  successRate?: number;
}

interface CSVUser {
  email: string;
  full_name?: string;
  user_role?: 'admin' | 'job_seeker' | 'employer' | 'candidate';
  phone?: string;
  title?: string;
  location?: string;
  company?: string;
}

export const useBulkCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const parseCSV = (csvText: string): CSVUser[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const users: CSVUser[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const user: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Map common header variations
        switch (header.toLowerCase()) {
          case 'email':
          case 'email_address':
          case 'user_email':
            user.email = value;
            break;
          case 'full_name':
          case 'fullname':
          case 'name':
          case 'display_name':
            user.full_name = value;
            break;
          case 'user_role':
          case 'role':
          case 'user_type':
            user.user_role = value;
            break;
          case 'phone':
          case 'phone_number':
          case 'mobile':
            user.phone = value;
            break;
          case 'title':
          case 'job_title':
          case 'position':
            user.title = value;
            break;
          case 'location':
          case 'city':
          case 'address':
            user.location = value;
            break;
          case 'company':
          case 'organization':
          case 'employer':
            user.company = value;
            break;
        }
      });

      if (user.email) {
        users.push(user);
      }
    }

    return users;
  };

  const importFromCSV = async (
    csvFile: File, 
    options: {
      batchSize?: number;
      maxConcurrent?: number;
    } = {}
  ) => {
    setIsImporting(true);
    setProgress(null);

    try {
      // Read and parse CSV
      const csvText = await csvFile.text();
      const users = parseCSV(csvText);

      if (users.length === 0) {
        throw new Error('No valid users found in CSV');
      }

      console.log(`Parsed ${users.length} users from CSV`);
      toast.success(`Parsed ${users.length} users from CSV`);

      // Initialize progress
      setProgress({
        total: users.length,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        batchNumber: 0
      });

      // Call the bulk import edge function
      const { data, error } = await supabase.functions.invoke('bulk-csv-import', {
        body: {
          csvData: users,
          batchSize: options.batchSize || 500,
          maxConcurrent: options.maxConcurrent || 10
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setProgress(data.progress);
      
      const { successful, failed, total, usersPerSecond, successRate } = data.progress;
      
      toast.success(
        `Import completed! ${successful}/${total} users created successfully. ` +
        `Rate: ${usersPerSecond} users/sec, Success: ${successRate?.toFixed(1)}%`
      );

      if (failed > 0) {
        console.warn(`${failed} users failed to import:`, data.progress.errors);
      }

      return data.progress;

    } catch (error) {
      console.error('CSV import error:', error);
      toast.error(`Import failed: ${error.message}`);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  const generateCSVTemplate = () => {
    const template = [
      'email,full_name,user_role,phone,title,location,company',
      'john.doe@example.com,John Doe,candidate,+1234567890,Software Engineer,New York,TechCorp',
      'jane.smith@example.com,Jane Smith,employer,+1987654321,HR Manager,San Francisco,StartupInc',
      'bob.wilson@example.com,Bob Wilson,job_seeker,+1555666777,Marketing Specialist,Chicago,MediaCo'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    isImporting,
    progress,
    importFromCSV,
    generateCSVTemplate
  };
};