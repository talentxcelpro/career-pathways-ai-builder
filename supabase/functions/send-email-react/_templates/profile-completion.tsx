import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ProfileCompletionEmailProps {
  candidate_name: string
}

export const ProfileCompletionEmail = ({
  candidate_name = "Test User",
}: ProfileCompletionEmailProps) => (
  <Html>
    <Head />
    <Preview>Complete Your TalentXcel Profile to Unlock All Features</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Link href="https://talentxcel.in" style={logo}>
            Talent<span style={logoAccent}>Xcel</span>
          </Link>
          <Heading style={h1}>Complete Your Profile</Heading>
          <Text style={subheader}>Unlock better job opportunities</Text>
        </Section>
        
        <Section style={body}>
          <Text style={text}>Hi {candidate_name},</Text>
          <Text style={text}>
            Your profile is almost ready! Complete it now to get better job matches and stand out to employers.
          </Text>
          
          <Text style={textBold}>Why complete your profile?</Text>
          <ul style={list}>
            <li style={listItem}>✅ Get 3x more job matches</li>
            <li style={listItem}>✅ Increase visibility to recruiters</li>
            <li style={listItem}>✅ Access exclusive opportunities</li>
            <li style={listItem}>✅ Show your professional skills</li>
          </ul>
          
          <Section style={cta}>
            <Button href="https://talentxcel.in" style={button}>
              ✨ Complete My Profile
            </Button>
          </Section>
          
          <Text style={disclaimer}>
            This email was sent automatically by TalentXcel. Please do not reply.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            © 2025 TalentXcel Services | <Link href="https://talentxcel.in" style={footerLink}>talentxcel.in</Link>
          </Text>
          <Text style={footerLinks}>
            <Link href="https://talentxcel.in/network" style={footerLink}>Network</Link> • 
            <Link href="https://talentxcel.in/jobs" style={footerLink}>Jobs</Link> • 
            <Link href="https://talentxcel.in/employer" style={footerLink}>Employer</Link> • 
            <Link href="https://talentxcel.in/companies" style={footerLink}>Companies</Link> • 
            <Link href="https://talentxcel.in/resume" style={footerLink}>Resume Builder</Link> • 
            <Link href="https://talentxcel.in/tools" style={footerLink}>Tools</Link> • 
            <Link href="https://talentxcel.in/services" style={footerLink}>Services</Link> • 
            <Link href="https://talentxcel.in/learning" style={footerLink}>Learning</Link> • 
            <Link href="https://talentxcel.in/colleges" style={footerLink}>Colleges</Link> • 
            <Link href="https://talentxcel.in/career-map" style={footerLink}>Career Map</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ProfileCompletionEmail

const main = {
  backgroundColor: '#f3f4f6',
  fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
}

const header = {
  background: 'linear-gradient(to right, #1e3a8a, #2563eb)',
  padding: '24px',
  textAlign: 'center' as const,
  color: '#ffffff',
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  textDecoration: 'none',
  color: '#ffffff',
  display: 'block',
}

const logoAccent = {
  color: '#facc15',
}

const h1 = {
  margin: '10px 0',
  color: '#ffffff',
  fontSize: '28px',
}

const subheader = {
  fontSize: '14px',
  marginTop: '6px',
  color: '#e0e7ff',
}

const body = {
  padding: '32px 24px',
}

const text = {
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: '16px',
  color: '#1a1a1a',
}

const textBold = {
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
}

const list = {
  paddingLeft: '20px',
  marginBottom: '24px',
}

const listItem = {
  marginBottom: '10px',
  fontSize: '15px',
  color: '#1a1a1a',
}

const cta = {
  textAlign: 'center' as const,
  marginTop: '20px',
}

const button = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '14px 28px',
  fontWeight: 'bold',
  borderRadius: '6px',
  display: 'inline-block',
}

const disclaimer = {
  fontSize: '13px',
  color: '#6b7280',
  textAlign: 'center' as const,
  marginTop: '40px',
}

const footer = {
  padding: '20px',
  backgroundColor: '#f1f5f9',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
}

const footerLinks = {
  fontSize: '12px',
  color: '#6b7280',
  marginTop: '10px',
}

const footerLink = {
  color: '#2563eb',
  textDecoration: 'none',
  margin: '0 6px',
}