import 'dotenv/config';
import { createTransport, getTestMessageUrl } from 'nodemailer';

const transport = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function makeEmail(text: string): string {
  return `
    <div style="
      border: 1px solid black;
      padding: 20px;
      font-family: sans-serif;
      line-height: 2;
      font-size: 20px;
    ">
      <h2>Hello There!</h2>
      <p>${text}</p>
      <p>/ Mohamed</p>
    </div>
  `;
}

export async function sendPasswordResetEmail(
  resetToken: string,
  to: string
): Promise<void> {
  // email the user a token
  const info = await transport.sendMail({
    to,
    from: 'test@example.com',
    html: makeEmail(`Your Password Reset Token is here!<br>
      <a href="${process.env.FRONTEND_URL}/reset?token=${resetToken}">
        Click here to reset
      </a>
    `),
  });
  if (process.env.MAIL_USER.includes('ethereal.email')) {
    console.log(`😎 Message Sent! Preview it at ${getTestMessageUrl(info)}`)
  }
}
