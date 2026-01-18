const app = require('./app');
const connectDB = require('./config/db');
const { sendSettlementReminders } = require('./controllers/notificationController');

// Optional: Only require node-cron if cron jobs are enabled
let cron = null;
if (process.env.ENABLE_CRON_JOBS === 'true') {
  try {
    cron = require('node-cron');
  } catch (err) {
    console.warn('node-cron not installed. Cron jobs disabled.');
  }
}

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Schedule cron job for settlement reminders (runs daily at 9 AM)
// Note: You'll need to install node-cron: npm install node-cron
if (process.env.ENABLE_CRON_JOBS === 'true') {
  cron.schedule('0 9 * * *', () => {
    console.log('Running settlement reminder job...');
    sendSettlementReminders();
  });
  console.log('Cron jobs enabled');
}
