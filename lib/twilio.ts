import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID ?? 'AC_placeholder',
  process.env.TWILIO_AUTH_TOKEN ?? 'placeholder'
)

export async function sendSMS(to: string, body: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'AC_placeholder') {
    console.log(`[SMS Mock] To: ${to}, Body: ${body}`)
    return { sid: 'mock_sid' }
  }
  return client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body,
  })
}
