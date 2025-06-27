
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalNotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const AdditionalNotesSection = ({ notes, onNotesChange }: AdditionalNotesSectionProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Additional Notes</CardTitle>
        <CardDescription>Any other preferences or requirements?</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Share any additional preferences, requirements, or notes about your job search..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[100px]"
        />
      </CardContent>
    </Card>
  );
};
