require('dotenv').config();
require('../db');

const smsUtils = require('./sms').utils;
const discord = require('./discord');
const moment = require('moment');
const logger = require('../modules/logger');

const Assignment = require('../api/assignments/assignments.model');
const Exam = require('../api/exams/exams.model');
const Term = require('../api/terms/terms.model');
const Block = require('../api/blocks/blocks.model');

async function upcomingWorkBlockReminders () {
  logger.info('Finding all upcoming work blocks to send reminders.');
  const terms = await Term.find().sort({ start: -1 });
  const currentTerm = terms.find(t => t.isCurrent);

  // Globally find all work blocks starting within 20 minutes
  const nowPlus20min = moment().add('20', 'minutes');
  const upcomingWorkBlocks = await Block.find({
    startTime: {
      $gt: new Date(),
      $lte: nowPlus20min
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
    logger.info(
      `Reminding user ${block._student.rcs_id} about ${assessment.title}`
    );

    // Text student
    const integration =
      block._student.notificationPreferences.preWorkBlockReminders;

    if (integration === 'sms') {
      await smsUtils.generateWorkBlockReminder(
        terms,
        block._student,
        assessmentType,
        assessment,
        block
      );
    } else if (integration === 'discord') {
      await discord.utils.generateWorkBlockReminder(
        discord.client,
        terms,
        block._student,
        assessmentType,
        assessment,
        block
      );
    }

    block.notified = true;
    await block.save();
  }
}

module.exports = {
  upcomingWorkBlockReminders
};
