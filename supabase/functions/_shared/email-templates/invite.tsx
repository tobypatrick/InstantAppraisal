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
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join InstantAppraisal</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://instantappraisal.co/logo-black.png" width="140" alt="InstantAppraisal" style={logoImg} />
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join <strong>InstantAppraisal</strong>. Click the button below to accept and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>Accept Invitation →</Button>
        <Text style={footer}>If you weren't expecting this invitation, you can safely ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { maxWidth: '480px', margin: '0 auto', padding: '32px 24px' }
const logoImg = { display: 'block', marginBottom: '32px', maxWidth: '140px', height: 'auto' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px' }
const button = { display: 'inline-block', backgroundColor: '#10b981', color: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '6px', padding: '12px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', marginTop: '32px' }
