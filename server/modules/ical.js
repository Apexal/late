/*
const section = {
  section_id: String,
  listing_id: String,
  original_longname: String,
  longname: String,
  crn: String,
  periods: [
    {
      day: Number,
      end: "HHmm",
      type: "LEC" | "STU" | "TES",
      start: "HHmm",
      location: String
  },
  ]
};

*/
const moment = require('moment');

function convertICalIntoCourseSchedule (cal) {
  const courseSchedule = [];

  for (let eventName in cal) {
    const event = cal[eventName];

    const longname = event.summary;

    let course = courseSchedule.find(c => c.longname === longname);
    if (!course) {
      course = {
        section_id: '00',
        listing_id: '00',
        original_longname: longname,
        longname,
        crn: '00000',
        periods: []
      };
      courseSchedule.push(course);
    }

    const day = event.start.getDay();
    const period = {
      day,
      end: moment(event.end).format('HHmm'),
      type: 'LEC',
      start: moment(event.start).format('HHmm'),
      location: '???'
    };

    course.periods.push(period);
  }

  return courseSchedule;
}

module.exports = { convertICalIntoCourseSchedule };

// var ical = require('node-ical');

// (() => {
//   const data = ical.parseFile('yacs-schedule.ics');
//   const courseSchedule = convertICalIntoCourseSchedule(data);
//   console.log(courseSchedule);
// })();
