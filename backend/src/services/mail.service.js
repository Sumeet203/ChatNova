import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
});


function encodeMessage(message) {
    return Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


function createEmail({ to, subject, text, html }) {

    const from = process.env.GOOGLE_USER;

    const boundary = "boundary123";

    const email = [
        `From: Chatnova <${from}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: 7bit",
        "",
        text || "",
        "",
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: 7bit",
        "",
        html || "",
        "",
        `--${boundary}--`,
    ].join("\r\n");

    return email;
}


export async function sendEmail({
    to,
    subject,
    text,
    html
}) {

    try {

        const email = createEmail({
            to,
            subject,
            text,
            html
        });

        const encodedEmail = encodeMessage(email);

        const response = await gmail.users.messages.send({
            userId: "me",

            requestBody: {
                raw: encodedEmail
            }
        });

        console.log(
            "Email sent successfully:",
            response.data.id
        );

        return response.data;

    } catch (error) {

        console.error(
            "Gmail API email error:",
            error.response?.data || error.message
        );

        throw error;
    }
}