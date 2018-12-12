const cron = require('node-cron');
const logger = require('../modules/logger');

const sendEmailMorningReports = require('./morningreports');

/* Daily at 6 AM send email reports */
cron.schedule('0 6 * * *', sendEmailMorningReports);
logger.info('Scheduled morning email reports daily at 6 AM\t[0 6 * * *]');
