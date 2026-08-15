import { createServerFn } from "@tanstack/react-start";

/**
 * Server-Side Dispatch Function for Resend Emails (Bypasses Browser CORS)
 */
export const serverDispatchEmail = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { to: string; subject: string; html: string; apiKey?: string; fromEmail?: string } }) => {
    const activeApiKey =
      data.apiKey ||
      (typeof process !== "undefined" ? process.env?.RESEND_API_KEY || process.env?.VITE_RESEND_API_KEY : undefined) ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_RESEND_API_KEY as string) || (import.meta.env.RESEND_API_KEY as string)
        : "");

    const activeFromEmail =
      data.fromEmail ||
      (typeof process !== "undefined" ? process.env?.VITE_RESEND_FROM_EMAIL : undefined) ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_RESEND_FROM_EMAIL as string)
        : "") ||
      "onboarding@resend.dev";

    if (!activeApiKey) {
      return {
        success: false,
        error: "Missing Resend API Key in server environment (RESEND_API_KEY).",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: activeFromEmail,
          to: [data.to],
          subject: data.subject,
          html: data.html,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: resData.message || `Resend error (${response.status})`,
        };
      }

      return {
        success: true,
        messageId: resData.id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to connect to Resend API.",
      };
    }
  });

/**
 * Server-Side Dispatch Function for Twilio WhatsApp (Bypasses Browser CORS & Handles Auth)
 */
