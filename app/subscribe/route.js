import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const duplicateWindowMs = 60_000;
const recentSignups = globalThis.__holoraiRecentSignups || new Map();
globalThis.__holoraiRecentSignups = recentSignups;

function clean(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function truthy(value) {
  return /^(1|true|yes)$/i.test(clean(value));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request) {
  let email = '';
  try {
    let form;
    try {
      form = await request.formData();
    } catch {
      return Response.json(
        { ok: false, message: 'Expected a form submission.' },
        { status: 400 },
      );
    }

    email = clean(form.get('email')).toLowerCase();

    if (!validEmail(email)) {
      return Response.json(
        { ok: false, message: 'A valid email address is required.' },
        { status: 400 },
      );
    }

    const now = Date.now();
    const previous = recentSignups.get(email);
    if (previous && now - previous < duplicateWindowMs) {
      return Response.json({ ok: true, duplicate: true });
    }
    recentSignups.set(email, now);

    for (const [key, at] of recentSignups) {
      if (now - at > duplicateWindowMs) {
        recentSignups.delete(key);
      }
    }

    const port = Number(process.env.EMAIL_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: requiredEnv('EMAIL_HOST'),
      port,
      secure: port === 465,
      requireTLS: truthy(process.env.EMAIL_USE_TLS),
      auth: {
        user: requiredEnv('EMAIL_HOST_USER'),
        pass: requiredEnv('EMAIL_HOST_PASSWORD'),
      },
    });

    const to = process.env.ADMIN_EMAIL || 'info@holorai.com';
    const from = process.env.DEFAULT_FROM_EMAIL || requiredEnv('EMAIL_HOST_USER');
    const submittedAt = new Date().toISOString();

    await transporter.sendMail({
      from: `"HOLORAI Website" <${from}>`,
      to,
      replyTo: email,
      subject: `New HOLORAI newsletter signup: ${email}`,
      text: [
        'New HOLORAI newsletter signup',
        '',
        `Email: ${email}`,
        `Submitted at: ${submittedAt}`,
      ].join('\n'),
      html: `
        <h2>New HOLORAI newsletter signup</h2>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>
      `,
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (email) {
      recentSignups.delete(email);
    }
    console.error('Newsletter signup email failed:', error);
    return Response.json(
      { ok: false, message: 'Unable to subscribe right now.' },
      { status: 500 },
    );
  }
}
