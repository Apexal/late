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
          class="icon margin-left is-pulled-right"
        >
          <i class="fas fa-pencil-alt" />
        </router-link>
        <div
          class="tag section-tag is-pulled-right"
          :style="{ 'background-color': course.color }"
        >
          Section {{ course.section_id }}
        </div>
        <h2 class="subtitle course-longname">
          {{ course.longname }}
          <br>
          <small class="has-text-grey course-summary">
            {{ course.summary }}
          </small>
        </h2>

        <hr class="small-margin">

        <router-link
          v-for="assessment in upcomingAssessments"
          :key="assessment._id"
          class="tag"
          :style="{ backgroundColor: course.color, color: 'white' }"
          :to="`/${assessment.assessmentType}s/${assessment._id}`"
        >
          {{ assessment.title }}
        </router-link>

        <hr class="small-margin">

        <ul
          v-if="course.links && course.links.length > 0"
          class="course-links"
        >
          <li
            v-for="l in course.links"
            :key="l"
          >
            <a
              :href="l"
              target="_blank"
            >
              {{ linkDisplay(l) }}
            </a>
          </li>
        </ul>
        <span
          v-else
          class="has-text-centered has-text-grey"
        >
          No links added.
        </span>

        <hr class="small-margin">

        <div class="buttons">
          <button
            class="button is-info"
            @click="addAssessment('assignment')"
          >
            <i class="fa fa-clipboard-list" />
            Add Assignment
          </button>
          <button
            class="button is-info"
            @click="addAssessment('exam')"
          >
            <i class="fa fa-file-alt" />
            Add Exam
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseModal',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    course: { type: Object, required: true }
  },
  computed: {
    upcomingAssessments () {
      const assignments = this.$store.state.work.upcomingAssignments.filter(a => a.courseCRN === this.course.crn).map(a => Object.assign({ assessmentType: 'assignment' }, a));
      const exams = this.$store.state.work.upcomingExams.filter(ex => ex.courseCRN === this.course.crn).map(ex => Object.assign({ assessmentType: 'exam' }, ex));

      return assignments.concat(exams);
    }
  },
  methods: {
    linkDisplay (href) {
      href = href.replace('https://', '').replace('http://', '').replace('www.', '');
      if (href.length > 30) href = href.substr(0, 30) + '...';
      return href;
    },
    addAssessment (assessmentType) {
      this.$store.commit('CLOSE_COURSE_MODAL');
      this.$store.commit(
        'SET_ADD_' + assessmentType.toUpperCase() + '_MODAL_COURSE_CRN',
        this.course.crn
      );
      this.$store.commit('TOGGLE_ADD_' + assessmentType.toUpperCase() + '_MODAL');
    }
  }
};
</script>

<style lang="scss" scoped>
.section-tag {
  color: white;
}

.course-links {
  overflow: auto;
}

.buttons {
  button {
    i.fa {
      margin-right: 3px;
    }
  }
}

.small-margin {
  margin: 12px 0;
}
</style>
