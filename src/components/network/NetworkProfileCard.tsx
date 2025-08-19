import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Edit } from "lucide-react";

export const NetworkProfileCard = () => {
  return (
    <Card className="bg-card border shadow-sm">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {/* Profile Images Row */}
          <div className="flex justify-center items-center space-x-1 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center">
              <span className="text-white font-semibold">👩</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center">
              <span className="text-white font-semibold">👩</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center">
              <span className="text-white font-semibold">👩</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-green-400 flex items-center justify-center">
              <span className="text-white font-semibold">👩</span>
            </div>
          </div>
          
          {/* Logo */}
          <div className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">TalentXcel Pro</h3>
            <p className="text-sm text-muted-foreground">Transforming Businesses and Lives</p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Building className="w-3 h-3" />
              <span>TalentXcel Services</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>india</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit profile
            </Button>
            <Button 
              className="w-full h-8 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};