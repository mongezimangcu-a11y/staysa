import nodemailer from "nodemailer";

type SendMailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function mustGet(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function getTransporter() {
  const host = mustGet("SMTP_HOST", process.env.SMTP_HOST);
  const port = Number(process.env.SMTP_PORT || 465);

  const secure =
    process.env.SMTP_SECURE != null
      ? String(process.env.SMTP_SECURE) === "true"
      : port === 465;

  const user = mustGet("SMTP_USER", process.env.SMTP_USER);
  const pass = mustGet("SMTP_PASS", process.env.SMTP_PASS);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendMail({ to, subject, text, html }: SendMailArgs) {
  const transporter = getTransporter();
  const from =
    process.env.SMTP_FROM || process.env.SMTP_USER || "Tripconnecta";

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

//
// ===============================
// ADMIN EMAIL
// ===============================
//

export async function sendAdminBookingEmail(payload: {
  booking_reference: string;
  property_title: string;
  property_suburb: string;
  property_city?: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  company_name: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  total_estimate: number;
  booking_id: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) return;

  const subject = `New booking request (${payload.booking_reference})`;

  const text = `
New booking request received.

Booking Ref: ${payload.booking_reference}

Property: ${payload.property_title}
Location: ${payload.property_suburb}${payload.property_city ? `, ${payload.property_city}` : ""}
Dates: ${payload.check_in} → ${payload.check_out} (${payload.nights} night${payload.nights === 1 ? "" : "s"})
Guests: ${payload.guests}
Company: ${payload.company_name}

Traveler: ${payload.traveler_name}
Email: ${payload.traveler_email}
Phone: ${payload.traveler_phone}

Estimated Total: R${payload.total_estimate}

Booking ID: ${payload.booking_id}
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <img src="http://localhost:3000/logo.png" alt="Tripconnecta" width="180" />
      <h2>New Booking Request</h2>

      <p><strong>Booking Ref:</strong> ${payload.booking_reference}</p>

      <p><strong>Property:</strong> ${payload.property_title}</p>
      <p><strong>Location:</strong> ${payload.property_suburb}${payload.property_city ? `, ${payload.property_city}` : ""}</p>
      <p><strong>Dates:</strong> ${payload.check_in} → ${payload.check_out}</p>
      <p><strong>Guests:</strong> ${payload.guests}</p>
      <p><strong>Company:</strong> ${payload.company_name}</p>

      <hr/>

      <p><strong>Traveler:</strong> ${payload.traveler_name}</p>
      <p><strong>Email:</strong> ${payload.traveler_email}</p>
      <p><strong>Phone:</strong> ${payload.traveler_phone}</p>

      <p><strong>Estimated Total:</strong> R${payload.total_estimate}</p>

      <p><strong>Booking ID:</strong> ${payload.booking_id}</p>

      <br/>
      <p>Please review in the admin panel.</p>
    </div>
  `;

  await sendMail({
    to: adminEmail,
    subject,
    text,
    html,
  });
}

//
// ===============================
// TRAVELER EMAIL
// ===============================
//

export async function sendTravelerBookingEmail(payload: {
  to: string;
  traveler_name: string;
  booking_reference: string;
  suburb: string;
  city?: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  company_name: string;
  total_estimate: number;
}) {
  const subject = `Tripconnecta booking request received (${payload.booking_reference})`;

  const text = `
Hi ${payload.traveler_name},

We’ve received your booking request.

Booking Ref: ${payload.booking_reference}

Location: ${payload.suburb}${payload.city ? `, ${payload.city}` : ""}
Dates: ${payload.check_in} → ${payload.check_out}
Guests: ${payload.guests}
Company: ${payload.company_name}
Estimated Total: R${payload.total_estimate}

We will confirm shortly.

Thank you for choosing Tripconnecta.
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <img src="http://localhost:3000/logo.png" alt="Tripconnecta" width="180" />

      <h2>Booking Request Received</h2>

      <p>Hi ${payload.traveler_name},</p>

      <p>We’ve received your booking request.</p>

      <p><strong>Booking Ref:</strong> ${payload.booking_reference}</p>

      <p><strong>Location:</strong> ${payload.suburb}${payload.city ? `, ${payload.city}` : ""}</p>
      <p><strong>Dates:</strong> ${payload.check_in} → ${payload.check_out}</p>
      <p><strong>Guests:</strong> ${payload.guests}</p>
      <p><strong>Company:</strong> ${payload.company_name}</p>
      <p><strong>Estimated Total:</strong> R${payload.total_estimate}</p>

      <br/>
      <p>You will receive confirmation shortly.</p>

      <br/>
      <p>Tripconnecta</p>
    </div>
  `;

  await sendMail({
    to: payload.to,
    subject,
    text,
    html,
  });
}