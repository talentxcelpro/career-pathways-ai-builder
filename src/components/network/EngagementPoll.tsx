import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Clock } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  totalVotes: number;
  timeLeft: string;
  category: string;
}

export const EngagementPoll: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Mock poll data - would be fetched from API
  const currentPoll: Poll = {
    id: '1',
    question: 'Which skill should freshers prioritize in 2025? 🤔',
    description: 'Based on current market trends and job demands',
    options: [
      { id: 'ai', text: 'AI & Machine Learning', votes: 245, percentage: 35 },
      { id: 'cloud', text: 'Cloud Computing', votes: 189, percentage: 27 },
      { id: 'cyber', text: 'Cybersecurity', votes: 140, percentage: 20 },
      { id: 'data', text: 'Data Science', votes: 126, percentage: 18 }
    ],
    totalVotes: 700,
    timeLeft: '2d left',
    category: 'Career Skills'
  };

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    
    setSelectedOption(optionId);
    setHasVoted(true);
    
    // Would make API call here to submit vote
    console.log('Voted for:', optionId);
  };

  const getOptionColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="m-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <BarChart3 className="h-3 w-3 mr-1" />
                {currentPoll.category}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{currentPoll.timeLeft}</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {currentPoll.question}
            </h3>
            {currentPoll.description && (
              <p className="text-sm text-muted-foreground">
                {currentPoll.description}
              </p>
            )}
          </div>
        </div>

        {/* Poll Options */}
        <div className="space-y-3">
          {currentPoll.options.map((option, index) => (
            <div key={option.id} className="space-y-2">
              <Button
                variant={selectedOption === option.id ? "default" : "outline"}
                className={`w-full justify-start h-auto p-3 ${
                  hasVoted ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'
                }`}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{option.text}</span>
                  {hasVoted && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {option.votes} votes
                      </span>
                      <span className="text-sm font-semibold">
                        {option.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </Button>
              
              {hasVoted && (
                <div className="px-3">
                  <Progress 
                    value={option.percentage} 
                    className={`h-2 bg-muted/30`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{currentPoll.totalVotes.toLocaleString()} people voted</span>
          </div>
          
          {hasVoted ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              ✓ Voted
            </Badge>
          ) : (
            <span className="text-xs text-primary font-medium">
              Cast your vote →
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};