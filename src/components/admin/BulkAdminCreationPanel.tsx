
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  UserPlus, 
  Crown, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  Download 
} from 'lucide-react';
import { useBulkAdminCreation } from '@/hooks/useBulkAdminCreation';
import { toast } from 'sonner';

export const BulkAdminCreationPanel = () => {
  const [emailInput, setEmailInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { createBulkSuperAdmins, isLoading, results, clearResults } = useBulkAdminCreation();

  // Pre-populate with the specified emails
  const predefinedEmails = [
    'talentxcelpro12@gmail.com',
    'viralpay2025@gmail.com',
    'sanayah.arshid@gmail.com',
    'arsh.wani1@gmail.com',
    'arsh.wani@gmail.com',
    'talentxcelservices@gmail.com',
    'arshid.wani@icloud.com'
  ];

  const handleLoadPredefined = () => {
    setEmailInput(predefinedEmails.join('\n'));
  };

  const handleCreateAdmins = async () => {
    const emailList = emailInput
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    const result = await createBulkSuperAdmins(emailList);
    if (result) {
      setShowResults(true);
    }
  };

  const handleCopyCredentials = (email: string, password: string) => {
    const credentials = `Email: ${email}\nPassword: ${password}\nLogin: https://talentxcel.in/auth/login`;
    navigator.clipboard.writeText(credentials);
    toast.success('Credentials copied to clipboard!');
  };

  const handleDownloadResults = () => {
    const csvContent = [
      'Email,Status,User ID,Password,Message',
      ...results.map(result => 
        `${result.email},${result.success ? 'Success' : 'Failed'},${result.userId || ''},${result.password || ''},${result.message}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-admin-creation-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    clearResults();
    setShowResults(false);
    setEmailInput('');
  };

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  if (showResults && results.length > 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Bulk Super Admin Creation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-600">Total Processed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleDownloadResults} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
            <Button onClick={handleStartOver} variant="outline">
              Create More Admins
            </Button>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.email}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                      {result.error && (
                        <div className="text-sm text-red-600 mt-1">Error: {result.error}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result.success && (
                      <>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Super Admin
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Pro Elite
                        </Badge>
                        {result.password && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCredentials(result.email, result.password!)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Credentials
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Bulk Create Super Admin & Elite Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will create Super Admin accounts with Pro Elite subscriptions (₹1999/month value) for the specified email addresses. 
            Each user will receive login credentials via email.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Email Addresses (one per line)</label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadPredefined}
              className="text-xs"
            >
              Load Predefined List
            </Button>
          </div>
          
          <Textarea
            placeholder="Enter email addresses, one per line..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            What they'll get:
          </h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• <strong>Super Admin</strong> privileges (full platform access)</li>
            <li>• <strong>Pro Elite</strong> subscription (₹1999/month value, 1-year complimentary)</li>
            <li>• Access to all admin tools and analytics</li>
            <li>• Welcome email with login credentials</li>
            <li>• Ability to manage users, content, and platform settings</li>
          </ul>
        </div>

        <Button
          onClick={handleCreateAdmins}
          disabled={isLoading || !emailInput.trim()}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>Creating Super Admin Accounts...</>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Super Admin & Elite Users
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
