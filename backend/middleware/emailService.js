const nodemailer = require('nodemailer');

// Initialize transporter - configure with your email service
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp, name) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; background: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                        .header { color: #1a3a2a; margin-bottom: 20px; }
                        .otp-box { background: #f4f6f3; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #e8a020; letter-spacing: 5px; }
                        .expiry { color: #666; margin-top: 15px; font-size: 14px; }
                        .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Rwanda DriveDoc - Email Verification</h2>
                        </div>
                        <p>Hi ${name || 'User'},</p>
                        <p>Your one-time password (OTP) for email verification is:</p>
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                        </div>
                        <p class="expiry">This code will expire in 5 minutes. Do not share it with anyone.</p>
                        <p>If you did not request this code, please ignore this email.</p>
                        <div class="footer">
                            <p>Rwanda DriveDoc &copy; 2026 | All rights reserved</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Rwanda DriveDoc Verification',
            html: htmlContent
        });

        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

/**
 * Send admin reply email to user
 */
const sendAdminReplyEmail = async (userEmail, userName, adminName, replyMessage) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; background: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                        .header { color: #1a3a2a; margin-bottom: 20px; }
                        .reply-box { background: #f4f6f3; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e8a020; }
                        .reply-text { color: #333; line-height: 1.6; white-space: pre-wrap; }
                        .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
                        .cta-button { background: #1a3a2a; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Rwanda DriveDoc - Admin Response</h2>
                        </div>
                        <p>Hi ${userName},</p>
                        <p>${adminName} from Rwanda DriveDoc has replied to your message:</p>
                        <div class="reply-box">
                            <div class="reply-text">${replyMessage}</div>
                        </div>
                        <p>You can view more details in your Rwanda DriveDoc dashboard.</p>
                        <div class="footer">
                            <p>Rwanda DriveDoc &copy; 2026 | All rights reserved</p>
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Re: Your Message to Rwanda DriveDoc Support`,
            html: htmlContent
        });

        return true;
    } catch (error) {
        console.error('Error sending admin reply email:', error);
        return false;
    }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, name) => {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; background: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                        .header { color: #1a3a2a; margin-bottom: 20px; }
                        .features { margin: 20px 0; }
                        .feature-item { padding: 10px; border-left: 4px solid #e8a020; margin-bottom: 10px; background: #f9f9f9; }
                        .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Welcome to Rwanda DriveDoc!</h2>
                        </div>
                        <p>Hi ${name},</p>
                        <p>Thank you for joining Rwanda DriveDoc. Your account is now active and ready to use.</p>
                        <div class="features">
                            <h3>What you can do:</h3>
                            <div class="feature-item">✓ Upload and manage your driving documents</div>
                            <div class="feature-item">✓ Track document expiration dates</div>
                            <div class="feature-item">✓ Receive notifications about important updates</div>
                            <div class="feature-item">✓ Contact our support team anytime</div>
                        </div>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <div class="footer">
                            <p>Rwanda DriveDoc &copy; 2026 | All rights reserved</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Rwanda DriveDoc!',
            html: htmlContent
        });

        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

module.exports = {
    sendOTPEmail,
    sendAdminReplyEmail,
    sendWelcomeEmail
};
