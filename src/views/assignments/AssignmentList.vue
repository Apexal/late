<template>
  <div class="assignment-list">
    <section class="section">
      <h1 class="title">All Assignments</h1>

      <div class="upcoming-assignments">
        <div
          v-for="(assignments, date) in assignmentsGroupedByDueDate"
          :key="date"
          class="due-date">
          <h3 class="subtitle is-4">{{ toDateShortString(date) }}</h3>
          <div
            v-for="a in assignments"
            :key="a.id"
            class="box">
            <b class="assignment-title">{{ a.title }}
              <span
                v-if="a.priority >= 7"
                class="tag is-danger"
                title="You marked this assignment as high priority!">!</span>
            </b>
            <span
              :title="toFullDateTimeString(a.dueDate)"
              class="is-pulled-right">due {{ toTimeString(a.dueDate) }}</span>
            <div
              :title="toFullDateTimeString(a.dueDate)"
              class="content">
              <blockquote>
                <p>{{ a.description }}</p>
              </blockquote>
            </div>
          </div>
          <hr>
        </div>
      </div>

      <hr>

      <div class="past-assignments"/>
    </section>

  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssignmentList',
  data() {
    return {};
  },
  computed: {
    assignmentsGroupedByDueDate() {
      return this.$store.getters.assignmentsGroupedByDueDate;
    }
  },
  methods: {
    toFullDateTimeString(dueDate) {
      return moment(dueDate).format('dddd, MMMM Do YYYY, h:mm a');
    },
    toDateShortString(dueDate) {
      return moment(dueDate).format('dddd [the] Do');
    },
    toTimeString(dueDate) {
      return moment(dueDate).format('hh:mm a');
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
