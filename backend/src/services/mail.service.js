import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("ERROR CONNECTING TO EMAIL SERVER:", error);
    } else {
        console.log("EMAIL SERVER IS READY:", success);
    }
});

export async function sendEmail({to,subject,text,html}){
    const mailOptions = {
        from :  process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };
    const details = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully",details);
}
