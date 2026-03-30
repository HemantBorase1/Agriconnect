import { NextResponse } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

function getApiKey() {
  return (
    process.env.OPENROUTER_API_KEY ||
    process.env.CHATGPT_API_KEY ||
    process.env.OPENAI_API_KEY ||
    null
  )
}

/** OpenRouter model id, e.g. openai/gpt-4o-mini, anthropic/claude-3.5-sonnet */
function getModel() {
  return (
    process.env.OPENROUTER_MODEL ||
    process.env.OPENAI_CHAT_MODEL ||
    'openai/gpt-4o-mini'
  )
}

function getOpenRouterExtraHeaders() {
  const headers = {}
  const referer =
    process.env.OPENROUTER_HTTP_REFERER ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  if (referer) {
    headers['HTTP-Referer'] = referer
  }
  const title = process.env.OPENROUTER_APP_NAME || 'AgriConnect'
  headers['X-OpenRouter-Title'] = title
  return headers
}

const SYSTEM_PROMPT = `You are the AI Farming Assistant for AgriConnect, an agricultural platform. Help farmers and users with practical, accurate advice about crops, soil, irrigation, pests, organic farming, weather-related farming decisions, and general agriculture. Keep answers concise unless the user asks for detail. If a question is not farming-related, answer briefly and politely steer back to agriculture when appropriate.`

function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null
  }
  const out = []
  for (const m of raw) {
    if (!m || typeof m !== 'object') continue
    const role = m.role
    const content = m.content
    if (role !== 'user' && role !== 'assistant' && role !== 'system') continue
    if (typeof content !== 'string' || content.trim().length === 0) continue
    const trimmed = content.length > 12000 ? content.slice(0, 12000) : content
    out.push({ role, content: trimmed })
  }
  if (out.length === 0) return null
  const maxMessages = 30
  return out.length > maxMessages ? out.slice(-maxMessages) : out
}

function extractErrorMessage(data, status) {
  if (!data || typeof data !== 'object') {
    return `OpenRouter request failed with status ${status}`
  }
  const choiceErr = data?.choices?.[0]?.error
  if (choiceErr && typeof choiceErr.message === 'string') {
    return choiceErr.message
  }
  const err = data.error
  if (typeof err === 'string') return err
  if (err && typeof err.message === 'string') return err.message
  if (typeof data.message === 'string') return data.message
  return `OpenRouter request failed with status ${status}`
}

export async function POST(request) {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Missing OPENROUTER_API_KEY (or CHATGPT_API_KEY / OPENAI_API_KEY) in environment variables',
        },
        { status: 500 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const clientMessages = sanitizeMessages(body?.messages)
    if (!clientMessages) {
      return NextResponse.json(
        { error: 'Provide a non-empty "messages" array with { role, content }' },
        { status: 400 }
      )
    }

    const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...clientMessages]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...getOpenRouterExtraHeaders(),
        },
        body: JSON.stringify({
          model: getModel(),
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = extractErrorMessage(data, res.status)
        return NextResponse.json(
          { error: msg },
          {
            status:
              res.status >= 400 && res.status < 600 ? res.status : 502,
          }
        )
      }

      const choice0 = data?.choices?.[0]
      if (choice0?.error?.message) {
        return NextResponse.json({ error: choice0.error.message }, { status: 502 })
      }
      const reply = choice0?.message?.content
      if (typeof reply !== 'string' || reply.length === 0) {
        return NextResponse.json({ error: 'Empty response from model' }, { status: 502 })
      }

      return NextResponse.json(
        { reply: reply.trim() },
        { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
      )
    } finally {
      clearTimeout(timeout)
    }
  } catch (err) {
    const message = err?.name === 'AbortError' ? 'Request timed out' : err?.message || 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
