const tours = [
  {
    title: 'Sidebar',
    steps: [
      {
        target: '#sidebar .local-toggle-sidebar',
        content: 'This is the sidebar. It can be toggled with this button.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '#sidebar .controls',
        content: 'Add assignments or exams quickly here',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      },
      {
        target: '#sidebar .panel-tabs .schedule',
        content:
          '<b>Today\'s Agenda</b> shows your classes and schedule study/work times for the day',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      },
      {
        target: '#sidebar .panel-tabs .assessments',
        content:
          '<b>Pressing Coursework</b> shows the most important assignments and exams coming up',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      },
      {
        target: '#sidebar .panel-tabs .courseList',
        content:
          '<b>Courses</b> allows easy access to your courses and extra info by clicking on them',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      },
      {
        target: '#sidebar .panel-tabs .todos',
        content: '<b>Todos</b> allows you to save to-dos for yourself',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      }
    ]
  },
  {
    title: 'Navbar',
    steps: [
      {
        target: '#top-navbar .home-link',
        content:
          'The Dashboard shows a weekly <b>Calendar</b> of your courses, upcoming coursework, and scheduled study/work time as well as an <b>Overview</b> that shows a timeline of your current day and the locations of your events.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '#top-navbar .coursework-link',
        content:
          '<b>Coursework</b> is where you manage all of your assignments and exams. You can view upcoming work, browse past work, and see a monthly calendar of the entire semester.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '#top-navbar .tools-link',
        content:
          '<b>Tools</b> contains a variety of useful tools such as a work/study timer, RPI quick links, and grade calculators!',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '#top-navbar .announcement-icon',
        content:
          '<b>Announcements</b> holds announcements from the administrators about site updates and issues.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '#top-navbar .tours-icon',
        content:
          '<b>Tours</b> lists all the tours (such as this current one) you can take.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '#top-navbar .user-dropdown',
        content:
          'Here you can edit your account, view statistics on your coursework, logout, etc.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      }
    ]
  },
  {
    title: 'Dashboard',
    route: { name: 'dashboard-calendar' },
    steps: [
      {
        target: '#calendar-holder',
        content: 'This calendar shows you everything in your schedule, courses, unavailability, and study/work blocks.',
        params: {
          placement: 'top',
          enableScrolling: false
        }
      },
      {
        target: '#fullscreen-button',
        content: '[ FILL ME OUT ]'
      }
    ]
  },
  {
    title: 'Assignment Overview',
    route: '/coursework/a/latest',
    steps: [
      {
        target: '.assessment-overview-title .course-tag',
        content: 'Click here to view info on the course.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.assessment-overview-title .pad',
        content: 'You can view and edit the title here.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.assessment-overview-title .toggle-complete',
        content:
          'Mark the assignment as complete or incomplete with this button.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.assessment-stats',
        content:
          'View and edit the priority, due date, and scheduled work time left here.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '#assignment-overview-tabs .schedule',
        content:
          'Schedule times to work on the assignment around your courses and unavailability here.',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      },
      {
        target: '#assignment-overview-tabs .comments',
        content:
          'Leave comments with updates/details/links/etc on the assignment here.',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      },
      {
        target: '#assignment-overview-tabs .related',
        content: 'Browse similar assignments here.',
        params: {
          placement: 'right',
          enableScrolling: false
        }
      },
      {
        target: '.assessment-actions .share-assignment',
        content:
          'Toggle sharing the assignment with other students to collaborate here.',
        params: {
          placement: 'top',
          enableScrolling: false
        }
      }
    ]
  },
  {
    title: 'GPA Calculator',
    route: { name: 'gpa-calculator' },
    steps: [
      {
        target: '.gpa-calculator .add-course',
        content:
          'Manually add your courses here, you will then specify how many credits it is worth.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.gpa-calculator .auto-fill-courses',
        content: 'Fill in your actual courses and their credit counts.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.gpa-calculator .clear-courses',
        content: 'Reset the courses here.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      }
    ]
  },
  {
    title: 'Course Grade Calculator',
    route: { name: 'course-grade-estimator' },
    steps: [
      {
        target: '.course-grade-estimator',
        content:
          'Use this <b>Course Grade Estimator</b> to take in the grading categories for a course and determine what final grade you will get.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.course-grade-estimator .choose-course',
        content:
          'Choose a course here and you can save the categories with the button below later on.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.course-grade-estimator .add-category',
        content:
          'Add grading categories and their weight here, e.g. <code>30% Homework</code> or <code>15% Quizzes</code> here.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      },
      {
        target: '.course-grade-estimator .total-weight',
        content:
          'This is the total weight of your added categories, it must add up to <b>100%</b> in order to see the calculated grade.',
        params: {
          placement: 'bottom',
          enableScrolling: false
        }
      }
    ]
  }
]

export default tours
