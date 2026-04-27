/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  siteName: string
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your InstantAppraisal verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://instantappraisal.co/logo-black.png" width="140" alt="InstantAppraisal" style={logoImg} />
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>This code expires shortly. If you didn't request this, you can safely ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { maxWidth: '480px', margin: '0 auto', padding: '32px 24px' }
const logoImg = { display: 'block', marginBottom: '32px', maxWidth: '140px', height: 'auto' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#0f172a', letterSpacing: '4px', margin: '0 0 24px' }
const footer = { fontSize: '12px', color: '#94a3b8', marginTop: '32px' }
