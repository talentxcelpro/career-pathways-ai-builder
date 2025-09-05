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

interface WelcomeEmailProps {
  candidate_name: string
  first_name?: string
}

export const WelcomeEmail = ({
  candidate_name = "User",
  first_name,
}: WelcomeEmailProps) => {
  const displayName = first_name || candidate_name || "User";
  
  return (
    <Html>
      <Head />
      <Preview>Welcome to TalentXcel - Your career journey starts here!</Preview>
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
            <Heading style={h1}>Welcome to TalentXcel!</Heading>
            <Text style={subheader}>Your career journey starts here 🚀</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {displayName},</Text>
            
            <Text style={text}>
              Welcome to TalentXcel! We're thrilled to have you join our community of ambitious professionals who are transforming their careers.
            </Text>

            <Section style={featuresSection}>
              <Heading style={h2}>What's waiting for you:</Heading>
              <ul style={featuresList}>
                <li style={featureItem}>🎯 <strong>Smart Job Matching:</strong> Get personalized job recommendations</li>
                <li style={featureItem}>📄 <strong>AI Resume Builder:</strong> Create compelling resumes in minutes</li>
                <li style={featureItem}>🤝 <strong>Professional Network:</strong> Connect with industry leaders</li>
                <li style={featureItem}>📚 <strong>Skill Development:</strong> Access courses and learning paths</li>
                <li style={featureItem}>💼 <strong>Career Tools:</strong> Portfolio builder, interview prep & more</li>
              </ul>
            </Section>

            <Section style={ctaSection}>
              <Button
                href="https://talentxcel.in/profile?utm_source=email&utm_medium=welcome&utm_campaign=onboarding"
                style={ctaButton}
              >
                Complete Your Profile
              </Button>
              <Text style={ctaText}>
                Complete your profile to unlock all features and get better job matches
              </Text>
            </Section>

            <Section style={quickLinksSection}>
              <Text style={quickLinksTitle}>Quick Links:</Text>
              <Text style={quickLinks}>
                <Link href="https://talentxcel.in/jobs" style={quickLink}>Browse Jobs</Link> | 
                <Link href="https://talentxcel.in/resume" style={quickLink}>Build Resume</Link> | 
                <Link href="https://talentxcel.in/network" style={quickLink}>Network</Link> | 
                <Link href="https://talentxcel.in/learning" style={quickLink}>Learning</Link>
              </Text>
            </Section>

            <Text style={helpText}>
              Questions? Reply to this email or contact us at{' '}
              <Link href="mailto:support@talentxcel.in" style={link}>
                support@talentxcel.in
              </Link>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Best regards,<br />
              The TalentXcel Team
            </Text>
            <Text style={footerLinks}>
              <Link href="https://talentxcel.in" style={footerLink}>talentxcel.in</Link> | 
              <Link href="https://talentxcel.in/privacy" style={footerLink}>Privacy</Link> | 
              <Link href="https://talentxcel.in/terms" style={footerLink}>Terms</Link>
            </Text>
            <Text style={copyright}>
              © 2025 TalentXcel Services. All rights reserved.
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
  backgroundColor: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  padding: '40px 32px',
  textAlign: 'center' as const,
  background: '#1e40af',
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

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  margin: '24px 0 16px',
}

const subheader = {
  color: '#e0e7ff',
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

const featuresSection = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
}

const featuresList = {
  padding: '0',
  margin: '0',
  listStyle: 'none',
}

const featureItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
  padding: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '0 0 16px',
}

const ctaText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}

const quickLinksSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
}

const quickLinksTitle = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const quickLinks = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}

const quickLink = {
  color: '#1e40af',
  textDecoration: 'none',
  margin: '0 8px',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#1e40af',
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
  color: '#1e40af',
  textDecoration: 'none',
  margin: '0 8px',
}

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}

export default WelcomeEmail