<template>
  <div class="assessment-overview-title is-flex-tablet">
    <router-link
      :to="{ name: 'coursework-upcoming' }"
      class="button is-link tooltip is-tooltip-bottom backButton"
      :data-tooltip="`Browse all course work.`"
    >
      <span class="icon">
        <i class="fas fa-angle-left" />
      </span>
    </router-link>

    <div
      v-if="!editing"
      class="has-text-centered-mobile"
    >
      <span
        class="tag is-medium course-tag"
        :style="{ 'background-color': course.color }"
        @click="$store.commit('OPEN_COURSE_MODAL', course)"
      >
        <b class="course-title">{{ course.title }}</b>
        {{ assessment.passed ? "Past " : ""
        }}{{
          assessmentType === "assignment" && assessment.isRecurring
            ? "Recurring "
            : ""
        }}{{ capitalizedAssessmentType }}
      </span>
    </div>
    <h1
      v-if="!editing"
      class="title assessment-title has-text-centered-mobile"
      style="flex: 1"
    >
      <span class="pad">
        {{ assessment.title }}
      </span>
      <i
        title="Edit title"
        class="fas fa-pencil-alt edit-title-icon has-text-grey"
        @click="editing = true"
      />
    </h1>
    <form
      v-else
      :style="{ flex: 1 }"
      @submit.prevent="save"
    >
      <div class="select">
        <select v-model="tempCourseCRN">
          <option
            v-for="course in courses"
            :key="course.crn"
            :value="course.crn"
          >
            {{ course.title }}
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
        :title="toggleButtonTitle"
        class="button is-success toggle-complete"
        :class="{ 'is-outlined': !assessment.completed }"
        @click="$emit('toggle-completed')"
      >
        <i
          class="fa-check-square"
          :class="[assessment.completed ? 'fas' : 'far']"
        />
        {{ assessment.completed ? "Completed" : "Incomplete" }}
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
    assessmentType () {
      return this.assessment.assessmentType;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    capitalizedAssessmentType () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    },
    toggleButtonTitle () {
      return this.assessment.completed
        ? `Completed ${this.shortDateTimeFormat(this.assessment.completedAt)}`
        : 'Click to mark as completed.';
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
      if (
        this.tempCourseCRN === this.assessment.courseCRN &&
        this.tempTitle === this.assessment.title
      ) {
        this.editing = false;
        return;
      }

      let updatedAssessment;
      try {
        updatedAssessment = await this.$store.dispatch(
          'UPDATE_ASSESSMENT',
          Object.assign(this.assessment, {
            title: this.tempTitle,
            courseCRN: this.tempCourseCRN
          })
        );
      } catch (e) {
        this.editing = false;
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        return;
      }

      this.$emit('updated-assessment', updatedAssessment);
      this.$toast.open({
        message: 'Updated the title and course!',
        type: 'is-success'
      });

      this.editing = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.backButton {
  height: 2em;
  margin-right: 5px;
}

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
  z-index: 5;
  position: sticky;
  top: 70px;
  align-items: center;

  .pad {
    background-color: white;
    border-radius: 10px;
    padding: 0 10px;
  }

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

  .course-title {
    margin-right: 5px;
  }

  margin-right: 10px;
}
</style>
