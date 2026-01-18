const transporter = require('../config/mail');
const { EMAIL_TYPES } = require('../utils/constants');
const { formatCurrency } = require('../utils/helpers');

/**
 * Send email using nodemailer
 */
const sendEmail = async (to, subject, html, text = '') => {
  if (!transporter) {
    console.log('Email service not configured. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"Smart Expense Splitter" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate email templates
 */
const getEmailTemplate = (type, data) => {
  switch (type) {
    case EMAIL_TYPES.EXPENSE_ADDED:
      return {
        subject: `New Expense Added: ${data.expenseDescription}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Expense Added</h2>
            <p>Hello ${data.userName},</p>
            <p>A new expense has been added to the group <strong>${data.groupName}</strong>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Description:</strong> ${data.expenseDescription}</p>
              <p><strong>Amount:</strong> ${formatCurrency(data.amount, data.currency)}</p>
              <p><strong>Paid by:</strong> ${data.paidByName}</p>
              <p><strong>Your share:</strong> ${formatCurrency(data.userShare, data.currency)}</p>
            </div>
            <p>View details in your dashboard.</p>
            <p>Best regards,<br>Smart Expense Splitter</p>
          </div>
        `,
      };

    case EMAIL_TYPES.SETTLEMENT_CONFIRMED:
      return {
        subject: `Settlement Confirmed: ${formatCurrency(data.amount, data.currency)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Settlement Confirmed</h2>
            <p>Hello ${data.userName},</p>
            <p>A settlement has been confirmed in the group <strong>${data.groupName}</strong>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Amount:</strong> ${formatCurrency(data.amount, data.currency)}</p>
              <p><strong>Paid by:</strong> ${data.paidByName}</p>
              <p><strong>Paid to:</strong> ${data.paidToName}</p>
            </div>
            <p>Best regards,<br>Smart Expense Splitter</p>
          </div>
        `,
      };

    case EMAIL_TYPES.SETTLEMENT_REMINDER:
      return {
        subject: `Reminder: You have pending settlements`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Settlement Reminder</h2>
            <p>Hello ${data.userName},</p>
            <p>You have pending settlements in the group <strong>${data.groupName}</strong>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Amount owed:</strong> ${formatCurrency(data.amountOwed, data.currency)}</p>
            </div>
            <p>Please settle your dues to keep the group finances clear.</p>
            <p>Best regards,<br>Smart Expense Splitter</p>
          </div>
        `,
      };

    case EMAIL_TYPES.PASSWORD_RESET:
      return {
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset</h2>
            <p>Hello,</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Smart Expense Splitter</p>
          </div>
        `,
      };

    case EMAIL_TYPES.EMAIL_VERIFICATION:
      return {
        subject: 'Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Hello ${data.userName},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>Best regards,<br>Smart Expense Splitter</p>
          </div>
        `,
      };

    case EMAIL_TYPES.GROUP_INVITATION:
      return {
        subject: `Invitation to join ${data.groupName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Group Invitation</h2>
            <p>Hello,</p>
            <p><strong>${data.inviterName}</strong> has invited you to join the group <strong>${data.groupName}</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.invitationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p>Best regards,<br>Smart Expense Splitter</p>
          </div>
        `,
      };

    default:
      throw new Error('Unknown email type');
  }
};

/**
 * Send email with template
 */
const sendTemplatedEmail = async (type, to, data) => {
  const template = getEmailTemplate(type, data);
  return await sendEmail(to, template.subject, template.html);
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  getEmailTemplate,
};