export const serverDispatchWhatsAppTwilio = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { toPhone: string; messageText: string; accountSid?: string; authToken?: string; fromNumber?: string } }) => {
    const activeAccountSid =
      data.accountSid ||
      (typeof process !== "undefined" ? process.env?.TWILIO_ACCOUNT_SID || process.env?.VITE_TWILIO_ACCOUNT_SID : undefined) ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_TWILIO_ACCOUNT_SID as string) || (import.meta.env.TWILIO_ACCOUNT_SID as string)
        : "") ||
      "";

    const activeAuthToken =
      data.authToken ||
      (typeof process !== "undefined" ? process.env?.TWILIO_AUTH_TOKEN || process.env?.VITE_TWILIO_AUTH_TOKEN : undefined) ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_TWILIO_AUTH_TOKEN as string) || (import.meta.env.TWILIO_AUTH_TOKEN as string)
        : "") ||
      "";

    const activeFromNumber =
      data.fromNumber ||
      (typeof process !== "undefined" ? process.env?.VITE_TWILIO_FROM_NUMBER : undefined) ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_TWILIO_FROM_NUMBER as string)
        : "") ||
      "+14155238886";

    if (!activeAccountSid || !activeAuthToken) {
      return {
        success: false,
        error: !activeAccountSid
          ? "Missing Twilio Account SID (AC...). Please configure TWILIO_ACCOUNT_SID."
          : "Missing Twilio Auth Token. Please configure TWILIO_AUTH_TOKEN.",
      };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${activeAccountSid}/Messages.json`;
      const basicAuth = btoa(`${activeAccountSid}:${activeAuthToken}`);

      const bodyParams = new URLSearchParams();
      bodyParams.append("From", `whatsapp:${activeFromNumber}`);
      bodyParams.append("To", `whatsapp:+${data.toPhone}`);
      bodyParams.append("Body", data.messageText);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });

      const resData = await response.json();
      if (!response.ok) {
        let errorMsg = resData.message || `Twilio Error (${response.status})`;
        if (response.status === 401 || resData.code === 20003 || errorMsg.includes("Authenticate")) {
          errorMsg =
            "Twilio Authentication Failed (401 Authenticate). Please ensure your primary Auth Token is set in Vercel Environment Variables.";
        } else if (resData.code === 63015 || resData.code === 21608 || resData.code === 21654) {
          errorMsg = `WhatsApp Sandbox Requirement: Send your Twilio join phrase (e.g. 'join <keyword>') to ${activeFromNumber} on WhatsApp from your phone first.`;
        }

        return {
          success: false,
          error: errorMsg,
          code: resData.code,
        };
      }

      return {
        success: true,
        messageId: resData.sid,
        status: resData.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to contact Twilio API from server.",
      };
    }
  });

export interface AutonomousApiConfig {
  // WhatsApp Provider: "demo" | "twilio" | "meta" | "greenapi" | "webhook"
  whatsappProvider: "demo" | "twilio" | "meta" | "greenapi" | "webhook";
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string; // e.g. +14155238886 (Twilio WhatsApp sandbox)

  metaPhoneNumberId?: string;
  metaBearerToken?: string;
  metaTemplateName?: string;

  greenApiInstanceId?: string;
  greenApiToken?: string;

  customWebhookUrl?: string; // Zapier, Make.com, n8n, or Supabase Edge Function

  // Email Provider: "demo" | "resend" | "brevo" | "sendgrid" | "webhook"
  emailProvider: "demo" | "resend" | "brevo" | "sendgrid" | "webhook";
  resendApiKey?: string;
  resendFromEmail?: string; // e.g. "Celebrations <celebrations@sociodex.app>"

  brevoApiKey?: string;
  sendgridApiKey?: string;
}

export interface DispatchResult {
  success: boolean;
  provider: string;
  channel: "whatsapp" | "email";
  recipient: string;
  timestamp: string;
  messageId?: string;
  details: string;
  requestPayload?: any;
}

const STORAGE_KEY = "sociodex_autonomous_api_config_v1";

export function loadAutonomousApiConfig(): AutonomousApiConfig {
  const envResendKey =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_RESEND_API_KEY as string | undefined) ||
        (import.meta.env.RESEND_API_KEY as string | undefined)
      : undefined;

  const envFromEmail =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_RESEND_FROM_EMAIL as string | undefined)
      : undefined;

  const envTwilioToken =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_TWILIO_AUTH_TOKEN as string | undefined) ||
        (import.meta.env.VITE_TWILIO_API_KEY_SID as string | undefined) ||
        (import.meta.env.TWILIO_AUTH_TOKEN as string | undefined)
      : undefined;

  const envTwilioAccountSid =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_TWILIO_ACCOUNT_SID as string | undefined) ||
        (import.meta.env.TWILIO_ACCOUNT_SID as string | undefined)
      : undefined;

  const envTwilioFrom =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_TWILIO_FROM_NUMBER as string | undefined) ||
        (import.meta.env.TWILIO_FROM_NUMBER as string | undefined)
      : undefined;

  const defaultConfig: AutonomousApiConfig = {
    whatsappProvider: envTwilioAccountSid ? "twilio" : "demo",
    emailProvider: envResendKey ? "resend" : "demo",
    twilioAccountSid: envTwilioAccountSid || "",
    twilioAuthToken: envTwilioToken || "",
    twilioFromNumber: envTwilioFrom || "+14155238886",
    resendApiKey: envResendKey || "",
    resendFromEmail: envFromEmail || "onboarding@resend.dev",
  };

  if (typeof window === "undefined") {
    return defaultConfig;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultConfig,
        ...parsed,
        twilioAccountSid: parsed.twilioAccountSid || envTwilioAccountSid || "",
        twilioAuthToken: parsed.twilioAuthToken || envTwilioToken || "",
        twilioFromNumber: parsed.twilioFromNumber || envTwilioFrom || "+14155238886",
        resendApiKey: parsed.resendApiKey || envResendKey || "",
        resendFromEmail: parsed.resendFromEmail || envFromEmail || "onboarding@resend.dev",
        emailProvider:
          parsed.emailProvider === "demo" && envResendKey
            ? "resend"
            : (parsed.emailProvider || (envResendKey ? "resend" : "demo")),
        whatsappProvider:
          parsed.whatsappProvider === "demo" && envTwilioAccountSid
            ? "twilio"
            : (parsed.whatsappProvider || (envTwilioAccountSid ? "twilio" : "demo")),
      };
    }
  } catch (e) {
    console.error("Failed to load API config", e);
  }
  return defaultConfig;
}

export function saveAutonomousApiConfig(config: AutonomousApiConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

/**
 * 100% Silent Background WhatsApp Dispatcher
 */
export async function sendAutonomousWhatsApp(
  toPhone: string,
  messageText: string,
  config: AutonomousApiConfig
): Promise<DispatchResult> {
  const cleanPhone = toPhone.replace(/[^0-9]/g, "");
  const now = new Date().toISOString();

  // 1. DEMO SIMULATOR
  if (config.whatsappProvider === "demo" || !config.whatsappProvider) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      provider: "Demo Sandbox Simulator",
      channel: "whatsapp",
      recipient: cleanPhone,
      timestamp: now,
      messageId: `sim_wa_${Date.now()}`,
      details: "Simulated autonomous WhatsApp background API dispatch. To send real messages automatically, enter your Twilio or Meta Cloud API key.",
      requestPayload: {
        to: `+${cleanPhone}`,
        body: messageText,
      },
    };
  }

  // 2. TWILIO WHATSAPP API
  if (config.whatsappProvider === "twilio") {
    const activeAccountSid =
      config.twilioAccountSid ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_TWILIO_ACCOUNT_SID as string | undefined) ||
          (import.meta.env.TWILIO_ACCOUNT_SID as string | undefined)
        : "") ||
      "";

    const activeAuthToken =
      config.twilioAuthToken ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_TWILIO_AUTH_TOKEN as string | undefined) ||
          (import.meta.env.VITE_TWILIO_API_KEY_SID as string | undefined) ||
          (import.meta.env.TWILIO_AUTH_TOKEN as string | undefined)
        : "") ||
      "";

    const activeFromNumber =
      config.twilioFromNumber ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_TWILIO_FROM_NUMBER as string | undefined)
        : "") ||
      "+14155238886";

    try {
      const result = await serverDispatchWhatsAppTwilio({
        data: {
          toPhone: cleanPhone,
          messageText,
          accountSid: activeAccountSid,
          authToken: activeAuthToken,
          fromNumber: activeFromNumber,
        },
      });

      if (!result.success) {
        return {
          success: false,
          provider: "Twilio WhatsApp API",
          channel: "whatsapp",
          recipient: cleanPhone,
          timestamp: now,
          details: result.error || "Failed to dispatch via Twilio.",
          requestPayload: { to: `whatsapp:+${cleanPhone}` },
        };
      }

      return {
        success: true,
        provider: "Twilio WhatsApp API",
        channel: "whatsapp",
        recipient: cleanPhone,
        timestamp: now,
        messageId: result.messageId,
        details: `Successfully dispatched via Twilio (SID: ${result.messageId}, Status: ${result.status})`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "Twilio WhatsApp API",
        channel: "whatsapp",
        recipient: cleanPhone,
        timestamp: now,
        details: err.message || "Network error connecting to Twilio.",
      };
    }
  }

  // 3. GREEN API (Instant WhatsApp QR Gateway)
  if (config.whatsappProvider === "greenapi") {
    if (!config.greenApiInstanceId || !config.greenApiToken) {
      return {
        success: false,
        provider: "Green API",
        channel: "whatsapp",
        recipient: cleanPhone,
        timestamp: now,
        details: "Missing Green API Instance ID or API Token.",
      };
    }

    try {
      const endpoint = `https://api.green-api.com/waInstance${config.greenApiInstanceId}/sendMessage/${config.greenApiToken}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: `${cleanPhone}@c.us`,
          message: messageText,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.idMessage) {
        return {
          success: false,
          provider: "Green API",
          channel: "whatsapp",
          recipient: cleanPhone,
          timestamp: now,
          details: data.message || "Failed to dispatch via Green API.",
        };
      }

      return {
        success: true,
        provider: "Green API",
        channel: "whatsapp",
        recipient: cleanPhone,
        timestamp: now,
        messageId: data.idMessage,
        details: `Dispatched silently to WhatsApp (Message ID: ${data.idMessage})`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "Green API",
        channel: "whatsapp",
        recipient: cleanPhone,
        timestamp: now,
        details: err.message || "Network error.",
      };
    }
  }

  // 4. CUSTOM WEBHOOK (Zapier, Make.com, n8n, Supabase)
  if (config.whatsappProvider === "webhook" && config.customWebhookUrl) {
    try {
      const response = await fetch(config.customWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "whatsapp_dispatch",
          to: cleanPhone,
          message: messageText,
          timestamp: now,
        }),
      });
      return {
        success: response.ok,
        provider: "Custom Webhook / Automation Engine",
        channel: "whatsapp",
        recipient: cleanPhone,
        timestamp: now,
        details: `Webhook responded with status ${response.status}`,
      };
    } catch (e: any) {
      return {
        success: false,
        provider: "Custom Webhook",
        channel: "whatsapp",
        recipient: cleanPhone,
        timestamp: now,
        details: e.message || "Webhook delivery failed.",
      };
    }
  }

  return {
    success: false,
    provider: config.whatsappProvider,
    channel: "whatsapp",
    recipient: cleanPhone,
    timestamp: now,
    details: "Unsupported WhatsApp provider selected.",
  };
}

