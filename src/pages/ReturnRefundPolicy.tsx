import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const ReturnRefundPolicy = () => {
  const sections = [
    {
      title: "1. Services Covered",
      content: `This policy applies to the following paid services offered through TalentXcel:

• Resume Writing Services
• Interview Preparation & Career Mapping Services
• Job Listing Services (for Employers)
• Network Premium Plan (Subscription)
• Professional Services Marketplace Transactions`
    },
    {
      title: "2. Cancellation Policy",
      content: `Resume Writing / Interview Services:
Cancellation is only allowed within 2 hours of order placement. After that, work may already be in progress and cancellation is no longer guaranteed.

Job Listings / Employer Services:
Cancellations are not permitted once a job listing has been published or activated.

Network Premium Plan (Subscription-based):
You may cancel your subscription anytime. However, cancellation will only stop the next billing cycle. No refund is issued for the current billing period.`
    },
    {
      title: "3. Refund Policy",
      content: `Resume Writing / Career Services:
No refunds will be issued once work has begun. In case of dissatisfaction, revisions will be offered as per the scope of service.

Job Listings / Employer Services:
Once the job is live or accessed by candidates, no refund will be processed.

Network Premium Plan:
Refunds are not applicable once the subscription is activated. You may cancel auto-renewal at any time.

Marketplace Services:
If you purchase services from verified professionals (such as mentors, resume writers, or coaches), refunds are subject to their individual terms and are not handled directly by TalentXcel. Please contact the service provider directly for disputes.`
    },
    {
      title: "4. No Return Policy",
      content: `Since TalentXcel offers digital services and access-based subscriptions, there is no concept of physical product returns.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Return, Refund, and Cancellation Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent policies for all TalentXcel services and subscriptions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Effective Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This policy is effective from July 01, 2025, and was last updated on July 01, 2025.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                At TalentXcel, we are committed to providing a seamless and transparent experience for all our users. Please read our Return, Refund, and Cancellation Policy carefully before making any purchases or subscribing to any of our services.
              </p>
            </CardContent>
          </Card>

          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-muted-foreground">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">5. Contact for Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions regarding a specific service or believe you were charged in error, please reach out to us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-foreground">📩 support@talentxcel.in</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Our support team typically responds within 24-48 hours during business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};