<template>
  <div
    :class="{'is-active': open}"
    class="modal edit-exam-modal"
  >
    <div
      class="modal-background"
      @click="$emit('toggle-modal')"
    />
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamsModalEdit',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    initialExam: {
      type: Object,
      default: () => ({
        courseCRN: '',
        title: '',
        description: '',
        date: moment()
          .add(7, 'days')
          .format('YYYY-MM-DD'),
        time: '18:00', // HH:mm
        timeEstimate: 2,
        priority: 2
      }),
      required: true
    }
  },
  data () {
    return {
      loading: false,
      exam: this.convertExam(this.initialExam)
    };
  },
  computed: {
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    maxDate () {
      return moment(this.currentTerm.end).format('YYYY-MM-DD');
    },
    courses () {
      return this.$store.getters.current_schedule;
    },
    saved () {
      return (
        JSON.stringify(this.convertExam(this.initialExam)) ===
        JSON.stringify(this.exam)
      );
    },
    today: () => moment().format('YYYY-MM-DD')
  },
  watch: {
    initialExam (newEx) {
      this.exam = this.convertExam(newEx);
    }
  },
  methods: {
    convertExam (exam) {
      const data = Object.assign({}, exam);
      data.date = moment(exam.date).format('YYYY-MM-DD');
      data.time = moment(exam.date).format('HH:mm');
      return data;
    },
    async save () {
      this.loading = true;

      const request = await this.$http.patch(`/exams/a/${this.exam._id}`, {
        title: this.exam.title,
        description: this.exam.description,
        date: moment(
          this.exam.date + ' ' + this.exam.time,
          'YYYY-MM-DD HH:mm',
          true
        ).toDate(),
        courseCRN: this.exam.courseCRN,
        timeEstimate: this.exam.timeEstimate,
        priority: this.exam.priority
      });

      // Calls API and updates state
      if (this.$store.getters.getUpcomingExamById(this.exam._id)) {
        this.$store.commit('UPDATE_UPCOMING_EXAM', request.data.updatedExam);
      }
      this.$emit('edit-exam', this.exam);

      this.loading = false;

      // Close modal
      this.$emit('toggle-modal');

      // Notify user
      this.$toasted.info(
        `Edited exam '${request.data.updatedExam.title}' due ${moment(
          request.data.updatedExam.date
        ).fromNow()}.`,
        {
          action: {
            text: 'Undo'
          },
          icon: 'pen'
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
