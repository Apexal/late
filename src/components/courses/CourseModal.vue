<template>
  <div
    class="modal course-modal"
    :class="{'is-active': open}"
  >
    <div
      class="modal-background"
      @click="$store.commit('CLOSE_COURSE_MODAL')"
    />
    <div class="modal-content">
      <div class="box">
        <router-link
          title="Edit course info and links."
          :to="{ name: 'setup-course-schedule' }"
          class="button is-small margin-left is-pulled-right"
        >
          <i class="fas fa-pencil-alt" />
        </router-link>
        <div
          class="tag section-tag is-pulled-right"
          :style="{ 'background-color': course.color }"
          :title="'You are in section ' + course.section_id"
        >
          Section {{ course.section_id }}
        </div>
        <h2
          class="subtitle course-longname"
          :title="course.original_longname + ' - ' + course.summary + ' - ' + course.section_id"
        >
          {{ course.longname }}
          <br>
          <small class="has-text-grey course-summary">
            {{ course.summary }}
          </small>
        </h2>

        <div class="tabs is-centered">
          <ul>
            <li
              :class="{ 'is-active': activeTab === 'CourseModalUpcoming' }"
              @click="activeTab = 'CourseModalUpcoming'"
            >
              <a>
                <span class="icon is-small">
                  <i
                    class="fas fa-clipboard-list"
                    aria-hidden="true"
                  />
                </span>
                <span>Upcoming</span>
                <span class="tag">
                  {{ upcomingAssessments.length }}
                </span>
              </a>
            </li>
            <li
              :class="{ 'is-active': activeTab === 'CourseModalSchedule' }"
              @click="activeTab = 'CourseModalSchedule'"
            >
              <a>
                <span class="icon is-small">
                  <i
                    class="far fa-clock"
                    aria-hidden="true"
                  />
                </span>
                <span>Schedule</span>
              </a>
            </li>
            <li
              :class="{ 'is-active': activeTab === 'CourseModalLinks' }"
              @click="activeTab = 'CourseModalLinks'"
            >
              <a>
                <span class="icon is-small">
                  <i
                    class="fas fa-link"
                    aria-hidden="true"
                  />
                </span>
                <span>Links</span>
                <span class="tag">
                  {{ course.links.length }}
                </span>
              </a>
            </li>
          </ul>
        </div>

        <Component
          :is="activeTab"
          :course="course"
          :upcoming-assessments="upcomingAssessments"
        />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

// Tabs
import CourseModalUpcoming from './CourseModalUpcoming';
import CourseModalLinks from './CourseModalLinks';

export default {
  name: 'CourseModal',
  components: { CourseModalUpcoming, CourseModalLinks },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    course: { type: Object, required: true }
  },
  data () {
    return {
      activeTab: 'CourseModalUpcoming'
    };
  },
  computed: {
    upcomingAssessments () {
      const limit = moment().add(1, 'week');
      const assignments = this.$store.state.work.upcomingAssignments
        .filter(
          a => moment(a.date).isBefore(limit) && a.courseCRN === this.course.crn
        )
        .map(a => Object.assign({ assessmentType: 'assignment' }, a));

      const exams = this.$store.state.work.upcomingExams
        .filter(
          ex =>
            moment(ex.date).isBefore(limit) && ex.courseCRN === this.course.crn
        )
        .map(ex => Object.assign({ assessmentType: 'exam' }, ex));

      return assignments.concat(exams).slice(0, 4);
    }
  },
  methods: {
    addAssessment (assessmentType) {
      this.$store.commit('CLOSE_COURSE_MODAL');
      this.$store.commit(
        'SET_ADD_' + assessmentType.toUpperCase() + '_MODAL_COURSE_CRN',
        this.course.crn
      );
      this.$store.commit(
        'TOGGLE_ADD_' + assessmentType.toUpperCase() + '_MODAL'
      );
    }
  }
};
</script>

<style lang="scss" scoped>
h2.subtitle.course-longname {
  margin-bottom: 0;
}
.section-tag {
  color: white;
}
</style>
