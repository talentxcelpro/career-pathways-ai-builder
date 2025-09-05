import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface JobRecommendationEmailProps {
  candidate_name: string
  job_title?: string
  company_name?: string
  location?: string
  experience_level?: string
  salary_range?: string
  job_id?: string
}

export const JobRecommendationEmail = ({
  candidate_name = "User",
  job_title = "Software Developer",
  company_name = "TechCorp",
  location = "Remote",
  experience_level = "Mid-level",
  salary_range = "Competitive",
  job_id = "1"
}: JobRecommendationEmailProps) => {
  
  return (
    <Html>
      <Head />
      <Preview>Perfect job match found: {job_title} at {company_name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://talentxcel.in/icon-192.png"
              width="64"
              height="64"
              alt="TalentXcel"
              style={logo}
            />
            <Heading style={h1}>Perfect Match Found! 🎯</Heading>
            <Text style={subheader}>We found a job that matches your profile</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {candidate_name},</Text>
            
            <Text style={text}>
              Great news! We've found a job opportunity that perfectly matches your skills and career goals.
            </Text>

            <Section style={jobCard}>
              <Heading style={jobTitle}>{job_title}</Heading>
              <Text style={companyName}>{company_name}</Text>
              
              <Section style={jobDetails}>
                <div style={detailRow}>
                  <Text style={detailLabel}>📍 Location:</Text>
                  <Text style={detailValue}>{location}</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>💼 Experience:</Text>
                  <Text style={detailValue}>{experience_level}</Text>
                </div>
                <div style={detailRow}>
                  <Text style={detailLabel}>💰 Salary:</Text>
                  <Text style={detailValue}>{salary_range}</Text>
                </div>
              </Section>

              <Section style={matchIndicator}>
                <Text style={matchText}>🎯 <strong>95% Match</strong> with your profile</Text>
              </Section>
            </Section>

            <Section style={ctaSection}>
              <Button
                href={`https://talentxcel.in/jobs/${job_id}?utm_source=email&utm_medium=job_recommendation&utm_campaign=job_match`}
                style={ctaButton}
              >
                View Job Details
              </Button>
              <Button
                href={`https://talentxcel.in/jobs/${job_id}/apply?utm_source=email&utm_medium=job_recommendation&utm_campaign=job_match`}
                style={secondaryButton}
              >
                Apply Now
              </Button>
            </Section>

            <Section style={whyMatchSection}>
              <Heading style={h3}>Why this job matches you:</Heading>
              <ul style={matchReasons}>
                <li style={matchReason}>✅ Skills alignment with your expertise</li>
                <li style={matchReason}>✅ Experience level matches your background</li>
                <li style={matchReason}>✅ Location preference matches</li>
                <li style={matchReason}>✅ Salary expectations aligned</li>
              </ul>
            </Section>

            <Section style={moreJobsSection}>
              <Text style={moreJobsText}>
                Want to see more opportunities?{' '}
                <Link href="https://talentxcel.in/jobs" style={link}>
                  Browse all jobs
                </Link>
              </Text>
            </Section>

            <Text style={helpText}>
              Questions about this opportunity? Reply to this email or contact us at{' '}
              <Link href="mailto:support@talentxcel.in" style={link}>
                support@talentxcel.in
              </Link>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Happy job hunting!<br />
              The TalentXcel Team
            </Text>
            <Text style={footerLinks}>
              <Link href="https://talentxcel.in" style={footerLink}>talentxcel.in</Link> | 
              <Link href="https://talentxcel.in/jobs" style={footerLink}>Browse Jobs</Link> | 
              <Link href="https://talentxcel.in/profile" style={footerLink}>Profile</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const header = {
  backgroundColor: '#06b6d4',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto 16px',
  borderRadius: '12px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  lineHeight: '1.2',
}

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px',
}

const subheader = {
  color: '#e0f7fa',
  fontSize: '16px',
  margin: '0',
  fontWeight: '400',
}

const content = {
  padding: '32px',
}

const greeting = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
}

const jobCard = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '2px solid #06b6d4',
}

const jobTitle = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const companyName = {
  color: '#06b6d4',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const jobDetails = {
  margin: '16px 0',
}

const detailRow = {
  display: 'flex',
  alignItems: 'center',
  margin: '8px 0',
}

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 8px 0 0',
  minWidth: '100px',
}

const detailValue = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
}

const matchIndicator = {
  backgroundColor: '#ecfdf5',
  padding: '12px',
  borderRadius: '6px',
  textAlign: 'center' as const,
  margin: '16px 0 0',
}

const matchText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#06b6d4',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '0 8px 16px',
}

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#06b6d4',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '0 8px 16px',
  border: '2px solid #06b6d4',
}

const whyMatchSection = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
}

const matchReasons = {
  padding: '0',
  margin: '0',
  listStyle: 'none',
}

const matchReason = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  padding: '0',
}

const moreJobsSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
}

const moreJobsText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#06b6d4',
  textDecoration: 'none',
}

const footer = {
  backgroundColor: '#f8fafc',
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 16px',
}

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#06b6d4',
  textDecoration: 'none',
  margin: '0 8px',
}

export default JobRecommendationEmail