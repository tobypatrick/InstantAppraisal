import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const { propertyReport, agentName, agencyName, suburb } = await request.json()

    if (!propertyReport) {
      return new Response(JSON.stringify({ error: 'propertyReport is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = `You are an expert real estate copywriter specialising in Australian property appraisals.
Write in a professional yet approachable tone. Be specific about the property's features and local market context.
Keep the appraisal concise (300-400 words) and focused on helping the homeowner understand their property's value.`

    const userPrompt = `Write a professional property appraisal narrative for the following property${suburb ? ` in ${suburb}` : ''}.
${agentName ? `The appraisal is being prepared by ${agentName}${agencyName ? ` from ${agencyName}` : ''}.` : ''}

Property data from PropTrack:
${JSON.stringify(propertyReport, null, 2)}

Write a compelling appraisal that:
1. Opens with the property's key strengths
2. Discusses the estimated value range and what drives it
3. Highlights comparable sales and market conditions
4. Closes with a professional recommendation

Write the appraisal narrative only — no headings, no bullet points, just flowing paragraphs.`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('appraise error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
