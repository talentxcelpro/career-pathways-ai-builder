import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Users, MessageCircle, UserPlus, Award, AlertTriangle } from 'lucide-react';
import { useSocialTXCAward } from '@/hooks/useSocialTXCAward';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const SocialTXCAwardPanel: React.FC = () => {
  const { awardSocialTXC, isProcessing, lastResults } = useSocialTXCAward();
  const [showResults, setShowResults] = useState(false);

  const handleAward = async () => {
    const success = await awardSocialTXC();
    if (success) {
      setShowResults(true);
    }
  };

  const totalAwarded = lastResults.reduce((sum, result) => sum + (result.awarded || 0), 0);
  const successfulAwards = lastResults.filter(result => !result.error).length;

  return (
    <div className="space-y-6">
      {/* Award Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Social Activity TXC Awards
          </CardTitle>
          <CardDescription>
            Award TXC tokens to all users based on their posts and connections activity.
            Base: 100 TXC + 10 TXC per post (max 50) + 5 TXC per connection (max 50)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Award Formula */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Award Formula:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>Base: 100 TXC</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span>Posts: +10 TXC each (max 50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-green-500" />
                  <span>Connections: +5 TXC each (max 50)</span>
                </div>
              </div>
            </div>

            {/* Award Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg" 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing Awards...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Award Social TXC to All Users
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Confirm Social TXC Award
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will award TXC tokens to ALL users on the platform based on their social activity 
                    (posts and connections). This action cannot be undone. Are you sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAward}>
                    Yes, Award TXC
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Results Panel */}
      {showResults && lastResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Award Results
            </CardTitle>
            <CardDescription>
              Summary of the latest social TXC award distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                  <div className="text-sm text-green-600 dark:text-green-400">Total Users</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {lastResults.length}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Successful Awards</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {successfulAwards}
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="text-sm text-primary">Total TXC Awarded</div>
                  <div className="text-2xl font-bold text-primary">
                    {totalAwarded.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Connections</TableHead>
                      <TableHead>TXC Awarded</TableHead>
                      <TableHead>New Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lastResults.slice(0, 20).map((result) => (
                      <TableRow key={result.user_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{result.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{result.posts || 0}</TableCell>
                        <TableCell>{result.connections || 0}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            +{result.awarded || 0} TXC
                          </Badge>
                        </TableCell>
                        <TableCell>{(result.new_balance || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {result.error ? (
                            <Badge variant="destructive">Error</Badge>
                          ) : (
                            <Badge variant="default">Success</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {lastResults.length > 20 && (
                <div className="text-sm text-muted-foreground text-center">
                  Showing first 20 results. Total: {lastResults.length} users processed.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialTXCAwardPanel;