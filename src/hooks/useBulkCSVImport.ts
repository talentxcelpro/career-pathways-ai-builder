
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

  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing connection to bulk-csv-import function...');
      const { data, error } = await supabase.functions.invoke('bulk-csv-import', {
        body: { test: true }
      });
      
      if (error) {
        console.error('Connection test failed:', error);
        return false;
      }
      
      console.log('Connection test successful:', data);
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  };

  const parseCSV = (csvText: string): CSVUser[] => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have header row and at least one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const users: CSVUser[] = [];

      console.log('CSV Headers found:', headers);

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

        if (user.email && user.email.includes('@')) {
          users.push(user);
        } else {
          console.warn(`Skipping row ${i + 1}: Invalid or missing email`);
        }
      }

      console.log(`Parsed ${users.length} valid users from ${lines.length - 1} rows`);
      return users;
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
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
      console.log('Starting CSV import process...');
      console.log('File info:', {
        name: csvFile.name,
        size: csvFile.size,
        type: csvFile.type
      });

      // Test connection first
      toast.info('Testing connection...');
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error('Failed to connect to import service. Please try again.');
      }

      // Read and parse CSV
      console.log('Reading CSV file...');
      const csvText = await csvFile.text();
      console.log('CSV text length:', csvText.length);
      
      const users = parseCSV(csvText);

      if (users.length === 0) {
        throw new Error('No valid users found in CSV file');
      }

      console.log(`Parsed ${users.length} users from CSV`);
      toast.success(`Parsed ${users.length} users from CSV - starting import...`);

      // Initialize progress
      setProgress({
        total: users.length,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        batchNumber: 0
      });

      // Optimize batch settings based on user count
      const optimizedBatchSize = users.length > 1000 ? 200 : 100;
      const optimizedConcurrency = users.length > 5000 ? 8 : 5;

      console.log('Calling bulk import function with:', {
        userCount: users.length,
        batchSize: options.batchSize || optimizedBatchSize,
        maxConcurrent: options.maxConcurrent || optimizedConcurrency
      });

      // Call the bulk import edge function
      const { data, error } = await supabase.functions.invoke('bulk-csv-import', {
        body: {
          csvData: users,
          batchSize: options.batchSize || optimizedBatchSize,
          maxConcurrent: options.maxConcurrent || optimizedConcurrency
        }
      });

      console.log('Import function response:', { data, error });

      if (error) {
        console.error('Import function error:', error);
        throw new Error(`Import service error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No response data from import service');
      }

      if (!data.success) {
        console.error('Import failed:', data);
        throw new Error(data.error || 'Import failed for unknown reason');
      }

      setProgress(data.progress);
      
      const { successful, failed, total, usersPerSecond, successRate } = data.progress;
      
      toast.success(
        `Import completed! ${successful}/${total} users created successfully. ` +
        `Rate: ${usersPerSecond || 0} users/sec, Success: ${successRate?.toFixed(1) || 0}%`
      );

      if (failed > 0) {
        console.warn(`${failed} users failed to import:`, data.progress.errors);
        toast.warning(`${failed} users failed to import. Check console for details.`);
      }

      return data.progress;

    } catch (error) {
      console.error('CSV import error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('Failed to send a request')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid server response. Please try again.';
      }
      
      toast.error(`Import failed: ${errorMessage}`);
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
    generateCSVTemplate,
    testConnection
  };
};
