import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { executeJobUpload } from '@/utils/uploadNewJobs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeJobContent } from '@/lib/job/normalizeJobContent';
import { toJobsTablePayload } from '@/lib/job/toJobsTablePayload';

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
          title: "IT Operations Associate – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Monitor IT operations, track incidents, and provide support to enterprise users while gaining hands-on experience in IT infrastructure.

Key Responsibilities:
• Track IT incidents and service requests
• Monitor system health, network connectivity, and endpoints
• Escalate critical issues to senior engineers
• Assist with software installations, updates, and patch management
• Maintain ITSM documentation and knowledge base articles

Required Skills:
• Familiarity with Windows/Linux/macOS
• Networking basics: TCP/IP, DHCP, VPN, LAN/WAN
• MS Office Suite and ITSM tools knowledge
• Strong problem-solving, analytical, and communication skills

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Hands-on exposure to enterprise IT operations
• Mentorship, training programs, and career progression`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 260000,
          salary_max: 330000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "TCP/IP", "DHCP", "VPN", "LAN/WAN", "ITSM", "System Monitoring"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "it-operations-associate-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["IT Operations", "Infrastructure", "Fresher", "Monitoring", "ITSM"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "End User Support Engineer – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Provide IT support to end-users, troubleshoot technical issues, and maintain high user satisfaction.

Key Responsibilities:
• Resolve hardware, software, and network problems
• Log tickets and track SLA compliance in ITSM systems
• Escalate unresolved issues to L2/L3 support
• Assist with remote support using VPN/RDP
• Maintain knowledge base and documentation

Required Skills:
• OS troubleshooting (Windows/Linux/macOS)
• Networking basics and ITSM tools
• Communication, analytical, and multitasking skills

Qualifications: Graduate in IT, CS, or Engineering.

Why Join TalentXcel?
• Enterprise exposure for freshers
• Mentorship and structured career growth`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 250000,
          salary_max: 320000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "VPN", "RDP", "ITSM", "L2 Support", "SLA Management"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "end-user-support-engineer-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["End User Support", "IT Support", "Fresher", "L2 Support", "SLA"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Application Support Analyst – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Support enterprise applications, troubleshoot software issues, and assist with application maintenance and updates.

Key Responsibilities:
• Respond to application-related queries from end-users
• Troubleshoot ERP, CRM, and productivity tools
• Log incidents and maintain ITSM records
• Escalate complex issues to senior application teams
• Assist in software updates, configurations, and deployments

Required Skills:
• MS Office Suite and ERP/CRM basics
• ITSM tools knowledge (ServiceNow, Jira)
• Communication, problem-solving, and analytical skills

Qualifications: Graduate in IT, CS, or related field.

