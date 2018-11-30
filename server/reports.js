const smsUtils = require('./sms').utils;
const discordUtils = require('./discord').utils;
const db = require('../db').models;
const moment = require('moment');
const logger = require('./logger');

async function nightlyReport (integration = 'sms') {
  // Get all missed assignments
  // Missed means (!a.completed && a.dueDate > moment().startOf('day) && a.dueDate < new Date())
  const missedAssignments = await db.Assignment.getAllMissedAssignmentsForDay(
    moment().startOf('day')
  );
  const students = [];

  for (let a of missedAssignments) {
    if (students.includes(a._student)) continue;
    students.push(a._student);
  }

  for (let student of students) {
    logger.info('Compiling nightly progress report to ' + student.rcs_id);
    const missed = missedAssignments.filter(a => a._student === student);

    if (integration === 'sms') {
      smsUtils.generateNightlyReport(student, missed);
      logger.info('[Sent text]');
    } else if (integration === 'discord') {
      discordUtils.sendNightlyReportMessage(student, missed);
      logger.info('[Sent Discord DM]');
    }
  }
}

nightlyReport('sms');
