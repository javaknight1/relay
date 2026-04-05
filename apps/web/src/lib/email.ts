import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Relay <noreply@relay.club>";
const DASHBOARD_URL = "https://relay.club/dashboard";

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relay</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
              <span style="font-size:20px;font-weight:700;color:#18181b;letter-spacing:-0.02em;">Relay</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;background-color:#fafafa;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                Relay &mdash; Managed MCP server hosting.<br />
                <a href="https://relay.club" style="color:#71717a;text-decoration:underline;">relay.club</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#18181b;border-radius:6px;">
      <a href="${href}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

export async function sendWelcomeEmail(to: string, name: string) {
  const greeting = name ? `Hi ${name},` : "Hi there,";

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to Relay",
    html: emailLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">${greeting}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Welcome to Relay! We're excited to have you on board.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Relay makes it easy to deploy and manage MCP servers with just a few clicks.
        Connect your favorite tools, configure credentials, and start serving in minutes.
      </p>
      <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Head to your dashboard to get started:
      </p>
      ${ctaButton("Go to Dashboard", DASHBOARD_URL)}
      <p style="margin:0;font-size:14px;color:#71717a;line-height:1.5;">
        If you have any questions, just reply to this email &mdash; we're happy to help.
      </p>
    `),
  });
}

export async function sendCredentialExpiryWarning(
  to: string,
  serverName: string,
  daysRemaining: number,
  expiresAt: string,
) {
  const urgency = daysRemaining <= 1 ? "urgent" : "upcoming";
  const expiresDate = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your ${serverName} credentials expire in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`,
    html: emailLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">Credential Expiry Warning</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        This is an ${urgency} reminder that the credentials for your MCP server
        <strong>${serverName}</strong> will expire on <strong>${expiresDate}</strong>.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        ${daysRemaining <= 0 ? "Your credentials have expired. Please renew them immediately to avoid service disruption." : `You have <strong>${daysRemaining} day${daysRemaining === 1 ? "" : "s"}</strong> remaining to renew your credentials before your server is affected.`}
      </p>
      ${ctaButton("Renew Credentials", DASHBOARD_URL)}
      <p style="margin:0;font-size:14px;color:#71717a;line-height:1.5;">
        If you've already updated your credentials, you can safely ignore this email.
      </p>
    `),
  });
}

export async function sendPaymentReceiptEmail(
  to: string,
  amount: string,
  serverCount: number,
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Relay payment receipt",
    html: emailLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">Payment Receipt</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Thank you for your payment. Here's your receipt:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="padding:12px 16px;background-color:#fafafa;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Amount</td>
          <td style="padding:12px 16px;background-color:#fafafa;font-size:15px;font-weight:600;color:#18181b;text-align:right;">${amount}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #e4e4e7;">Servers</td>
          <td style="padding:12px 16px;font-size:15px;color:#3f3f46;text-align:right;border-top:1px solid #e4e4e7;">${serverCount} active server${serverCount === 1 ? "" : "s"}</td>
        </tr>
      </table>
      ${ctaButton("View Dashboard", DASHBOARD_URL)}
      <p style="margin:0;font-size:14px;color:#71717a;line-height:1.5;">
        If you have billing questions, reply to this email and we'll be happy to help.
      </p>
    `),
  });
}

export async function sendServerErrorAlert(
  to: string,
  serverName: string,
  errorMessage: string,
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Server error: ${serverName}`,
    html: emailLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#dc2626;">Server Error Alert</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        We detected an error with your MCP server <strong>${serverName}</strong>:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="padding:16px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:6px;font-size:14px;font-family:monospace;color:#991b1b;line-height:1.5;word-break:break-all;">
            ${errorMessage}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Please check your server configuration and credentials to resolve the issue.
      </p>
      ${ctaButton("View Server Details", DASHBOARD_URL)}
    `),
  });
}