/**
 * 100% Silent Background Email Dispatcher
 */
export async function sendAutonomousEmail(
  toEmail: string,
  subject: string,
  bodyHtml: string,
  config: AutonomousApiConfig
): Promise<DispatchResult> {
  const now = new Date().toISOString();

  // 1. DEMO SIMULATOR
  if (config.emailProvider === "demo" || !config.emailProvider) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      provider: "Demo Sandbox Simulator",
      channel: "email",
      recipient: toEmail,
      timestamp: now,
      messageId: `sim_email_${Date.now()}`,
      details: "Simulated autonomous Email background API dispatch. To send real emails automatically, connect Resend or Brevo API key.",
      requestPayload: {
        to: toEmail,
        subject,
      },
    };
  }

  // 2. RESEND EMAIL API (Recommended & Instant)
  if (config.emailProvider === "resend") {
    const activeApiKey =
      config.resendApiKey ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_RESEND_API_KEY as string | undefined) ||
          (import.meta.env.RESEND_API_KEY as string | undefined)
        : "") ||
      "";

    const activeFromEmail =
      config.resendFromEmail ||
      (typeof import.meta !== "undefined" && import.meta.env
        ? (import.meta.env.VITE_RESEND_FROM_EMAIL as string | undefined)
        : "") ||
      "onboarding@resend.dev";

    try {
      const result = await serverDispatchEmail({
        data: {
          to: toEmail,
          subject: subject,
          html: `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #241621; padding: 20px;">${bodyHtml.replace(/\n/g, "<br/>")}</div>`,
          apiKey: activeApiKey,
          fromEmail: activeFromEmail,
        },
      });

      if (!result.success) {
        return {
          success: false,
          provider: "Resend API",
          channel: "email",
          recipient: toEmail,
          timestamp: now,
          details: result.error || "Resend email delivery failed.",
        };
      }

      return {
        success: true,
        provider: "Resend API",
        channel: "email",
        recipient: toEmail,
        timestamp: now,
        messageId: result.messageId,
        details: `Successfully sent email silently via Resend (ID: ${result.messageId})`,
      };
    } catch (e: any) {
      return {
        success: false,
        provider: "Resend API",
        channel: "email",
        recipient: toEmail,
        timestamp: now,
        details: e.message || "Failed to reach Resend API.",
      };
    }
  }

  // 3. BREVO (Sendinblue) API
  if (config.emailProvider === "brevo") {
    if (!config.brevoApiKey) {
      return {
        success: false,
        provider: "Brevo API",
        channel: "email",
        recipient: toEmail,
        timestamp: now,
        details: "Missing Brevo API Key.",
      };
    }

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": config.brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "SocioDex Celebrations", email: "celebrations@sociodex.app" },
          to: [{ email: toEmail }],
          subject: subject,
          htmlContent: `<div>${bodyHtml.replace(/\n/g, "<br/>")}</div>`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          provider: "Brevo API",
          channel: "email",
          recipient: toEmail,
          timestamp: now,
          details: data.message || `Brevo status ${response.status}`,
        };
      }

      return {
        success: true,
        provider: "Brevo API",
        channel: "email",
        recipient: toEmail,
        timestamp: now,
        messageId: data.messageId,
        details: `Sent email via Brevo (Message ID: ${data.messageId})`,
      };
    } catch (e: any) {
      return {
        success: false,
        provider: "Brevo API",
        channel: "email",
        recipient: toEmail,
        timestamp: now,
        details: e.message || "Brevo network error.",
      };
    }
  }

  return {
    success: false,
    provider: config.emailProvider,
    channel: "email",
    recipient: toEmail,
    timestamp: now,
    details: "Unsupported email provider.",
  };
}
