const nodemailer = require('nodemailer');

// Only create transporter if email credentials are provided
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('Email service error:', error.message);
    } else {
      console.log('Email service ready');
    }
  });
} else {
  console.log('Email service not configured (EMAIL_USER and EMAIL_PASS not set)');
}

module.exports = transporter;
