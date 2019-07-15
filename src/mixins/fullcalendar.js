import moment from 'moment';

export default {
  methods: {
    eventRender ({ event, el, view }) {
      const { eventType, assessment, course, period, block } = event.extendedProps;
      const { assessmentType } = assessment;

      if (
        this.filter && (this.filter.includes(assessment.courseCRN) ||
        (eventType === 'assignment' &&
        (!this.showCompleted && assessment.completed)))
      ) {
        return false;
      }

      el.title = event.title;

      const addIcon = (iconName, selector = '.fc-content') => {
        const icon = document.createElement('i');
        icon.className = 'fas ' + iconName;
        el.querySelector(selector).prepend(icon);
      };

      if (eventType === 'course') {
        el.title = `${event.title} | ${event.period.location}`;

        if (
          !moment(event.end).isBetween(
            course.startDate,
            course.endDate
          )
        ) {
          return false;
        }

        if (period.type === 'TES') {
          return !!this.$store.state.assessments.upcomingAssessments.find(
            assessment =>
              assessmentType === 'exam' &&
              assessment.courseCRN === course.crn &&
              moment(assessment.date).isSame(event.start, 'day')
          );
        }

        addIcon('fa-graduation-cap', '.fc-title');

        const locationElement = document.createElement('i');
        locationElement.className = 'event-location';
        locationElement.innerText = event.period.location;
        el.find('.fc-content').append(locationElement);
      } else if (eventType === 'assignment') {
        addIcon('fa-clipboard-check');

        if (assessment.shared) addIcon('fa-users is-pulled-right');
      } else if (eventType === 'exam') {
        addIcon('fa-exclamation-triangle');
      } else if (eventType === 'academic-calendar-event') {
        addIcon('fa-info-circle');
      }
    },
    dateClick ({ date }) {
      date = moment(date);

      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', { dueDate: date });
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', { date });

      this.$toast.open({
        message:
          'Add a new assignment or exam with the buttons below the calendar!',
        position: 'is-bottom-left'
      });
    }
  }
};
