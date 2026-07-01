import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Mail, MapPin, Pencil } from "lucide-react";

const PassportProfile: React.FC = () => {
  const { user } = useOptimizedAuth();

  const { data: profile } = useQuery({
    queryKey: ["passport-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const avatar =
    (profile as any)?.profile_picture_url ||
    (profile as any)?.profile_photo_url ||
    "";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Profile"
        title="Your career identity"
        description="This is what recruiters see first. Keep it sharp."
        actions={
          <Button asChild variant="outline">
            <Link to="/profile/edit">
              <Pencil className="mr-2 h-4 w-4" /> Edit profile
            </Link>
          </Button>
        }
      />

      <Card className="border-border/60 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted">
            {avatar ? (
              <img
                src={avatar}
                alt={(profile as any)?.full_name || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground">
                {(profile as any)?.full_name?.[0] ?? "?"}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-title-1 tracking-tight text-foreground">
                {(profile as any)?.full_name || "Add your name"}
              </h2>
              {(profile as any)?.verification_status === "verified" && (
                <Badge className="gap-1 rounded-full">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-body text-muted-foreground">
              {(profile as any)?.title ||
                (profile as any)?.headline ||
                "Add a professional headline"}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {(profile as any)?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {(profile as any).email}
                </span>
              )}
              {(profile as any)?.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {(profile as any).location}
                </span>
              )}
            </div>
            {(profile as any)?.about && (
              <p className="mt-6 max-w-2xl text-body text-foreground">
                {(profile as any).about}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PassportProfile;
