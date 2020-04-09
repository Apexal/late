<!--Admin: Edit terms module-->
<template>
  <div class="admin-terms-list">
    <h2 class="subtitle">
      School Terms
    </h2>

    <AdminTermModal
      :open="termModalOpen"
      :term="selectedTerm"
      @close-modal="termModalOpen = false"
    />
    <table class="table is-fullwidth is-striped terms">
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Start</th>
          <th>End of Classes</th>
          <th>End</th>
          <th />
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
          <td :title="fromNow(term.startDate)">
            {{ longDateFormat(term.startDate) }}
          </td>
          <td :title="fromNow(term.classesEndDate)">
            {{ longDateFormat(term.classesEndDate) }}
          </td>
          <td :title="fromNow(term.endDate)">
            {{ longDateFormat(term.endDate) }}
          </td>
          <td>
            <button
              class="button"
              @click="selectedTerm = term; termModalOpen = true"
            >
              <span class="icon">
                <i class="fas fa-pencil-alt" />
              </span>
            </button>
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
import AdminTermModal from './AdminTermModal'

export default {
  name: 'AdminTermsList',
  components: { AdminTermModal },
  data () {
    return {
      selectedTerm: {},
      termModalOpen: false,
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
        return this.showError(e.response.data.message)
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
