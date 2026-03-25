import Groq from 'groq-sdk'

let _client: Groq | null = null

export function getGroqClient(): Groq {
  if (_client) return _client

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable.')
  }

  _client = new Groq({ apiKey })
  return _client
}
