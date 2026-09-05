import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../services/mail.service.js";
import { BACKEND_URL, FRONTEND_URL } from "../config/config.js";

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearAuthCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
  const { username, email, password } = req.body;
  const isUserExist = await userModel.findOne({
    $or: [{ email }, { username }]
  });
  if (isUserExist) {
    return res.status(400).json({
      message: "User with this email or username already exists",
      success: false,
      err: "User already exists"
    });
  };
  const user = await userModel.create({
    username, email, password
  });
  const emailVerificationToken = jwt.sign({
    email: user.email,
  }, process.env.JWT_SECRET, { expiresIn: "24h" });
  await sendEmail({
    to: email,
    subject: "Verify Your Email - ChatNova",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f7fb; font-family: Arial, sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px; background-color:#f4f7fb;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background: linear-gradient(135deg, #4f46e5, #9333ea); padding:30px; color:#ffffff;">
              
              <h1 style="margin:0; font-size:28px; letter-spacing:1px;">
                ChatNova
              </h1>

              <p style="margin-top:8px; font-size:14px; opacity:0.9;">
                Your AI-powered experience starts here
              </p>

            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">

              <h2 style="margin-top:0; font-size:22px;">
                Hi ${user.username}, 👋
              </h2>

              <p style="font-size:15px; line-height:1.6;">
                Thank you for registering on <strong>ChatNova</strong>. We're excited to have you onboard!
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Please confirm your email address to activate your account by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}"
                      style="background: linear-gradient(135deg, #4f46e5, #9333ea); 
                             color:#ffffff; 
                             text-decoration:none; 
                             padding:14px 28px; 
                             font-size:16px; 
                             border-radius:8px; 
                             display:inline-block;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; color:#666;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="font-size:13px; color:#4f46e5; word-break:break-all;">
                ${BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}
              </p>

              <p style="font-size:14px; color:#666; margin-top:20px;">
                If you did not register on ChatNova, please ignore this email.
              </p>

              <p style="margin-top:30px; font-size:14px;">
                Best regards,<br />
                <strong>The ChatNova Team</strong>
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="height:1px; background:#eeeeee;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:20px; font-size:12px; color:#888888; background:#f9fafb;">

              <p style="margin:0;">
                © 2026 ChatNova. All rights reserved.
              </p>

              <p style="margin:6px 0 0;">
                Made with ❤️ for smarter conversations
              </p>

            </td>
          </tr>

        </table>

        <!-- Bottom Space -->
        <div style="height:20px;"></div>

      </td>
    </tr>
  </table>

</body>
</html>`,
  });
  const authToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", authToken, authCookieOptions);
  res.status(201).json({
    message: "User created successfully",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified
    }
  })
};

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }    
 */

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User with this email does not exist",
      success: false,
      err: "User not found"
    });
  };
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return res.status(400).json({
      message: "Inavlid email or password",
      success: false,
      err: "Incorrect password"
    });
  };
  //  if (!user.verified) {
  //    return res.status(400).json({
  //      message: "Please verify your email before logging in",
  //      succes : false,
  //       err : "Email not verified"
  //    });
  //  };
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie("token", token, authCookieOptions);
  res.status(200).json({
    message: "Login successful",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified
    }
  });

}

/**  
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found"
      })
    };
    if (!user.verified) {
      user.verified = true;
      await user.save();
    }
    return res.redirect(`${FRONTEND_URL}/verify-email?status=success`);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid or expired token",
      success: false,
      err: error.message
    })
  }

}

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user details
 * @access Private                  
 */
export async function getMe(req, res) {
  const userId = req.user.id;
  const user = await userModel.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found"
    });
  };
  res.status(200).json({
    message: "User fetched successfully",
    success: true,
    user
  });
}

/**
 * @route GET /api/auth/resend-verification-email
 * @desc Resend verification email to user
 * @access Public
*/

export async function resendEmailVerificationLink(req, res) {
  const userId = req.user.id;
  const user = await userModel.findById(userId);
  if (!user) {
    return register.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found"
    })
  };
  if (user.verified) {
    return res.status(400).json({
      message: "Email is already verified",
      success: false,
      err: "Email already verified"
    })
  };
  const emailverificationToken = jwt.sign({
    email: user.email,
  }, process.env.JWT_SECRET, { expiresIn: "24h" });
  await sendEmail({
    to: user.email,
    subject: "Verify Your Email - ChatNova",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f7fb; font-family: Arial, sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px; background-color:#f4f7fb;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background: linear-gradient(135deg, #4f46e5, #9333ea); padding:30px; color:#ffffff;">
              
              <h1 style="margin:0; font-size:28px; letter-spacing:1px;">
                ChatNova
              </h1>

              <p style="margin-top:8px; font-size:14px; opacity:0.9;">
                Your AI-powered experience starts here
              </p>

            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">

              <h2 style="margin-top:0; font-size:22px;">
                Hi ${user.username}, 👋
              </h2>

              <p style="font-size:15px; line-height:1.6;">
                Thank you for registering on <strong>ChatNova</strong>. We're excited to have you onboard!
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Please confirm your email address to activate your account by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${BACKEND_URL}/api/auth/verify-email?token=${emailverificationToken}"
                      style="background: linear-gradient(135deg, #4f46e5, #9333ea); 
                             color:#ffffff; 
                             text-decoration:none; 
                             padding:14px 28px; 
                             font-size:16px; 
                             border-radius:8px; 
                             display:inline-block;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; color:#666;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="font-size:13px; color:#4f46e5; word-break:break-all;">
                ${BACKEND_URL}/api/auth/verify-email?token=${emailverificationToken}
              </p>

              <p style="font-size:14px; color:#666; margin-top:20px;">
                If you did not register on ChatNova, please ignore this email.
              </p>

              <p style="margin-top:30px; font-size:14px;">
                Best regards,<br />
                <strong>The ChatNova Team</strong>
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="height:1px; background:#eeeeee;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:20px; font-size:12px; color:#888888; background:#f9fafb;">

              <p style="margin:0;">
                © 2026 ChatNova. All rights reserved.
              </p>

              <p style="margin:6px 0 0;">
                Made with ❤️ for smarter conversations
              </p>

            </td>
          </tr>

        </table>

        <!-- Bottom Space -->
        <div style="height:20px;"></div>

      </td>
    </tr>
  </table>

</body>
</html>`
  });
  res.status(200).json({
    message: "Verification email resent successfully",
    success: true,
  });
}

