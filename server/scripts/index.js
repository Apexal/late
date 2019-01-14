const cron = require('node-cron');
const logger = require('../modules/logger');

const { upcomingWorkBlockReminders } = require('../integrations/reports');

setTimeout(upcomingWorkBlockReminders, 5000);
cron.schedule('*/10 * * * *', () => {
  upcomingWorkBlockReminders();
});
