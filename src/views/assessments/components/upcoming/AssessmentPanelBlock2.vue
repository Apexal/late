<template>
  <div
    class="assessment panel-block is-flex"
    :class="{'is-completed': assessment.completed}"
  >
    <div class="holder is-flex">
      <span
        class="icon assessment-icon"
        :style="{color: course.color}"
        @click="$store.commit('OPEN_COURSE_MODAL', course)"
      >
        <i
          v-if="assessmentType === 'exam'"
          class="fas fa-exclamation-triangle"
        />
        <i
          v-else-if="assessmentType === 'assignment'"
          class="fas fa-clipboard-check"
        />
      </span>

      <div
        class="is-flex vertical"
        style="flex: 1"
      >
        <strong
          class="course-title"
          :class="{'has-text-grey': assessmentType === 'assignment' && assessment.completed} "
        >{{ course.title }}</strong>
        <span
          class="assessment-title"
          :class="{'has-text-grey': assessmentType === 'assignment' && assessment.completed} "
        >

          {{ assessment.title }}
        </span>
      </div>
      <span class="has-text-grey assessment-time">{{ assessmentTime }}</span>
    </div>
    <div
      class="behind is-flex has-text-white"
      :class="coverClass"
    >
      <span
        v-if="assessmentType === 'assignment'"
        class="icon toggle-assignment"
        :title="'Mark ' + (assessment.completed ? 'incomplete' : 'complete')"
        @click="toggleAssignment"
      >
        <i
          class="fas"
          :class="assessment.completed ? 'fa-times' : 'fa-check'"
        />
      </span>
      <router-link
        :to="routeTo"
        tag="span"
        class="icon"
        :title="'View ' + assessmentType "
      >
        <i class="fas fa-info-circle" />
      </router-link>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AssessmentPanelBlock',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  computed: {
    assessmentType () {
      return this.assessment.assessmentType
    },
    assessmentTime () {
      return moment(this.assessment.date).format('h:mma')
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN)
    },
    coverClass () {
      if (this.assessmentType === 'assignment') {
        return this.assessment.completed ? 'has-background-success' : 'has-background-danger'
      }

      return 'has-background-dark'
    },
    routeTo () {
      return {
        name: this.assessment.assessmentType + '-overview',
        params: {
          [this.assessment.assessmentType + 'ID']: this.assessment.id
        }
      }
    }
  },
  methods: {
    async toggleAssignment () {
      try {
        const toggledAssignment = await this.$store.dispatch(
          'TOGGLE_ASSIGNMENT',
          this.assessment
        )

        this.$buefy.snackbar.open({
          message: `Marked '${toggledAssignment.title}' as ${
            toggledAssignment.completed ? 'complete' : 'incomplete'
          }!`,
          type: 'is-primary',
          position: 'is-bottom',
          actionText: 'View',
          onAction: () => {
            this.$router.push({
              name: 'assignment-overview',
              params: { assignmentID: this.assessment._id }
            })
          }
        })
      } catch (e) {
        return this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.assessment {
  padding: 0;
  align-items: stretch;
  position: relative;
  border-left: 4px solid white;

  .holder {
    padding: 12px 8px;
    width: 100%;
    align-items: center;
  }

  .behind {
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    transition: transform 0.2s ease-out;
    transform: scaleX(0);
    transform-origin: right;
    .icon {
      font-size: 1.3em;
      margin: 0 5px;
      cursor: pointer;
    }
  }
}

.assessment:hover {
  .behind {
    transform: scaleX(1);
  }
}

.assessment.is-completed {
  border-left: 4px solid #48c774;
}

.vertical {
  flex-direction: column;
}

.assessment-title {
  position: relative;

}
.course-title {
  // position: absolute;
  // top: -11px;
  font-size: 12px;
}

.assessment-icon {
  font-size: 1.2em;
  cursor: pointer;
  // color: rgb(172, 172, 172);
  margin-right: 5px;
}
</style>
