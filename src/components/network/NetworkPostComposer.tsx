import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Image, 
  Video, 
  MapPin, 
  Hash,
  Globe
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const NetworkPostComposer = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  return (
    <Card className="bg-card border shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-foreground">Create Enhanced Post</h3>
        </div>
        
        {/* Content Input */}
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-muted"
          />
          
          {/* Tags Input */}
          <div className="relative">
            <Hash className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Add tags..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Media and Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Image className="w-4 h-4 mr-1" />
              <span className="text-xs">Photo</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Video className="w-4 h-4 mr-1" />
              <span className="text-xs">Video</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-xs">Location</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select defaultValue="public">
              <SelectTrigger className="w-24 h-8 text-xs">
                <Globe className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="connections">Connections</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="h-8 px-4 text-xs bg-purple-500 hover:bg-purple-600">
              <Sparkles className="w-3 h-3 mr-1" />
              Post
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};