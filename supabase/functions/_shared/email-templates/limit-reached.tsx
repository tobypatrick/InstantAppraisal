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

interface LimitReachedEmailProps {
  agentName: string
  currentUsage: number
  limit: number
  tier: string
  upgradeUrl: string
}

export const LimitReachedEmail = ({ agentName, currentUsage, limit, tier, upgradeUrl }: LimitReachedEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've reached your monthly report limit on InstantAppraisal</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://instantappraisal.co/logo-black.png" width="140" alt="InstantAppraisal" style={logoImg} />
        <Heading style={h1}>Monthly report limit reached</Heading>
        <Text style={text}>
          Hi {agentName},
        </Text>
        <Text style={text}>
          You've used all <strong>{limit} reports</strong> included in your <strong>{tier}</strong> plan this month ({currentUsage}/{limit} used).
          New leads visiting your page won't be able to receive a report until your limit resets at the start of next month.
        </Text>
        <Text style={text}>
          Upgrade your plan now to unlock more reports and keep generating leads without interruption.
        </Text>
        <Button style={button} href={upgradeUrl}>Upgrade My Plan →</Button>
        <Text style={footer}>
          Your limit resets automatically on the 1st of each month. Questions? Reply to this email or contact support@instantappraisal.co
        </Text>
      </Container>
    </Body>
  </Html>
)

export default LimitReachedEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { maxWidth: '480px', margin: '0 auto', padding: '32px 24px' }
const logoImg = { display: 'block', marginBottom: '32px', maxWidth: '140px', height: 'auto' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px' }
const button = { display: 'inline-block', backgroundColor: '#10b981', color: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '6px', padding: '12px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', marginTop: '32px' }
