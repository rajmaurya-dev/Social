import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { hashedString } from "./index.js";
import Verification from "../models/emailVerification.js";

dotenv.config();
const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

export const sendVerificationEmail = async (user, res) => {
  const { _id, email, lastName } = user;
  const token = _id + uuidv4();
  const link = APP_URL + "users/verify/" + _id + "/" + token;

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Verification",
    html: ` <html>
    <head>
        <!-- Your HTML email template here -->
    </head>
    <body>
        <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <table width="600" cellspacing="0" cellpadding="0">
                        <tr>
                            <td bgcolor="#007BFF" height="100" style="text-align: center; color: #ffffff; font-size: 24px; font-weight: bold;">
                                Email Verification
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px;">
                                <p>Hello ${lastName},</p>
                                <p>Thank you for signing up for our service. To complete your registration, please click the verification link below:</p>
                                <p><a href="${link}" style="background-color: #007BFF; color: #ffffff; padding: 10px 20px; text-decoration: none;">Verify Your Email</a></p>
                                <p>If you did not register for our service, please ignore this email.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`,
  };

  try {
    const hashedToken = await hashedString(token);
    const newVerificationEmail = await Verification.create({
      userId: _id,
      token: hashedToken,
      createdAt: Date.now(),
      expiredAt: Date.now() + 3600000,
    });

    if (newVerificationEmail) {
      transporter.sendMail(mailOptions).then(() => {
        res.status(201).send({
          success: "PENDING",
          message: "Verification email has been sent. Check Your Email",
        });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "something went wrong" });
  }
};
