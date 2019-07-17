import moment from 'moment';

const element = (tag, properties) => {
  let el = document.createElement(tag);
  for (let prop in properties) {
    el[prop] = properties[prop];
  }

  return el;
};

export default {
  methods: {
    eventRender ({ event, el, view }) {
      if (event.rendering === 'background') return;

      const { eventType, assessment, course, period, block } = event.extendedProps;

      if (view.type === 'dayGridMonth') {
        if (
          this.filter && (this.filter.includes(assessment.courseCRN) ||
          (eventType === 'assignment' &&
          (!this.showCompleted && assessment.completed)))
        ) {
          return false;
        }
      }

      el.title = event.title;

      const addIcon = (iconName, selector = '.fc-content', prepend = true) => {
        const icon = document.createElement('i');
        icon.className = 'fas ' + iconName;
        el.querySelector(selector)[prepend ? 'prepend' : 'append'](icon);
      };

      if (eventType === 'course') {
        el.title = `${event.title} | ${period.location}`;

        if (period.type === 'TES') {
          return !!this.$store.state.assessments.upcomingAssessments.find(
            assessment =>
              assessment.assessmentType === 'exam' &&
              assessment.courseCRN === course.crn &&
              moment(assessment.date).isSame(event.start, 'day')
          );
        }

        addIcon('fa-graduation-cap', '.fc-title');

        el.querySelector('.fc-content').append(element('i', { className: 'event-location', innerText: period.location }));
      } else if (eventType === 'assignment') {
        addIcon('fa-clipboard-check');

        if (assessment.shared) addIcon('fa-users is-pulled-right');
      } else if (eventType === 'exam') {
        addIcon('fa-exclamation-triangle');
      } else if (eventType === 'academic-calendar-event') {
        addIcon('fa-info-circle');
        el.title = 'Click for full message.';
      } else if (eventType === 'work-block') {
        el.title = `${
          assessment.assessmentType === 'assignment'
            ? 'Work on'
            : 'Study for'
        } ${assessment.title}${
          block.location ? ' | ' + block.location : ''
        }`;

        el
          .querySelector('.fc-time')
          .append(element('span', { innerText: ' | ' + (assessment.assessmentType === 'assignment' ? 'Work' : 'Study') }));

        // --- DELETE BUTTON ---
        const deleteButton = element('span', { className: 'delete remove-work-block', title: 'Unschedule' });
        deleteButton.onclick = async ev => {
          ev.stopPropagation();

          let updatedAssessment = await this.$store.dispatch(
            'REMOVE_WORK_BLOCK',
            {
              assessment: assessment,
              blockID: block._id
            }
          );

          this.$emit('updated-assessment', updatedAssessment);
          this.$socket.emit('updated assessment', updatedAssessment);

          this.$toast.open({
            message: 'Unscheduled work block!',
            type: 'is-primary'
          });
        };
        el.querySelector('.fc-content').append(deleteButton);
        // ---------------------


        // --- LOCATION ---
        const locationEl = document.createElement('i');
        locationEl.title = 'Click to set location';
        if (block.location) {
          locationEl.innerText = block.location;
        } else {
          locationEl.className = 'fas fa-map-marker-alt';
        }
        locationEl.classList.add('event-location');
        locationEl.onclick = ev => {
          ev.stopPropagation();
          this.$dialog.prompt({
            message: 'Where do you want this to be?',
            inputAttrs: {
              placeholder: block.location
                ? block.location
                : 'e.g. Bray Hall Classroom',
              maxlength: 200
            },
            onConfirm: async location => {
              const updatedAssessment = await this.$store.dispatch(
                'EDIT_WORK_BLOCK',
                {
                  assessment: assessment,
                  blockID: block._id,
                  start: event.start,
                  end: event.end,
                  location
                }
              );

              this.$emit('updated-assessment', updatedAssessment);
              this.$socket.emit('updated assessment', updatedAssessment);
            }
          });
        };
        el.querySelector('.fc-content').append(locationEl);
        // ----------------

        // --- SHARED ICON ---
        if (assessment.shared && block.shared) addIcon('fa-users margin-left', '.fc-title', false);
        // -------------------
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
