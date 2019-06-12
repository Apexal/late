const tours = [
  {
    title: 'Sidebar',
    steps: [
      {
        target: '#sidebar .local-toggle-sidebar',
        content: 'This is the sidebar. It can be toggled with this button.',
        params: {
          placement: 'bottom'
        }
      },
      {
        target: '#sidebar .controls',
        content: 'Add assignments or exams quickly here',
        params: {
          placement: 'right'
        }
      },
      {
        target: '#sidebar .panel-tabs .schedule',
        content:
          '<b>Today\'s Agenda</b> shows your classes and schedule study/work times for the day',
        params: {
          placement: 'right'
        }
      },
      {
        target: '#sidebar .panel-tabs .assessments',
        content:
          '<b>Pressing Coursework</b> shows the most important assignments and exams coming up',
        params: {
          placement: 'right'
        }
      },
      {
        target: '#sidebar .panel-tabs .courseList',
        content:
          '<b>Courses</b> allows easy access to your courses and extra info by clicking on them',
        params: {
          placement: 'right'
        }
      },
      {
        target: '#sidebar .panel-tabs .todos',
        content: '<b>Todos</b> allows you to save to-dos for yourself',
        params: {
          placement: 'right'
        }
      }
    ]
  },
  {
    title: 'Dashboard',
    route: { name: 'home' },
    steps: [
      {
        target: '#calendar-holder',
        content: '[ FILL ME OUT ]',
        params: {
          placement: 'top'
        }
      },
      {
        target: '#fullscreen-button',
        content: '[ FILL ME OUT ]'
      }
    ]
  }
];

export default tours;
// export default {
//   sidebar: ,
//   'upcoming-assignments': [
//     {
//       target: '#calendar-holder',
//       content: '[ FILL ME OUT ]',
//       params: {
//         placement: 'top'
//       }
//     },
//     {
//       target: '#fullscreen-button',
//       content: '[ FILL ME OUT ]'
//     }
//   ],
//   'upcoming-exams': []
// };
