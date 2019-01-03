const cron = require('node-cron');
const logger = require('../modules/logger');

const { upcomingWorkBlockReminders } = require('../integrations/reports');

upcomingWorkBlockReminders();
cron.schedule('*/15 * * * *', () => {
  upcomingWorkBlockReminders();
});
