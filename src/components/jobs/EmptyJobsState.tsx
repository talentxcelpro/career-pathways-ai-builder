
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus, Edit, Bell } from "lucide-react";

interface EmptyJobsStateProps {
  onResetFilters: () => void;
  onUpdateResume: () => void;
  onSetAlerts: () => void;
}

export const EmptyJobsState: React.FC<EmptyJobsStateProps> = ({
  onResetFilters,
  onUpdateResume,
  onSetAlerts
}) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="text-center py-12">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-6xl mb-4">🔍</div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              📂 Jobs Found: 0
            </h3>
            <p className="text-gray-600">
              No jobs match your current filters. Try:
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onResetFilters}
              variant="default" 
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              🔄 Reset Filters
            </Button>

            <Button 
              onClick={() => {/* Add locations logic */}}
              variant="outline" 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              ➕ Add more locations or skills
            </Button>

            <Button 
              onClick={onUpdateResume}
              variant="outline" 
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              ✍️ Update resume for better matches
            </Button>

            <Button 
              onClick={onSetAlerts}
              variant="outline" 
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              🔔 Subscribe for real-time alerts
            </Button>
          </div>

          <div className="text-xs text-gray-500 border-t pt-4">
            <p>💡 Tip: Broaden your search criteria or check back later for new opportunities</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
