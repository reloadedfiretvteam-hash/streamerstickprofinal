import { Resend } from 'resend';

export async function getUncachableResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }

  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail
  };
}
