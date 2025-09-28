import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { executeJobUpload } from '@/utils/uploadNewJobs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminJobUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isDirectUploading, setIsDirectUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const result = await executeJobUpload();
      setUploadResult(result);
      
      if (result?.success) {
        toast.success(`Successfully uploaded ${result.successfulJobs} jobs!`);
      } else {
        toast.error('Upload failed. Check console for details.');
      }
    } catch (error) {
      toast.error('Upload failed. Check console for details.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectUpload = async () => {
    setIsDirectUploading(true);
    try {
      const talentxcelJobs = [
        {
          title: "IT Helpdesk Executive – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Join TalentXcel as an IT Helpdesk Executive and be the first point of contact for IT support. Learn to troubleshoot hardware, software, and network issues for enterprise clients while gaining hands-on exposure to IT operations.

Key Responsibilities:
• Respond to IT queries via phone, chat, and email
• Troubleshoot desktops, laptops, printers, and software applications
• Log and manage tickets in ITSM systems (Jira, ServiceNow, Freshservice)
• Escalate unresolved issues to higher-level technical teams
• Assist with software installations, patching, and system upgrades
• Guide end-users with clear instructions
• Maintain and update knowledge base articles
• Ensure SLA compliance for timely ticket resolution

Required Skills:
• Windows, Linux, macOS troubleshooting
• Networking fundamentals: TCP/IP, DNS, DHCP, LAN/WAN
• Microsoft Office Suite
• ITSM tools experience
• Strong communication, analytical, and problem-solving skills

Qualifications:
Graduate in Engineering, IT, CS, or related field. Freshers encouraged with good technical aptitude and communication skills.

Why Join TalentXcel?
• Work with top enterprise IT clients in Delhi NCR
• Structured training, onboarding, and mentorship programs
• Career growth into Desktop Support, Infra, Networking, or Cloud roles

Apply now to start your IT career with TalentXcel!`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 220000,
          salary_max: 300000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "ITSM", "Networking", "TCP/IP", "DNS", "DHCP", "Microsoft Office", "Communication", "Problem Solving"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "it-helpdesk-executive-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["IT Support", "Helpdesk", "Fresher", "Enterprise", "ITSM"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Desktop Support Technician – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Become a Desktop Support Technician at TalentXcel. Assist enterprise users with hardware and software issues, and gain practical exposure to IT support operations.

Key Responsibilities:
• Troubleshoot desktops, laptops, printers, and peripherals
• Install software, perform updates, and manage patches
• Escalate unresolved issues to senior engineers
• Maintain ticket logs in ITSM systems and adhere to SLA standards
• Provide remote support via VPN or RDP
• Document recurring issues and update knowledge base articles

Required Skills:
• OS troubleshooting (Windows, Linux, macOS)
• Basic networking fundamentals
• MS Office proficiency
• Familiarity with ITSM tools (ServiceNow, Jira)
• Strong communication and problem-solving skills

Qualifications: Graduate in any field; IT/CS preferred.

Why Join TalentXcel?
• Enterprise exposure for freshers
• Mentorship and structured career growth
• Opportunities to progress into Desktop Support, Network, or Infra roles`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 250000,
          salary_max: 320000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "ITSM", "ServiceNow", "Jira", "VPN", "RDP", "Hardware Troubleshooting"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "desktop-support-technician-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Desktop Support", "IT Support", "Fresher", "Hardware", "Software"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Helpdesk Support Engineer – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Provide first-line support to enterprise users, troubleshoot IT issues, and assist with ITSM processes.

Key Responsibilities:
• Handle support requests via email, chat, and phone
• Troubleshoot hardware, software, and network issues
• Escalate complex issues to L2/L3 support teams
• Log all incidents and track ticket status in ITSM systems
• Assist with software updates and installations
• Maintain documentation for recurring issues

Required Skills:
• Windows/Linux/macOS OS troubleshooting
• Networking basics (TCP/IP, DHCP, DNS)
• Familiarity with ITSM/ticketing tools
• Strong communication and analytical skills

Qualifications: Graduate in IT, CS, or Engineering.

Why Join TalentXcel?
• Hands-on experience with enterprise IT support
• Structured fresher training program
• Growth path into Service Desk, Infra, or Networking roles`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 230000,
          salary_max: 310000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "TCP/IP", "DHCP", "DNS", "ITSM", "Ticketing", "L2 Support"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "helpdesk-support-engineer-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Helpdesk", "Support Engineer", "Fresher", "ITSM", "L2 Support"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Technical Support Executive – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Assist end-users in resolving IT issues while gaining practical exposure to IT operations.

Key Responsibilities:
• Troubleshoot hardware, software, and network problems
• Log incidents in ITSM systems and track SLA adherence
• Escalate unresolved issues to senior technical teams
• Provide clear instructions to end-users for resolving technical issues
• Support software installations, system updates, and configurations

Required Skills:
• Windows/Linux/macOS troubleshooting
• Networking fundamentals (LAN/WAN, VPN, TCP/IP)
• Proficiency in MS Office and ITSM tools
• Analytical and communication skills

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Structured fresher training and mentorship
• Exposure to enterprise IT operations
• Career growth into L2/L3 support, Infra, or Cloud roles`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 240000,
          salary_max: 300000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "LAN/WAN", "VPN", "TCP/IP", "ITSM", "SLA Management"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "technical-support-executive-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Technical Support", "IT Support", "Fresher", "SLA", "Enterprise"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Service Desk Support – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Provide first-line IT support, manage service requests, and maintain high user satisfaction.

Key Responsibilities:
• Respond to IT service requests via phone, chat, and email
• Troubleshoot desktops, laptops, printers, and software applications
• Escalate complex issues to senior support teams
• Maintain knowledge base documentation
• Track SLA compliance and close tickets timely

Required Skills:
• OS troubleshooting (Windows, Linux, macOS)
• Networking basics (TCP/IP, VPN, DHCP)
• ITSM/ticketing tools knowledge
• Strong communication, analytical, and multitasking skills

Qualifications: Graduate in IT/CS or any Engineering stream.

Why Join TalentXcel?
• Enterprise exposure for freshers
• Mentorship and career growth into Service Desk or Infra roles`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 220000,
          salary_max: 290000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "TCP/IP", "VPN", "DHCP", "ITSM", "Ticketing", "Service Desk"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "service-desk-support-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Service Desk", "IT Support", "Fresher", "SLA", "Knowledge Base"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        }
      ];

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const job of talentxcelJobs) {
        try {
          const { error } = await supabase
            .from('jobs')
            .insert([job]);

          if (error) {
            errors.push(`${job.title}: ${error.message}`);
            failCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push(`${job.title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          failCount++;
        }
      }

      setUploadResult({
        success: successCount > 0,
        totalJobs: talentxcelJobs.length,
        successfulJobs: successCount,
        failedJobs: failCount,
        errors
      });

      if (successCount > 0) {
        toast.success(`Successfully posted ${successCount} TalentXcel IT jobs!`);
      }
      if (failCount > 0) {
        toast.error(`Failed to post ${failCount} jobs. Check details below.`);
      }
    } catch (error) {
      toast.error('Direct upload failed. Check console for details.');
      console.error('Direct upload error:', error);
    } finally {
      setIsDirectUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Job Upload</CardTitle>
          <CardDescription>
            Upload the new batch of TalentXcel fresher jobs to the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || isDirectUploading}
              size="lg"
              variant="outline"
            >
              {isUploading ? 'Uploading...' : 'Upload New Jobs (30 positions)'}
            </Button>
            
            <Button 
              onClick={handleDirectUpload} 
              disabled={isUploading || isDirectUploading}
              size="lg"
            >
              {isDirectUploading ? 'Posting...' : 'Post TalentXcel IT Jobs (5 positions)'}
            </Button>
          </div>
          
          {uploadResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Upload Results:</h3>
              <p>Total Jobs: {uploadResult.totalJobs}</p>
              <p>Successful: {uploadResult.successfulJobs}</p>
              <p>Failed: {uploadResult.failedJobs}</p>
              
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <pre className="text-sm text-red-500 whitespace-pre-wrap">
                    {JSON.stringify(uploadResult.errors, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobUpload;