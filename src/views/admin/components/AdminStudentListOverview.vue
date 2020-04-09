<!--Admin: User overview module-->
<template>
  <div
    class="user-overview"
    @toggle="getStats()"
  >
    <b-taglist class="setup-checks">
      <b-tag
        v-for="sc in student.setup_checks"
        :key="sc"
        :type="student.setup[sc] ? 'is-success' : 'is-danger'"
        :title="`They have setup ${setupCheckNames[sc]}.`"
      >
        {{ setupCheckNames[sc] }}
      </b-tag>
    </b-taglist>

    <div class="content-stats">
      <div class="level is-mobile">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Assignments Added
            </p>
            <p>{{ counts.assignments }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Exams Added
            </p>
            <p>{{ counts.exams }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Work Blocks Scheduled
            </p>
            <p>{{ counts.blocks }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dates">
      <span>
        <b>Joined:</b>
        {{ shortDateTimeFormat(student.createdAt) }}
      </span>
      <br>
      <span>
        <b>Last Login:</b>
        <!-- {{ shortDateTimeFormat(student.lastLogin) }} -->
        {{ student.lastLogin ? shortDateTimeFormat(student.lastLogin) : 'N/A' }}
      </span>
    </div>

    <div class="student-actions">
      <hr>
      <div class="buttons has-addons">
        <a
          class="button is-small"
          :href="'mailto:' + student.rcs_id + '@rpi.edu'"
          :target="'_blank'"
        >
          Email
        </a>
        <!-- <b-button
          type="is-info"
          size="is-small"
        >
          View Account
        </b-button> -->
        <b-button
          type="is-warning"
          size="is-small"
          @click="updateStudent({accountLocked: !student.accountLocked})"
        >
          {{ student.accountLocked ? "Unlock Account" : "Lock Account" }}
        </b-button>
        <template v-if="user.rcs_id === 'matraf'">
          <b-button
            v-if="confirming"
            type="is-danger"
            size="is-small"
            @click="deleteStudent"
          >
            Confirm
          </b-button>
          <b-button
            v-else
            type="is-danger"
            size="is-small"
            @click="confirming = true"
          >
            Delete Account
          </b-button>

          <b-button
            type="is-success"
            size="is-small"
            @click="updateStudent({admin: !student.admin})"
          >
            {{ student.admin ? "Remove" : "Make" }} Admin
          </b-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminStudentListOverview',
  props: { student: { type: Object, required: true } },
  data () {
    return {
      confirming: false,
      counts: {
        assignments: 0,
        exams: 0,
        blocks: 0
      }
    }
  },
  computed: {
    setupCheckNames () {
      return {
        profile: 'Profile',
        terms: 'Terms',
        course_schedule: 'Course Schedule',
        unavailability: 'Unavailability',
        integrations: 'Notifications',
        google: 'Google'
      }
    },
    hasSetupCheck () {
      return {
        profile: this.student.setup.profile,
        course_schedule: this.student.setup.course_schedule.length > 0,
        unavailability: this.student.setup.unavailability.length > 0,
        integrations: this.student.setup.integrations
      }
    }
  },
  created () {
    this.getStats()
  },
  methods: {
    async getStats () {
      const request = await this.$http.get(`/students/${this.student._id}`, {
        params: { counts: true }
      })
      this.counts = request.data.counts
    },
    async updateStudent (updates) {
      if (!confirm('Update student?')) return

      let request
      try {
        request = await this.$http.patch(
          '/students/' + this.student._id,
          updates
        )
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$emit('update-student', request.data.updatedStudent)
      this.$buefy.toast.open({ type: 'is-success', message: 'Updated student.' })
    },
    async deleteStudent () {
      this.$buefy.dialog.confirm({
        message:
          'Are you sure you want to delete this student account? This is IRREVERSIBLE',
        onConfirm: async () => {
          try {
            await this.$http.delete('/students/' + this.student._id)
          } catch (e) {
            return this.showError(e.response.data.message)
          }

          this.$emit('delete-student', this.student._id)
          this.$buefy.toast.open({
            type: 'is-success',
            message: `Deleted student ${this.student.rcs_id}.`
          })
        },
        onCancel: () => (this.confirming = false)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-overview {
  h2.subtitle {
    display: inline-block;
  }

  .setup-checks {
    overflow: auto;
    .fa.fa-check {
      color: green;
    }
    .fa.fa-times {
      color: red;
    }
  }
}
</style>
