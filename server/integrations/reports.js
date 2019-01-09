require('dotenv').config();
require('../db');

const smsUtils = require('./sms').utils;
const discordUtils = require('./discord').utils;
const moment = require('moment');
const logger = require('../modules/logger');

const Assignment = require('../api/assignments/assignments.model');
const Exam = require('../api/exams/exams.model');
const Term = require('../api/terms/terms.model');
const Block = require('../api/blocks/blocks.model');

async function upcomingWorkBlockReminders () {
  const terms = await Term.find().sort({ start: -1 });
  const currentTerm = terms.find(t => t.isCurrent);

  logger.info('Searching for upcoming work blocks to send notifications');

  // Globally find all work blocks starting within 30 minutes
  const nowPlus30min = moment().add('30', 'minutes');
  const upcomingWorkBlocks = await Block.find({
    startTime: {
      $gt: new Date(),
      $lte: nowPlus30min
    },
    notified: false
  }).populate(
    '_student',
    'rcs_id name semester_schedules integrations notificationPreferences'
  );

  for (let block of upcomingWorkBlocks) {
    // Check if user even wants these notifications
    if (!block._student.notificationPreferences.preWorkBlockReminders) continue;

    // Get assignment for this block
    let assessmentType = 'assignment';

    let assessment = await Assignment.findOne({
      _student: block._student,
      _blocks: block._id
    });

    if (!assessment) {
      assessmentType = 'exam';
      assessment = await Exam.findOne({
        _student: block._student,
        _blocks: block._id
      });
    }

    // Text student
    const integration =
    block._student.notificationPreferences.preWorkBlockReminders;

    logger.info(
      `Reminding user ${block._student.rcs_id} about ${assessment.title} through ${integration}`
    );

    if (integration === 'sms') {
      await smsUtils.generateWorkBlockReminder(
        terms,
        block._student,
        assessmentType,
        assessment,
        block
      );
    }
  }

  logger.info('Done sending pre-work block notifications.');
}

async function nightlyReport (integration = 'sms') {
  const terms = await Term.find().sort({ start: -1 });
  // Get all missed assignments
  // Missed means (!a.completed && a.dueDate > moment().startOf('day) && a.dueDate < new Date())
  const missedAssignments = await Assignment.getAllMissedAssignmentsForDay(
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
      smsUtils.generateNightlyReport(terms, student, missed);
      logger.info('[Sent text]');
    } else if (integration === 'discord') {
      discordUtils.sendNightlyReportMessage(terms, student, missed);
      logger.info('[Sent Discord DM]');
    }
  }
}

module.exports = {
  upcomingWorkBlockReminders,
  nightlyReport
};
