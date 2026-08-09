import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../services/mail.service.js";

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
export async function register(req,res){
    const {username,email,password} = req.body;
    const isUserExist = await userModel.findOne({
        $or : [{email},{username}]
    });
    if(isUserExist){
        return res.status(400).json({
            message : "User with this email or username already exists",
            success : false,
            err : "User already exists"
        });
    };
    const user = await userModel.create({
        username,email,password
    });
    const emailVerificationToken = jwt.sign({
      email : user.email,
    },process.env.JWT_SECRET);

    await sendEmail({
      to: email,
      subject: "Verify Your Email - Perpexility",
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
                Perpexility
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
                Thank you for registering on <strong>Perpexility</strong>. We're excited to have you onboard!
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Please confirm your email address to activate your account by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}"
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
                http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}
              </p>

              <p style="font-size:14px; color:#666; margin-top:20px;">
                If you did not register on Perpexility, please ignore this email.
              </p>

              <p style="margin-top:30px; font-size:14px;">
                Best regards,<br />
                <strong>The Perpexility Team</strong>
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
                © 2026 Perpexility. All rights reserved.
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
    res.status(201).json({
        message : "User created successfully",
        success : true,
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
};

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }    
 */ 

export async function login(req,res){
   const {email,password} = req.body;
   const user = await userModel.findOne({email});
   if(!user){
    return res.status(400).json({
        message : "User with this email does not exist",
        success : false,
        err : "User not found"
    });
   };
   const isPasswordMatch = await user.comparePassword(password);
   if(!isPasswordMatch){
    return res.status(400).json({
        message : "Inavlid email or password",
        success : false,
        err : "Incorrect password"
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
   res.cookie("token",token);
   res.status(200).json({
     message : "Login successful",
     success : true,
     user : {
      id : user._id,
      username : user.username,
      email : user.email
     }
   });

}

/**  
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */ 
export async function verifyEmail(req,res){
  const {token} = req.query;
  try {
  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  const user = await userModel.findOne({email : decoded.email});
  if(!user){
    return res.status(400).json({
      message : "Invalid token",
      success : false,
      err : "User not found"
    })
  };
  if (user.verified) {
  const html = `
    <h1>Email Already Verified</h1>
    <p>Hi ${user.username},</p>
    <p>Your email is already verified. You can log in to your account.</p>
  `;
  return res.send(html);
  }
  user.verified = true;
  await user.save();
  const html = `<h1>Email Verified</h1><p>Hii ${user.username},</p><p>Your email has been successfully verified. You can now log in to your account.</p><p>Best regards,<br/>The Perpexility Team</p>`;
  return res.send(html);
  } catch (error) {
    return res.status(400).json({
      message : "Invalid or expired token",
      success : false,
      err : error.message
    })
  }
  
}

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user details
 * @access Private                  
 */
export async function getMe(req,res){
  const userId = req.user.id;
  const user = await userModel.findById(userId).select("-password"); 
  if(!user){
    return res.status(404).json({
      message : "User not found",
      success : false,
      err : "User not found"
    });
  };
  res.status(200).json({
    message : "User fetched successfully",
    success : true,
    user
  });
}

/**
 * @route GET /api/auth/resend-verification-email
 * @desc Resend verification email to user
 * @access Public
*/
 
export async function resendEmailVerificationLink(req,res){
  const userId = req.user.id;
  const user = await userModel.findById(userId);
  if(!user){
    return register.status(404).json({
      message : "User not found",
      success : false,
      err : "User not found"
    })
  };
  if(user.verified){
    res.status(400).json({
      message : "Email is already verified",
      success : false,
      err : "Email already verified"
    })
  };
  const emailverificationToken = jwt.sign({
    email : user.email,
  },process.env.JWT_SECRET);
  await sendEmail({
    to: user.email,
    subject: "Verify Your Email - Perpexility",
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
                Perpexility
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
                Thank you for registering on <strong>Perpexility</strong>. We're excited to have you onboard!
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Please confirm your email address to activate your account by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:3000/api/auth/verify-email?token=${emailverificationToken }"
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
                http://localhost:3000/api/auth/verify-email?token=${emailverificationToken}
              </p>

              <p style="font-size:14px; color:#666; margin-top:20px;">
                If you did not register on Perpexility, please ignore this email.
              </p>

              <p style="margin-top:30px; font-size:14px;">
                Best regards,<br />
                <strong>The Perpexility Team</strong>
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
                © 2026 Perpexility. All rights reserved.
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
    message : "Verification email resent successfully",
    success : true,
  });
}

/**
 * @route POST /api/auth/logout
* @desc Logout user and invalidate JWT token
 * @access Public    
 */ 

export async function logout(req,res){
  res.clearCookie("token");
  res.status(200).json({
    message : "Logout successful",
    success : true,
  });
}