/**
 * @route POST /api/auth/logout
* @desc Logout user and invalidate JWT token
 * @access Public    
 */

export async function logout(req, res) {
  res.clearCookie("token", clearAuthCookieOptions);
  res.status(200).json({
    message: "Logout successful",
    success: true,
  });
}

/**
 * @route POST /api/auth/forgot-password
 * @desc Send 6-digit OTP verification code for password reset
 * @access Public
 * @body { email }
 */
export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User with this email does not exist",
      success: false,
      err: "User not found"
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail({
    to: email,
    subject: "Reset Your Password - ChatNova",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f7fb; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px; background-color:#f4f7fb;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #4f46e5, #9333ea); padding:30px; color:#ffffff;">
              <h1 style="margin:0; font-size:28px; letter-spacing:1px;">ChatNova</h1>
              <p style="margin-top:8px; font-size:14px; opacity:0.9;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0; font-size:22px;">Hi ${user.username}, 👋</h2>
              <p style="font-size:15px; line-height:1.6;">
                We received a request to reset your password for your <strong>ChatNova</strong> account.
              </p>
              <p style="font-size:15px; line-height:1.6;">
                Use the following 6-digit verification code to complete your password reset:
              </p>
              <div style="text-align:center; margin:30px 0;">
                <span style="font-size:36px; font-weight:bold; letter-spacing:6px; color:#4f46e5; background:#f0f4ff; padding:12px 24px; border-radius:8px; display:inline-block; border:1px dashed #4f46e5;">
                  ${otp}
                </span>
              </div>
              <p style="font-size:14px; color:#666;">
                This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.
              </p>
              <p style="margin-top:30px; font-size:14px;">
                Best regards,<br />
                <strong>The ChatNova Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:1px; background:#eeeeee;"></td>
          </tr>
          <tr>
            <td align="center" style="padding:20px; font-size:12px; color:#888888; background:#f9fafb;">
              <p style="margin:0;">© 2026 ChatNova. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  });

  return res.status(200).json({
    message: "Verification code sent to your email",
    success: true
  });
}

/**
 * @route POST /api/auth/verify-reset-code
 * @desc Verify OTP verification code
 * @access Public
 * @body { email, otp }
 */
export async function verifyResetCode(req, res) {
  const { email, otp } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User with this email does not exist",
      success: false,
      err: "User not found"
    });
  }

  if (
    !user.resetPasswordOtp ||
    user.resetPasswordOtp !== otp ||
    !user.resetPasswordOtpExpires ||
    user.resetPasswordOtpExpires < new Date()
  ) {
    return res.status(400).json({
      message: "Invalid or expired verification code",
      success: false,
      err: "Invalid OTP"
    });
  }

  return res.status(200).json({
    message: "Verification code verified successfully",
    success: true
  });
}

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password with verified OTP
 * @access Public
 * @body { email, otp, newPassword }
 */
export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User with this email does not exist",
      success: false,
      err: "User not found"
    });
  }

  if (
    !user.resetPasswordOtp ||
    user.resetPasswordOtp !== otp ||
    !user.resetPasswordOtpExpires ||
    user.resetPasswordOtpExpires < new Date()
  ) {
    return res.status(400).json({
      message: "Invalid or expired verification code",
      success: false,
      err: "Invalid OTP"
    });
  }

  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpires = undefined;
  await user.save();

  return res.status(200).json({
    message: "Password reset successfully. You can now log in with your new password.",
    success: true
  });
}

