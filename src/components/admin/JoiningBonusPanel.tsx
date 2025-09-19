import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { useJoiningBonus } from '@/hooks/useJoiningBonus';

export const JoiningBonusPanel = () => {
  const { awardJoiningBonuses, isProcessing } = useJoiningBonus();

  const handleAwardBonuses = () => {
    awardJoiningBonuses();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Joining Bonus Award
        </CardTitle>
        <CardDescription>
          Award 100 TXC joining bonus to all users who haven't received it yet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Joining Bonus Details:</h4>
          <ul className="text-sm space-y-1">
            <li>• Amount: 100 TXC per user</li>
            <li>• Only users who haven't received it before</li>
            <li>• Automatic prevention of duplicates</li>
            <li>• Welcome message included</li>
          </ul>
        </div>
        
        <Button 
          onClick={handleAwardBonuses}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Award Joining Bonuses'}
        </Button>
      </CardContent>
    </Card>
  );
};