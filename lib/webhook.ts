import { FormElementInstance } from '@/app/(dashboard)/_components/FormElements';

export type SendWebhookParams = {
  formName: string;
  formUrl: string;
  submissionId: number;
  formContent: string;
  submissionContent: string;
};

/**
 * Sends a webhook notification with TSPL custom elements (Name, Email, Phone, DOB, Education)
 * in JSON format to the Discord webhook configured in .env (DISCORD_WEBHOOK_URL).
 * The URL is stored securely in .env and never hardcoded.
 */
export async function sendTsplWebhookNotification({
  formName,
  formUrl,
  submissionId,
  formContent,
  submissionContent,
}: SendWebhookParams): Promise<{ sent: boolean; reason?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return { sent: false, reason: 'DISCORD_WEBHOOK_URL is not configured in .env' };
  }

  try {
    let schema: FormElementInstance[] = [];
    try {
      schema = JSON.parse(formContent || '[]');
    } catch {
      schema = [];
    }

    let values: Record<string, any> = {};
    try {
      values = JSON.parse(submissionContent || '{}');
    } catch {
      values = {};
    }

    // Helper to find field value by type or matching label
    const findValue = (
      preferredType: string,
      labelMatcher?: RegExp,
      fallbackType?: string
    ): string | null => {
      // 1. Check exact TSPL element type
      const exactEl = schema.find((el) => el.type === preferredType);
      if (exactEl && values[exactEl.id] !== undefined && values[exactEl.id] !== null) {
        return String(values[exactEl.id]).trim();
      }

      // 2. Check fallback type if provided
      if (fallbackType) {
        const fallbackEl = schema.find((el) => el.type === fallbackType);
        if (fallbackEl && values[fallbackEl.id] !== undefined && values[fallbackEl.id] !== null) {
          return String(values[fallbackEl.id]).trim();
        }
      }

      // 3. Check label pattern if provided
      if (labelMatcher) {
        const labelEl = schema.find((el) => {
          const lbl = (el.extraAttributes?.label || el.extraAttributes?.title || '').toLowerCase();
          return labelMatcher.test(lbl);
        });
        if (labelEl && values[labelEl.id] !== undefined && values[labelEl.id] !== null) {
          return String(values[labelEl.id]).trim();
        }
      }

      return null;
    };

    const fullName = findValue('TsplFullNameField', /name|full\s*name/i, 'TextField');
    const email = findValue('TsplEmailField', /email/i, 'EmailField');
    const phoneNumber = findValue('TsplMobileField', /mobile|phone|contact/i, 'PhoneField');
    const dateOfBirth = findValue('TsplDobAgeField', /dob|birth/i, 'DateField');
    const education = findValue('TsplEducationField', /education|qualification|degree/i, 'SelectField');

    // Build the direct JSON payload containing strictly the 5 requested fields
    const tsplPayload = {
      name: fullName || '',
      email: email || '',
      phone: phoneNumber || '',
      dateOfBirth: dateOfBirth || '',
      education: education || '',
    };

    const jsonString = JSON.stringify(tsplPayload, null, 2);
    const isDiscord = webhookUrl.includes('discord.com');

    // Discord requires { content: string } to send a message without embeds.
    // Non-Discord endpoints receive the raw JSON body directly.
    const requestBody = isDiscord
      ? JSON.stringify({
          content: `\`\`\`json\n${jsonString}\n\`\`\``,
        })
      : jsonString;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TSPL Webhook] Discord returned status ${response.status}:`, errorText);
      return { sent: false, reason: `Discord error ${response.status}` };
    }

    return { sent: true };
  } catch (error: any) {
    console.error('[TSPL Webhook] Failed to send webhook:', error);
    return { sent: false, reason: error?.message || 'Network error' };
  }
}
