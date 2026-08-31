import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const duplicateWindowMs = 60_000;
const recentContactRequests = globalThis.__holoraiRecentContactRequests || new Map();
globalThis.__holoraiRecentContactRequests = recentContactRequests;

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

export async function POST(request) {
  let duplicateKey = '';
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

    const name = clean(form.get('name'));
    const email = clean(form.get('email'));
    const company = clean(form.get('company'));
    const task = clean(form.get('task'));
    const week = clean(form.get('week'));

    if (!name || !email || !task) {
      return Response.json(
        { ok: false, message: 'Name, email, and task are required.' },
        { status: 400 },
      );
    }

    duplicateKey = [email.toLowerCase(), company.toLowerCase(), task.toLowerCase(), week.toLowerCase()].join('|');
    const now = Date.now();
    const previous = recentContactRequests.get(duplicateKey);
    if (previous && now - previous < duplicateWindowMs) {
      return Response.json({ ok: true, duplicate: true });
    }
    recentContactRequests.set(duplicateKey, now);

    for (const [key, at] of recentContactRequests) {
      if (now - at > duplicateWindowMs) {
        recentContactRequests.delete(key);
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
    const subject = `New HOLORAI demo request from ${name}`;
    const submittedAt = new Date().toISOString();

    const text = [
      'New HOLORAI demo/contact request',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || 'Not provided'}`,
      `Preferred week: ${week || 'Not provided'}`,
      '',
      'Task:',
      task,
      '',
      `Submitted at: ${submittedAt}`,
    ].join('\n');

    const html = `
      <h2>New HOLORAI demo/contact request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company || 'Not provided')}</p>
      <p><strong>Preferred week:</strong> ${escapeHtml(week || 'Not provided')}</p>
      <p><strong>Task:</strong></p>
      <p>${escapeHtml(task).replace(/\n/g, '<br>')}</p>
      <p><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>
    `;

    await transporter.sendMail({
      from: `"HOLORAI Website" <${from}>`,
      to,
      replyTo: email,
      subject,
      text,
      html,
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (duplicateKey) {
      recentContactRequests.delete(duplicateKey);
    }
    console.error('Contact form email failed:', error);
    return Response.json(
      { ok: false, message: 'Unable to send the request right now.' },
      { status: 500 },
    );
  }
}
