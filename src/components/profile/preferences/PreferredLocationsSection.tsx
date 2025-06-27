
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, X } from "lucide-react";

interface PreferredLocationsSectionProps {
  locations: string[];
  onLocationsChange: (locations: string[]) => void;
}

export const PreferredLocationsSection = ({ locations, onLocationsChange }: PreferredLocationsSectionProps) => {
  const [newLocation, setNewLocation] = useState("");

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      onLocationsChange([...locations, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    onLocationsChange(locations.filter(l => l !== location));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Preferred Locations
        </CardTitle>
        <CardDescription>Where would you like to work?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {locations.map((location, index) => (
              <Badge key={index} variant="secondary" className="pr-2">
                {location}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeLocation(location)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add preferred location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
            />
            <Button onClick={addLocation}>
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
