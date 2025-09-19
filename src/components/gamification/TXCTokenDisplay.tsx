import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Gift, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TXCTokenDisplayProps {
  balance: number;
  todayEarned: number;
  potential: number;
  className?: string;
  showActions?: boolean;
}

export const TXCTokenDisplay: React.FC<TXCTokenDisplayProps> = ({
  balance,
  todayEarned,
  potential,
  className,
  showActions = true
}) => {
  const progressPercentage = (todayEarned / potential) * 100;

  return (
    <Card className={cn("bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-primary">TXC Tokens</span>
          </div>
          {showActions && (
            <Button size="sm" variant="outline" className="text-xs">
              <Info className="h-3 w-3 mr-1" />
              Info
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Total Balance */}
          <div className="text-center">
            <motion.p 
              className="text-3xl font-bold text-primary"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {balance.toLocaleString()}
            </motion.p>
            <p className="text-sm text-muted-foreground">Total TXC Balance</p>
          </div>

          {/* Daily Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Today's Progress</span>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                {progressPercentage.toFixed(0)}%
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Earned</span>
                <span className="font-medium text-green-600">{todayEarned} TXC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential</span>
                <span className="font-medium">{potential} TXC</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                <TrendingUp className="h-3 w-3 mr-1" />
                Earn More
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Gift className="h-3 w-3 mr-1" />
                Redeem
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};