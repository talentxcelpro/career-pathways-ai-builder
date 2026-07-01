import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const ComingSoonSection: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-10">
    <PageHeader
      eyebrow="Career Passport"
      title={title}
      description="Coming in the next release."
    />
    <Card className="border-dashed border-border/60 p-12 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-4 text-body text-foreground">
        {title} is on the roadmap
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        We're rolling this out alongside the institution verification portal.
        You'll see it here as soon as it ships.
      </p>
    </Card>
  </div>
);

export default ComingSoonSection;
