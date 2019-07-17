<template>
  <div class="columns is-multiline assignments-confirm">
    <div
      v-for="(a, index) in unconfirmedAssignments"
      :key="index"
      class="column is-half is-full-touch"
    >
      <div class="notification is-primary">
        Did you ever complete <b>{{ a.title }}?</b>
        <div class="is-pulled-right">
          <b-button
            size="is-small"
            @click="confirmAssignment(a._id, true)"
          >
            Yes
          </b-button>
          <b-button
            size="is-small"
            @click="confirmAssignment(a._id, false)"
          >
            No
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'DashboardOverviewAssignmentsConfirm',
  data () {
    return {
      unconfirmedAssignments: []
    };
  },
  async mounted () {
    let response;
    try {
      response = await this.$http.get('/assignments', {
        params: {
          start: moment(this.currentTerm.start).format('YYYY-MM-DD'),
          end: moment(this.rightNow).format('YYYY-MM-DD'),
          completed: false,
          confirmed: false
        }
      });
    } catch (e) {
      this.$toast.open({ type: 'is-danger', message: e.response.data.message });
      return;
    }

    this.unconfirmedAssignments = response.data.assignments;
  },
  methods: {
    async confirmAssignment (assignmentID, didComplete) {
      let response;
      if (didComplete) {
        response = await this.$http.post(
          '/assignments/a/' + assignmentID + '/toggle'
        );
      } else {
        response = await this.$http.patch('/assignments/a/' + assignmentID, {
          confirmed: true,
          completed: false
        });
      }

      this.unconfirmedAssignments = this.unconfirmedAssignments.filter(
        a => a._id !== assignmentID
      );

      this.$toast.open({
        type: 'is-primary',
        message: 'Confirmed assignment\'s status!'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
