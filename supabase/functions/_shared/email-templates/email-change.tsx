/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ email, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your InstantAppraisal email change</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://instantappraisal.co/logo-black.png" width="140" alt="InstantAppraisal" style={logoImg} />
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>
          You requested to change your <strong>InstantAppraisal</strong> email from{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          to <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Button style={button} href={confirmationUrl}>Confirm Email Change →</Button>
        <Text style={footer}>If you didn't request this change, please secure your account immediately.</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { maxWidth: '480px', margin: '0 auto', padding: '32px 24px' }
const logoImg = { display: 'block', marginBottom: '32px', maxWidth: '140px', height: 'auto' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px' }
const link = { color: '#10b981', textDecoration: 'none' }
const button = { display: 'inline-block', backgroundColor: '#10b981', color: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '6px', padding: '12px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', marginTop: '32px' }
