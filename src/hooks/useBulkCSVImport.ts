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
      console.log('=== CONNECTION TEST START ===');
      console.log('Testing connection to bulk-csv-import function...');
      
      // Get the current Supabase project URL and check configuration
      const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
      const functionUrl = `${SUPABASE_URL}/functions/v1/bulk-csv-import`;
      console.log('Supabase URL:', SUPABASE_URL);
      console.log('Function URL:', functionUrl);

      const testPayload = { test: true };
      console.log('Sending test payload:', testPayload);

      const { data, error } = await supabase.functions.invoke('bulk-csv-import', {
        body: testPayload
      });
      
      console.log('Raw response data:', data);
      console.log('Raw response error:', error);
      
      if (error) {
        console.error('=== CONNECTION TEST ERROR ===');
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          name: error.name
        });
        
        // Try to determine the type of error
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          console.error('Network error detected - function may not be deployed or accessible');
        } else if (error.message?.includes('CORS')) {
          console.error('CORS error detected');
        } else if (error.message?.includes('404')) {
          console.error('Function not found - may not be deployed');
        }
        
        return false;
      }
      
      console.log('=== CONNECTION TEST SUCCESS ===');
      console.log('Connection test successful:', data);
      return true;
    } catch (error) {
      console.error('=== CONNECTION TEST EXCEPTION ===');
      console.error('Connection test exception:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      // Try to get more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
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
      console.log('=== CSV IMPORT START ===');
      console.log('Starting CSV import process...');
      console.log('File info:', {
        name: csvFile.name,
        size: csvFile.size,
        type: csvFile.type
      });

      // Test connection first with detailed logging
      console.log('=== TESTING CONNECTION BEFORE IMPORT ===');
      toast.info('Testing connection...');
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error('Failed to connect to import service. Please check the function deployment and try again.');
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

      const finalOptions = {
        batchSize: options.batchSize || optimizedBatchSize,
        maxConcurrent: options.maxConcurrent || optimizedConcurrency
      };

      console.log('=== CALLING BULK IMPORT FUNCTION ===');
      console.log('Calling bulk import function with:', {
        userCount: users.length,
        ...finalOptions
      });

      // Call the bulk import edge function
      const { data, error } = await supabase.functions.invoke('bulk-csv-import', {
        body: {
          csvData: users,
          ...finalOptions
        }
      });

      console.log('=== IMPORT FUNCTION RESPONSE ===');
      console.log('Import function response data:', data);
      console.log('Import function response error:', error);

      if (error) {
        console.error('=== IMPORT FUNCTION ERROR ===');
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

      console.log('=== CSV IMPORT COMPLETED ===');
      return data.progress;

    } catch (error) {
      console.error('=== CSV IMPORT ERROR ===');
      console.error('CSV import error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('Failed to send a request')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid server response. Please try again.';
      } else if (error.message.includes('Failed to connect to import service')) {
        errorMessage = 'Import service is not available. Please check if the Edge Function is deployed.';
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
