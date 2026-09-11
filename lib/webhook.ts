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
    const currentDateTime = findValue('TsplCurrentDateTimeField', /timestamp|date\s*time/i);
    const rangeValue = findValue('TsplRangeDropdownField', /range|year/i);
    const consent = findValue('TsplConsentField', /consent|declaration|agree/i);

    // Build the clean JSON payload specifically highlighting the requested TSPL elements
    const tsplPayload = {
      formName,
      formUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://forms.tsplgroup.in'}/form/${formUrl}`,
      submissionId,
      submittedAt: new Date().toISOString(),
      elements: {
        fullName: fullName || null,
        email: email || null,
        phoneNumber: phoneNumber || null,
        dateOfBirth: dateOfBirth || null,
        education: education || null,
        ...(currentDateTime && { currentDateTime }),
        ...(rangeValue && { rangeValue }),
        ...(consent && { consent }),
      },
    };

    // Construct Discord webhook payload with both raw JSON codeblock and rich Embed
    const discordPayload = {
      username: 'TSPL Forms Webhook',
      avatar_url: 'https://forms.tsplgroup.in/tspl-icon-mark.png',
      content: `### 📋 **New TSPL Form Submission**\n**Form:** ${formName}\n**Submission ID:** #${submissionId}\n\n\`\`\`json\n${JSON.stringify(tsplPayload.elements, null, 2)}\n\`\`\``,
      embeds: [
        {
          title: `📋 ${formName}`,
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://forms.tsplgroup.in'}/form/${formUrl}`,
          color: 16418826, // TSPL Vibrant Orange (#FA5F0A)
          description: 'A new submission containing TSPL elements has been recorded.',
          fields: [
            {
              name: '👤 Full Name',
              value: fullName || '*Not provided*',
              inline: true,
            },
            {
              name: '✉️ Email ID',
              value: email || '*Not provided*',
              inline: true,
            },
            {
              name: '📱 Phone Number',
              value: phoneNumber ? (phoneNumber.startsWith('+91') ? phoneNumber : `+91 ${phoneNumber}`) : '*Not provided*',
              inline: true,
            },
            {
              name: '🎂 Date of Birth / Age',
              value: dateOfBirth || '*Not provided*',
              inline: true,
            },
            {
              name: '🎓 Education',
              value: education || '*Not provided*',
              inline: true,
            },
            ...(rangeValue
              ? [
                  {
                    name: '📊 Range Value',
                    value: rangeValue,
                    inline: true,
                  },
                ]
              : []),
            ...(consent
              ? [
                  {
                    name: '🛡️ Consent / Declaration',
                    value: consent,
                    inline: true,
                  },
                ]
              : []),
          ],
          footer: {
            text: `TSPL Forms & Workflow Platform • ID #${submissionId}`,
            icon_url: 'https://forms.tsplgroup.in/tspl-icon-mark.png',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
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
