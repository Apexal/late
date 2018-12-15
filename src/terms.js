const moment = require('moment');
/* Info from https://info.rpi.edu/registrar/academic-calendar */

const list = [
  {
    name: 'Fall 2018',
    code: '201809',
    start: moment('2018-08-30', 'YYYY-MM-DD', true),
    end: moment('2018-12-22', 'YYYY-MM-DD', true),
    isBreak: false
  },
  {
    name: 'Spring 2019',
    code: '201901',
    start: moment('2019-01-09', 'YYYY-MM-DD', true),
    end: moment('2019-05-04', 'YYYY-MM-DD', true),
    isBreak: false
  },
  {
    name: 'Summer 2019',
    code: '201905',
    start: moment('2019-05-05', 'YYYY-MM-DD', true),
    end: moment('2019-09-04', 'YYYY-MM-DD', true), // not confirmed
    isBreak: false
  }
];

export default {
  current: () => list.find(t => moment().isBetween(t.start, t.end)) || null,
  list
};
