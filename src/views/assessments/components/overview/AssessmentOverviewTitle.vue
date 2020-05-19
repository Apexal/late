<!--Assessments: assessment overview title module-->
<template>
  <div class="assessment-overview-title is-flex-desktop">
    <div
      v-if="assessmentType === 'assignment'"
      class="is-hidden-touch"
    >
      <button
        :title="toggleButtonTitle"
        class="button is-success toggle-complete"
        :class="{'is-outlined': !assessment.completed}"
        :disabled="!isOwner"
        @click="$emit('toggle-completed')"
      >
        <i
          class="fa-check-square"
          :class="[assessment.completed ? 'fas' : 'far']"
        />
        {{ assessment.completed ? "Mark Incomplete" : "Mark Complete" }}
      </button>
    </div>

    <h1
      v-if="!editing"
      class="title assessment-title has-text-centered-touch"
      style="flex: 1"
    >
      <span class="pad">{{ assessment.title }}</span>
      <i
        v-if="assessmentType === 'assignment' && assessment.shared"
        class="fas fa-users has-text-grey-light"
        title="Shared assignment"
      />
      <i
        v-if="assessmentType === 'exam' || isOwner"
        title="Edit title"
        class="fas fa-pencil-alt edit-title-icon has-text-grey"
        @click="editing = true"
      />
    </h1>
    <form
      v-else
      :style="{flex: 1}"
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
      v-if="!editing"
      class="has-text-centered-touch"
    >
      <div
        class="tag is-medium course-tag"
        :style="{'background-color': course.color}"
      >
        <router-link
          :to="{name: 'coursework-upcoming'}"
          class="tooltip has-tooltip-bottom has-text-white back-button"
          data-tooltip="Browse all course work."
        >
          <i class="fas fa-angle-left" />
        </router-link>
        <span
          class="tooltip has-tooltip-bottom"
          :class="assessmentType"
          :data-tooltip="`${course.title} ${capitalizedAssessmentType}`"
          @click="$store.commit('OPEN_COURSE_MODAL', course)"
        >
          <b class="course-title">{{ course.title }}</b>
          <span class="margin-right">
            {{ assessment.passed ? "Past " : ""
            }}{{
              assessmentType === "assignment" && assessment.isRecurring
                ? "Recurring "
                : ""
            }}
          </span>
          <i
            class="fas"
            :class="
              assessmentType === 'assignment'
                ? 'fa-clipboard-check'
                : 'fa-exclamation-triangle'
            "
          />
        </span>
      </div>

      <b-button
        v-if="assessmentType === 'assignment'"
        class="is-hidden-desktop touch-complete-button"
        type="is-success"
        :outlined="!assessment.completed"
        :disabled="!isOwner"
        @click="$emit('toggle-completed')"
      >
        <i
          class="fa-check-square"
          :class="[assessment.completed ? 'fas' : 'far']"
        />
      </b-button>
    </div>
  </div>
</template>

<script>
import assessmentsMixin from '@/mixins/assessments'

export default {
  name: 'AssessmentOverviewTitle',
  mixins: [assessmentsMixin],
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
    }
  },
  computed: {
    toggleButtonTitle () {
      return this.assessment.completed
        ? `Completed ${this.shortDateTimeFormat(this.assessment.completedAt)}`
        : 'Click to mark as completed.'
    }
  },
  watch: {
    assessment (newAssessment) {
      this.editing = false
    },
    editing (newEditing) {
      this.tempCourseCRN = this.assessment.courseCRN
      this.tempTitle = this.assessment.title
    }
  },
  methods: {
    async save () {
      if (
        (this.tempCourseCRN === this.assessment.courseCRN &&
        this.tempTitle === this.assessment.title) ||
        !this.isOwner
      ) {
        this.editing = false
        return
      }

      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessmentType,
          updates: {
            title: this.tempTitle,
            courseCRN: this.tempCourseCRN
          }
        })
      } catch (e) {
        this.editing = false
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', updatedAssessment)
      this.$buefy.toast.open({
        message: 'Updated the title and course!',
        type: 'is-success'
      })

      this.editing = false
    }
  }
}
</script>

<style lang="scss" scoped>
.assignment {
  border-radius: 5px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}

.touch-complete-button {
  height: 2em;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.edit-title-icon {
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  vertical-align: middle;
  font-size: 0.7em;
  position: absolute;
  top: 10px;
}
.save-title-icon {
  cursor: pointer;
  vertical-align: middle;
  margin-left: 10px;
  font-size: 1.3em;
}
.assessment-overview-title {
  flex-direction: row-reverse;
  z-index: 5;
  position: sticky;
  top: 60px;
  align-items: center;

  .pad {
    background-color: white;
    border-radius: 4px;
    padding: 0 10px;
    margin-right: -10px;
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
  border-radius: 4px;
  .back-button {
    margin-right: 5px;
  }
  &.exam {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .course-title {
    margin-right: 5px;
  }

}

.margin-right {
  margin-right: 5px;
}
</style>
