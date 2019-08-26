<!--Admin: Edit terms module-->
<template>
  <div class="admin-terms-list">
    <h2 class="subtitle">
      School Terms
    </h2>

    <table class="table is-fullwidth is-striped terms">
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Start</th>
          <th>End of Classes</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="term in terms"
          :key="term.code"
          class="term"
          :class="{'is-selected': currentTerm.code === term.code}"
        >
          <td>
            <code>{{ term.code }}</code>
          </td>
          <td>
            <b>{{ term.name }}</b>
          </td>
          <td :title="fromNow(term.start)">
            {{ longDateFormat(term.start) }}
          </td>
          <td :title="fromNow(term.classesEnd)">
            {{ longDateFormat(term.classesEnd) }}
          </td>
          <td :title="fromNow(term.end)">
            {{ longDateFormat(term.end) }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>
            <b-input
              v-model.number="newTerm.code"
              type="number"
              placeholder="Term code, e.g. 201901"
            />
          </td>
          <td>
            <b-input
              v-model.trim="newTerm.name"
              type="text"
              placeholder="Name of new term"
            />
          </td>
          <td>
            <b-datepicker
              v-model="newTerm.start"
              placeholder="Start date"
            />
          </td>
          <td>
            <b-datepicker
              v-model="newTerm.classesEnd"
              placeholder="End of classes"
            />
          </td>
          <td>
            <b-datepicker
              v-model="newTerm.end"
              placeholder="End date"
            />
          </td>
          <b-button
            type="is-success"
            @click="promptAddTerm"
          >
            Add
          </b-button>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AdminTermsList',
  data () {
    return {
      newTerm: {
        code: '',
        name: '',
        start: null,
        classesEnd: null,
        end: null
      }
    }
  },
  computed: {
    terms () {
      return this.$store.state.schedule.terms
    }
  },
  methods: {
    promptAddTerm () {
      this.$buefy.dialog.confirm({
        message: 'Add a new school term?',
        onConfirm: this.addTerm
      })
    },
    async addTerm () {
      let createdTerm
      try {
        createdTerm = await this.$store.dispatch('ADD_TERM', this.newTerm)
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
        return
      }

      this.$buefy.toast.open({
        message: `Added new term <b>${createdTerm.name}</b>!`,
        type: 'is-success'
      })

      this.newTerm = {
        code: '',
        name: '',
        start: null,
        classesEnd: null,
        end: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
