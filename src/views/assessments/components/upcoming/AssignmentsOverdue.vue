<template>
  <div class="assignments-overdue">
    <button
      class="button is-danger is-pulled-right"
      @click="modalActive = !modalActive"
    >
      <span class="icon">
        <i class="fas fa-exclamation-circle" />
      </span>
      <span>
        {{ overdueAssignments.length }} Overdue Assignments
      </span>
    </button>

    <div
      class="modal"
      :class="{'is-active': modalActive}"
    >
      <div
        class="modal-background"
        @click="modalActive = false"
      />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Overdue Assignments
          </p>
        </header>
        <section class="modal-card-body">
          <!-- Content ... -->
        </section>
        <footer class="modal-card-foot">
          <button
            class="button"
            @click="modalActive = false"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssignmentsOverdue',
  data () {
    return {
      modalActive: false,
      overdueAssignments: []
    }
  },
  computed: {
    today () {
      return this.now
    }
  },
  async mounted () {
    await this.getOverdueAssignments()
  },
  methods: {
    async getOverdueAssignments () {
      const params = {
        completed: false,
        confirmed: false,
        termCode: this.currentTerm.code,
        dueDate: { $lt: this.now }
      }
      const response = await this.$http.get('/assignments', { params })
      this.overdueAssignments = response.data.assignments
    }
  }
}
</script>

<style lang="scss" scoped>
.overdue-assignments-holder.scroll {
  overflow: auto;
  width: auto;
  white-space: nowrap;
  max-width: 100%;
  scrollbar-width: thin;

  .overdue-assignment {
    display: inline-block;
    padding: 5px 10px;
  }
}
</style>
