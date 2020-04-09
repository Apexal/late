<template>
  <div class="shared-assignment-info">
    <div class="columns is-multiline">
      <div
        v-for="student in [assessment._student].concat(collaborators)"
        :key="student.rcs_id"
        class="column is-one-third is-full-mobile"
      >
        <div class="box collaborator">
          <i
            v-if="isOwner && student._id !== assessment._student._id"
            class="delete"
            @click="removeStudent(student.rcs_id)"
          />
          <h2
            class="subtitle"
            :title="student.rcs_id"
          >
            {{ student.displayName }}
            <small class="has-text-grey">{{
              assessment._student._id === student._id ? "Owner" : "Collaborator"
            }}</small>
          </h2>
          <p class="has-text-grey">
            <a :href="'mailto:' + student.rcs_id + '@rpi.edu'">{{
              student.rcs_id + "@rpi.edu"
            }}</a>
            <br>
            <a
              v-if="student.integrations.sms.verified"
              :href="`tel:+1-${student.integrations.sms.phoneNumber}`"
            >+1{{ student.integrations.sms.phoneNumber }}</a>
          </p>
        </div>
      </div>
    </div>
    <div class="unregistered-collaborators">
      <b>Invited Students not yet on LATE</b>
      <li
        v-for="rcsId in unregisteredCollaborators"
        :key="rcsId"
      >
        {{ rcsId }}
        <i
          v-if="isOwner"
          class="delete"
          @click="removeStudent(rcsId)"
        />
      </li>
    </div>

    <template v-if="isOwner">
      <form @submit.prevent="addStudent">
        <b-field>
          <b-input
            v-model.trim="newStudent"
            type="text"
            placeholder="RPI username of student, e.g. matraf"
            required
          />
          <p class="control">
            <button
              class="button"
              :class="{'is-loading': loading}"
            >
              Add Student
            </button>
          </p>
        </b-field>
      </form>
    </template>
    <hr>
    Scheduling work blocks for this assignment places them in everybody's
    schedule. <b>LATE</b> will also show everybody's availability to help you
    find time slots that work for everyone.
  </div>
</template>

<script>
export default {
  name: 'AssignmentOverviewTabsSharedInfo',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      collaborators: [],
      newStudent: ''
    }
  },
  computed: {
    owner () {
      return this.assessment._student
    },
    isOwner () {
      return this.assessment._student._id === this.user._id
    },
    unregisteredCollaborators () {
      return this.assessment.sharedWith.filter(
        rcsId => !this.collaborators.some(student => student.rcs_id === rcsId)
      )
    }
  },
  created () {
    this.getCollaborators()
  },
  methods: {
    async addStudent () {
      this.loading = true

      if (
        this.assessment.sharedWith.includes(this.newStudent) ||
        this.newStudent === this.user.rcsId
      ) {
        this.loading = false
        this.newStudent = ''
        return
      }

      let response
      try {
        response = await this.$http.post(
          `/assignments/a/${this.assessment._id}/collaborators`,
          { sharedWith: [...this.assessment.sharedWith, this.newStudent] }
        )
        if (
          this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
        ) {
          await this.$store.dispatch(
            'UPDATE_UPCOMING_ASSESSMENT',
            response.data.updatedAssessment
          )
        }
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', response.data.updatedAssessment)

      this.$buefy.toast.open({
        message: `Shared this assignment with <b>${
          this.newStudent
        }</b>. They have been notified.`,
        type: 'is-success'
      })

      this.getCollaborators()

      this.newStudent = ''
      this.loading = false
    },
    async removeStudent (rcsId) {
      let response
      try {
        response = await this.$http.post(
          `/assignments/a/${this.assessment._id}/collaborators`,
          {
            sharedWith: this.assessment.sharedWith.filter(rid => rid !== rcsId)
          }
        )
        if (
          this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
        ) {
          await this.$store.dispatch(
            'UPDATE_UPCOMING_ASSESSMENT',
            response.data.updatedAssessment
          )
        }
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', response.data.updatedAssessment)

      this.collaborators = this.collaborators.filter(
        student => student.rcs_id !== rcsId
      )

      this.newStudent = ''

      this.$buefy.toast.open({
        message: `Stopped sharing this assignment with <b>${rcsId}</b>. They have been notified.`,
        type: 'is-success'
      })
    },
    async getCollaborators () {
      if (!this.assessment.shared) return

      this.loading = true

      let response
      try {
        response = await this.$http.get(
          '/assignments/a/' + this.assessment._id + '/collaborators'
        )
      } catch (e) {
        this.showError(e.response.data.message)
        return
      }

      this.collaborators = response.data.collaborators

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.collaborator {
  padding: 15px;
  position: relative;

  .subtitle {
    margin-bottom: 5px;
  }

  i.delete {
    position: absolute;
    right: 5px;
    top: 5px;
  }
}
</style>
