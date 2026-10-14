import { Resend } from 'resend'

let _client: Resend | null = null

export function getResend(): Resend {
  if (!_client) {
    const config = useRuntimeConfig()
    if (!config.resendApiKey) {
      throw new Error('RESEND_API_KEY must be set')
    }
    _client = new Resend(config.resendApiKey)
  }
  return _client
}

// Anything a visitor typed (a lead's name, a message) ends up inside email
// HTML; escaped so it renders as text instead of markup or links.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Resend sends "from" the verified mikahomes.com address (needed for SPF/DKIM
// to pass), but replies should land in the team's actual inbox — set via
// reply-to rather than "from" since that inbox lives on a domain Resend can't
// verify.
export function getMailFrom(): { from: string; replyTo?: string } {
  const config = useRuntimeConfig()
  return {
    from: config.emailFrom,
    ...(config.emailReplyTo ? { replyTo: config.emailReplyTo } : {}),
  }
}
