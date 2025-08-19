import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SponsoredCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  badge?: string;
  badgeColor?: string;
}

export const NetworkSponsoredCard = ({ 
  title, 
  description, 
  buttonText, 
  buttonColor, 
  badge, 
  badgeColor 
}: SponsoredCardProps) => {
  return (
    <Card className={`${buttonColor} border-0 text-white`}>
      <CardContent className="p-4 space-y-3">
        {badge && (
          <Badge className={`${badgeColor} text-xs px-2 py-1`}>
            {badge}
          </Badge>
        )}
        
        <div className="space-y-2">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/90 leading-relaxed">{description}</p>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 h-8 text-xs"
        >
          {buttonText}
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};