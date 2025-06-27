
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Briefcase, X } from "lucide-react";

interface PreferredRolesSectionProps {
  roles: string[];
  onRolesChange: (roles: string[]) => void;
}

export const PreferredRolesSection = ({ roles, onRolesChange }: PreferredRolesSectionProps) => {
  const [newRole, setNewRole] = useState("");

  const addRole = () => {
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      onRolesChange([...roles, newRole.trim()]);
      setNewRole("");
    }
  };

  const removeRole = (role: string) => {
    onRolesChange(roles.filter(r => r !== role));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Preferred Roles
        </CardTitle>
        <CardDescription>What job titles are you interested in?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {roles.map((role, index) => (
              <Badge key={index} variant="secondary" className="pr-2">
                {role}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeRole(role)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add preferred role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRole()}
            />
            <Button onClick={addRole}>
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
