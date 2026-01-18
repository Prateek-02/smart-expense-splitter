const { sendSettlementReminders } = require('../controllers/notificationController');

/**
 * Job to send settlement reminders
 * This can be called by cron or scheduled task runner
 */
const runReminderJob = async () => {
  try {
    console.log('Starting settlement reminder job...');
    await sendSettlementReminders();
    console.log('Settlement reminder job completed');
  } catch (error) {
    console.error('Error in settlement reminder job:', error);
  }
};

module.exports = {
  runReminderJob,
};
