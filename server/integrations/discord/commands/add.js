const Discord = require('discord.js');

const logger = require('../../../modules/logger');

const moment = require('moment');

const { getStudent } = require('../utils');

const Assignment = require('../../../api/assignments/assignments.model');
const Exam = require('../../../api/exams/exams.model');

module.exports = {
  name: 'add',
  alias: 'a',
  uses: {
    'Add an assignment or exam.': ''
  },
  dmEnabled: true,
  async run (client, terms, msg, args) {
    // Get student
    const student = await getStudent(msg.author);
    const currentTerm = terms.find(t => t.isCurrent);
    const courses = await student.getCoursesForTerm(currentTerm.code);

    // User hasn't used LATE yet, or has not yet connected to LATE
    if (!student) {
      return msg.reply(
        `You have not connected to LATE yet! Goto ${
          process.env.BASE_URL
        } to start.`
      );
    }

    let collected;

    // ASSESSMENT TYPE
    const controlMessage = await msg.channel.send('Do you want to add an **🇦ssignment** or **🇪xam**?');
    controlMessage.react('🇦');
    controlMessage.react('🇪');
    const assessmentTypeEmojifilter = (reaction, user) => {
      return (reaction.emoji.name === '🇦' || reaction.emoji.name === '🇪') && user.id === msg.author.id;
    };
    try {
      collected = await controlMessage.awaitReactions(assessmentTypeEmojifilter, { max: 1, time: 10000, errors: ['time'] });
    } catch (e) {
      controlMessage.edit('You didn\'t choose... Cancelling.');
      return;
    } finally {
      controlMessage.clearReactions();
    }
    const assessmentType = collected.has('🇦') ? 'assignment' : 'exam';

    // COURSE
    controlMessage.edit(`What **course** is this ${assessmentType} for? *You can don't have to type the whole course title.*`);
    const courseFilter = response => {
      return response.author.id === msg.author.id && courses.some(c => c.title.toLowerCase().startsWith(response.content.toLowerCase()));
    };
    collected = await msg.channel.awaitMessages(courseFilter, { maxMatches: 1, time: 30000, errors: ['time'] });
    const courseNameMessage = collected.first();
    const course = courses.find(c => c.title.toLowerCase().startsWith(courseNameMessage.content.toLowerCase()));
    courseNameMessage.delete();

    // TITLE
    controlMessage.edit(`What's the ${assessmentType}'s **title**?`);
    const titleFilter = response => {
      return response.author.id === msg.author.id;
    };
    collected = await msg.channel.awaitMessages(titleFilter, { maxMatches: 1, time: 30000, errors: ['time'] });
    const titleMessage = collected.first();
    const title = titleMessage.content;
    titleMessage.delete();

    // DATE
    controlMessage.edit(`When's the ${assessmentType} **due**? *Must be this format \`9/7/19 6:45 pm\`*`);
    const dueFilter = response => {
      return response.author.id === msg.author.id && moment(response.content, 'M/D/YY h:mm a').isValid();
    };
    collected = await msg.channel.awaitMessages(dueFilter, { maxMatches: 1, time: 30000, errors: ['time'] });
    const dueDateMessage = collected.first();
    const dueDate = moment(dueDateMessage.content, 'M/D/YY h:mm a');
    dueDateMessage.delete();

    controlMessage.edit(`Creating ${course.title} ${assessmentType} "${title}" due *${dueDate.fromNow()}*...`);

    // CREATE ASSESSMENT
    if (assessmentType === 'assignment') {
      const assignmentData = {
        _student: student,
        title,
        dueDate: dueDate.toDate(),
        courseCRN: course.crn,
        timeEstimate: 2,
        timeRemaining: 2
      };
      const newAssignment = new Assignment(assignmentData);
      await newAssignment.save();

      controlMessage.edit(`**Success!** | View the assignment at ${process.env.BASE_URL}/coursework/a/${newAssignment._id}`);
      logger.info(`Created new assignment for ${student.rcs_id} from Discord.`);
    } else {
      const examData = {
        _student: student,
        title,
        date: dueDate.toDate(),
        courseCRN: course.crn,
        timeEstimate: 5,
        timeRemaining: 5
      };
      const newExam = new Exam(examData);
      await newExam.save();

      controlMessage.edit(`**Success!** | View the exam at ${process.env.BASE_URL}/coursework/e/${newExam._id}`);
      logger.info(`Created new exam for ${student.rcs_id} from Discord.`);
    }
  }
};
