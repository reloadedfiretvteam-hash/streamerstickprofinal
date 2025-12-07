import { Resend } from 'resend';

let connectionSettings: any;

function isReplitEnvironment(): boolean {
  return !!(process.env.REPLIT_CONNECTORS_HOSTNAME && 
    (process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL));
}

async function getReplitCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    console.error('Resend: X_REPLIT_TOKEN not found for repl/depl');
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const url = 'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend';
  console.log('Resend: Fetching credentials from', url);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });
  
  const data = await response.json();
  console.log('Resend: Response status', response.status, 'items:', data.items?.length || 0);
  
  connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings?.api_key)) {
    console.error('Resend: No valid connection settings found. Response:', JSON.stringify(data));
    throw new Error('Resend not connected - check integration setup');
  }
  
  let fromEmail = connectionSettings.settings.from_email;
  
  if (fromEmail && fromEmail.includes('@gmail.com')) {
    console.warn('Resend: Gmail addresses cannot be used as sender. Using Resend test domain instead.');
    fromEmail = 'StreamStickPro <onboarding@resend.dev>';
  }
  
  console.log('Resend: Successfully retrieved credentials, from_email:', fromEmail);
  
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: fromEmail
  };
}

function getEnvCredentials() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  
  return { apiKey, fromEmail };
}

async function getCredentials() {
  if (isReplitEnvironment()) {
    return getReplitCredentials();
  }
  return getEnvCredentials();
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@streamstickpro.com'
  };
}
