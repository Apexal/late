<template>
  <div class="exams-upcoming">
    <p
      v-if="filtered.length === 0"
      class="has-text-centered has-text-grey"
    >
      No upcoming exams!
    </p>
    <div
      v-else
      class="columns is-multiline"
    >
      <div
        v-for="ex in filtered"
        :key="ex._id"
        class="box upcoming-exam"
      >
        {{ ex }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamsUpcoming',
  components: {},
  props: {
    filter: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {};
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    filtered () {
      return this.upcomingExams.filter(
        ex => !this.filter.includes(ex.courseCRN)
      );
    },
    upcomingExams () {
      return this.$store.state.work.upcomingExams;
    }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
</style>
