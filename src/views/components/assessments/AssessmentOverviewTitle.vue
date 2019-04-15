<template>
  <div
    class="assessment-overview-title is-flex-tablet"
  >
    <div
      v-if="!editing"
      class="has-text-centered-mobile "
    >
      <span
        class="tag is-medium course-tag"
        :style="{ 'background-color': course.color }"
        @click="$store.commit('OPEN_COURSE_MODAL', course)"
      >
        <b class="course-longname">{{ course.longname }}</b>
        {{ assessment.passed ? 'Past ': '' }}{{ assessmentType === 'assignment' && assessment.isRecurring ? 'Recurring ' : '' }}{{ capitalizedAssessmentType }}
      </span>
    </div>
    <h1
      v-if="!editing"
      class="title assessment-title has-text-centered-mobile"
      style="flex: 1"
    >
      {{ assessment.title }}
      <i
        class="fas fa-pencil-alt edit-title-icon has-text-grey"
        @click="editing = true"
      />
    </h1>
    <form
      v-else
      :style="{ flex: 1}"
      @submit.prevent="save"
    >
      <div
        class="select"
      >
        <select v-model="tempCourseCRN">
          <option
            v-for="course in courses"
            :key="course.crn"
            :value="course.crn"
          >
            {{ course.longname }}
          </option>
        </select>
      </div>
      <input
        id="edited-assessment-title"
        v-model.trim="tempTitle"
        type="text"
        class="input"
        :placeholder="assessment.title"
      >
      <i
        title="Save course and title"
        class="fa fa-check save-title-icon has-text-success"
        @click="save"
      />
    </form>

    <div
      v-if="assessmentType === 'assignment'"
      class="has-text-centered-mobile"
    >
      <button
        :title="`This assignment is ${assessment.completed ? 'completed' : 'incomplete'}!`"
        class="button is-success toggle-complete"
        :class="{ 'is-outlined': !assessment.completed }"
        @click="$emit('toggle-completed')"
      >
        <i
          class="fa-check-square"
          :class="[assessment.completed ? 'fas' : 'far']"
        />
        {{ assessment.completed ? 'Completed' : 'Incomplete' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewTitle',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editing: false,
      tempCourseCRN: this.assessment.courseCRN,
      tempTitle: this.assessment.title
    };
  },
  computed: {
    courses () {
      return this.$store.getters.current_schedule;
    },
    assessmentType () {
      return this.assessment.assessmentType;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    capitalizedAssessmentType () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    }
  },
  watch: {
    editing (newEditing) {
      this.tempCourseCRN = this.assessment.courseCRN;
      this.tempTitle = this.assessment.title;
    }
  },
  methods: {
    async save () {
      if (this.tempCourseCRN === this.assessment.courseCRN && this.tempTitle === this.assessment.title) {
        this.editing = false;
        return;
      }

      let request;
      try {
        request = await this.$http.patch(
          `/${this.assessmentType}s/${this.assessmentType.charAt(0)}/${
            this.assessment._id
          }`,
          { title: this.tempTitle, courseCRN: this.tempCourseCRN }
        );
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.editing = false;
        return;
      }

      // Calls API and updates state
      if (
        // eslint-disable-next-line
          this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
      ) {
        this.$store.dispatch(
          'UPDATE_UPCOMING_ASSESSMENT',
          request.data[`updated${this.capitalizedAssessmentType}`]
        );
      } else {
        this.$emit(
          'update-assessment',
          request.data[`updated${this.capitalizedAssessmentType}`]
        );
      }

      this.editing = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.edit-title-icon {
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  vertical-align: middle;
  font-size: 0.7em;
}
.save-title-icon {
  cursor: pointer;
  vertical-align: middle;
  margin-left: 10px;
  font-size: 1.3em;
}
.assessment-overview-title {
  align-items: center;

  &:hover {
    .edit-title-icon {
      opacity: 1;
    }
  }
}

#edited-assessment-title {
  width: 80%;
}

.assessment-title {
  margin-bottom: 0;
}

.toggle-complete {
  i {
    margin-right: 5px;
  }
  @media only screen and (max-width: 768px) {
    margin-top: 5px;
  }
}

.course-tag {
  cursor: pointer;
  color: white;

  .course-longname {
    margin-right: 5px;
  }

  margin-right: 10px;
}
</style>