Why Join TalentXcel?
• Exposure to enterprise applications and software support
• Structured training program and career roadmap`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 270000,
          salary_max: 340000,
          salary_currency: "INR",
          skills_required: ["MS Office", "ERP", "CRM", "ServiceNow", "Jira", "Application Support", "Software Troubleshooting"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "application-support-analyst-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Application Support", "ERP", "CRM", "Fresher", "Software Support"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Infrastructure Support Associate – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Work on IT infrastructure monitoring, troubleshooting, and support for enterprise clients.

Key Responsibilities:
• Monitor servers, endpoints, and network devices
• Troubleshoot LAN/WAN, VPN, and connectivity issues
• Escalate critical infrastructure problems to senior engineers
• Assist with system updates, patching, and configurations
• Maintain IT documentation and knowledge base

Required Skills:
• Networking fundamentals (TCP/IP, VPN, LAN/WAN)
• Windows/Linux/macOS troubleshooting
• ITSM tools and ticket management
• Strong communication and problem-solving skills

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Enterprise IT infrastructure exposure
• Mentorship and career growth opportunities`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 280000,
          salary_max: 350000,
          salary_currency: "INR",
          skills_required: ["TCP/IP", "VPN", "LAN/WAN", "Windows", "Linux", "macOS", "ITSM", "Infrastructure Support"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "infrastructure-support-associate-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Infrastructure", "IT Support", "Fresher", "Networking", "Server Monitoring"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Network Support Trainee – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Assist in enterprise network troubleshooting, monitoring, and support.

Key Responsibilities:
• Support LAN/WAN, VPN, and firewall issues
• Configure network devices under supervision
• Log tickets in ITSM tools and maintain SLA compliance
• Escalate unresolved network problems
• Maintain knowledge base documentation

Required Skills:
• Networking fundamentals and OS troubleshooting
• Familiarity with ITSM/ticketing tools
• Strong communication and analytical skills

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Hands-on networking exposure
• Structured mentorship and career roadmap`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 240000,
          salary_max: 310000,
          salary_currency: "INR",
          skills_required: ["LAN/WAN", "VPN", "Firewall", "Network Configuration", "ITSM", "OS Troubleshooting"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "network-support-trainee-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Network Support", "Trainee", "Fresher", "Networking", "Firewall"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "IT Service Executive – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Manage IT service requests, provide first-line support, and track incident resolution for enterprise users.

Key Responsibilities:
• Respond to IT service requests via phone, chat, and email
• Troubleshoot desktops, laptops, printers, and software applications
• Escalate unresolved incidents to senior support teams
• Maintain documentation and knowledge base
• Track SLA compliance and close tickets timely

Required Skills:
• OS troubleshooting (Windows/Linux/macOS)
• Networking basics, MS Office Suite, ITSM tools
• Communication, problem-solving, and multitasking

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Enterprise exposure for freshers
• Mentorship and structured career growth`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 230000,
          salary_max: 300000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "MS Office", "ITSM", "Service Management", "SLA"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "it-service-executive-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["IT Service", "Service Management", "Fresher", "SLA", "Enterprise"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Desktop Support Associate – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Provide technical support for desktops, laptops, and peripherals while learning IT operations in an enterprise environment.

Key Responsibilities:
• Troubleshoot hardware/software issues
• Assist with software installations, updates, and patching
• Escalate unresolved issues to senior engineers
• Maintain ITSM ticket logs and knowledge base

Required Skills:
• Windows/Linux/macOS troubleshooting
• Networking basics and ITSM tools
• Communication, problem-solving, and analytical skills

Qualifications: Graduate in any field; freshers encouraged.

Why Join TalentXcel?
• Hands-on enterprise IT exposure
• Mentorship and career growth opportunities`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 220000,
          salary_max: 290000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "ITSM", "Hardware Support", "Desktop Support"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "desktop-support-associate-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Desktop Support", "Hardware", "IT Support", "Fresher", "Enterprise"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "Technical Support Analyst – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Resolve IT issues for enterprise users and assist with ITSM operations.

Key Responsibilities:
• Troubleshoot hardware, software, and network issues
• Log tickets in ITSM tools and track SLA compliance
• Escalate complex issues to senior engineers
• Assist with software installations and updates
• Maintain documentation and knowledge base

Required Skills:
• OS troubleshooting (Windows/Linux/macOS)
• Networking fundamentals and ITSM tools
• Communication, analytical, and problem-solving skills

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Hands-on IT experience
• Structured onboarding and career growth opportunities`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 260000,
          salary_max: 330000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "ITSM", "Technical Analysis", "SLA Management"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "technical-support-analyst-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Technical Support", "Analysis", "Fresher", "ITSM", "SLA"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "IT Helpdesk Trainee – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Provide first-line IT support, manage tickets, and learn IT operations in enterprise environment.

Key Responsibilities:
• Respond to calls, emails, and chat requests
• Troubleshoot desktops, laptops, and software applications
• Escalate unresolved issues
• Maintain ITSM documentation and SLA compliance
• Update knowledge base for recurring issues

Required Skills:
• OS troubleshooting, networking basics, ITSM tools
• Communication, problem-solving, and analytical skills

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Enterprise IT exposure for freshers
• Structured training and career roadmap`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 210000,
          salary_max: 280000,
          salary_currency: "INR",
          skills_required: ["OS Troubleshooting", "Networking", "ITSM", "Helpdesk", "Knowledge Base"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "it-helpdesk-trainee-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["Helpdesk", "Trainee", "Fresher", "IT Support", "Training"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        },
        {
          title: "End User IT Support – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Role Overview:
Assist enterprise users in resolving IT issues and maintaining smooth operations.

Key Responsibilities:
• Troubleshoot desktops, laptops, printers, and applications
• Log incidents and track SLA compliance
• Escalate unresolved issues to senior engineers
• Maintain documentation and knowledge base

Required Skills:
• OS troubleshooting, networking basics, ITSM tools
• Communication, analytical, and multitasking skills

Qualifications: Any graduate; freshers encouraged.

Why Join TalentXcel?
• Enterprise IT exposure and mentorship
• Career growth into Service Desk, Infra, or Network roles`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 230000,
          salary_max: 300000,
          salary_currency: "INR",
          skills_required: ["OS Troubleshooting", "Networking", "ITSM", "End User Support", "SLA"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "end-user-it-support-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["End User Support", "IT Support", "Fresher", "SLA", "Enterprise"],
          benefits: ["Enterprise Exposure", "Training Programs", "Career Growth", "Mentorship"]
        }
      ];

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const job of talentxcelJobs) {
        try {
          // ── Gate 2D: Run canonical normalization pipeline ──────────
          const normResult = normalizeJobContent(job);
          const canonicalPayload = toJobsTablePayload(normResult.normalized);

          const insertPayload = {
            // Canonical base (includes employment_type normalized to kebab-case)
            ...canonicalPayload,
            // Path-3 specific fields preserved from source
            company_id: job.company_id,
            seo_slug: job.seo_slug,
            job_tags: job.job_tags,
            benefits: job.benefits,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            salary_currency: job.salary_currency,
            posted_by: job.posted_by,
            expires_at: job.expires_at,
            job_status: job.job_status,
            is_remote: job.is_remote,
          };

          const { error } = await supabase
            .from('jobs')
            .insert([insertPayload]);


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
              {isDirectUploading ? 'Posting...' : 'Post TalentXcel IT Jobs (13 positions)'}
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