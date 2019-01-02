<template>
  <div class="exams-overview">
    <ExamsModalEdit
      v-if="!isPast"
      :open="editing"
      :initial-exam="exam"
      @toggle-modal="editing = !editing"
      @edit-exam="editedExam"
      @remove-exam="remove"
    />
    <section
      v-if="loading"
      class="section"
    >
      <h1 class="title has-text-grey">
        Loading Exam...
      </h1>
    </section>
    <section
      v-else
      class="section"
    >
      <div class="is-clearfix">
        <ExamOverviewActionButtons
          :exam="exam"
          :loading="loading"
          @toggle-editing="toggleEditing"
        />

        <span
          class="tag is-medium course-tag"
          :style="{ 'background-color': course.color }"
          @click="$store.commit('OPEN_COURSE_MODAL', course)"
        >
          <b class="course-longname">
            {{ course.longname }}
          </b>
          {{ exam.passed ? 'Past ': '' }}Exam
        </span>

        <h1 class="title">
          {{ exam.title }}
        </h1>
        <h2 class="subtitle has-text-grey due-title">
          {{ isPast ? 'Was on' : 'On' }}
          <b>{{ shortDateTimeString(exam.date) }}</b>
        </h2>
      </div>

      <hr>

      <ExamOverviewStats :exam="exam" />

      <div class="content exam-description">
        <blockquote>
          <VueMarkdown
            v-if="exam.description.length > 0"
            :source="exam.description"
            :html="false"
            :emoji="true"
            :anchor-attributes="{target: '_blank'}"
          />
          <i v-else>
            No description given.
          </i>
        </blockquote>
      </div>

      <ExamOverviewTabs
        :tab="tab"
        :exam="exam"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @add-work-block="addWorkBlock"
        @edit-work-block="editWorkBlock"
        @remove-work-block="removeWorkBlock"
      />
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';
import ExamsModalEdit from '@/components/exams/ExamsModalEdit';

import ExamOverviewStats from '@/components/exams/overview/ExamOverviewStats';
import ExamOverviewActionButtons from '@/components/exams/overview/ExamOverviewActionButtons';
import ExamOverviewTabs from '@/components/exams/overview/ExamOverviewTabs';

export default {
  name: 'ExamsOverview',
  components: {
    VueMarkdown,
    ExamsModalEdit,
    ExamOverviewStats,
    ExamOverviewActionButtons,
    ExamOverviewTabs
  },
  data () {
    return {
      tab: 'schedule',
      commentLoading: false,
      loading: true,
      isUpcoming: false,
      exam: {},
      editing: false
    };
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.exam.courseCRN);
    },
    isPast () {
      return this.exam.passed;
    }
  },
  watch: {
    $route: 'getExam'
  },
  created () {
    this.getExam();
  },
  methods: {
    tabChanged (newTab) {
      this.tab = newTab;
    },
    toggleEditing () {
      this.editing = !this.editing;
    },
    editedExam (newExam) {
      this.exam = newExam;
    },
    async addWorkBlock ({ start, end }) {
      let request;
      request = await this.$http.post(`/blocks/exam/${this.exam._id}`, {
        startTime: start,
        endTime: end,
        assessmentType: 'exam'
      });

      if (this.$store.getters.getUpcomingExamById(this.exam._id)) {
        this.$store.commit('UPDATE_UPCOMING_EXAM', request.data.updatedExam);
      } else {
        this.editedExam(request.data.updatedExam);
      }

      this.$toasted.success('Added work block to your schedule!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    },
    async editWorkBlock ({ blockID, start, end }) {
      let request;
      request = await this.$http.patch(
        `/blocks/exam/${this.exam._id}/${blockID}`,
        { startTime: start, endTime: end, assessmentType: 'exam' }
      );

      if (this.$store.getters.getUpcomingExamById(this.exam._id)) {
        this.$store.commit('UPDATE_UPCOMING_EXAM', request.data.updatedExam);
      } else {
        this.editedExam(request.data.updatedExam);
      }

      this.$toasted.show('Rescheduled work block!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    },
    async removeWorkBlock (blockID) {
      let request;
      request = await this.$http.delete(
        `/blocks/exam/${this.exam._id}/${blockID}`
      );

      if (this.$store.getters.getUpcomingExamById(this.exam._id)) {
        this.$store.commit('UPDATE_UPCOMING_EXAM', request.data.updatedExam);
      } else {
        this.editedExam(request.data.updatedExam);
      }

      this.$toasted.error('Removed work block from your schedule!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    },
    async getExam () {
      // If its an upcoming exam, we already have the data on it
      if (this.$store.getters.getUpcomingExamById(this.$route.params.examID)) {
        this.exam = this.$store.getters.getUpcomingExamById(
          this.$route.params.examID
        );
        this.loading = false;
        this.isUpcoming = true;
        document.title = `${this.exam.title} | LATE`;

        if (this.passed) this.tab = 'comments';

        return;
      }

      this.loading = true;
      this.isUpcoming = false;

      this.tab = 'comments';

      let request;
      try {
        request = await this.$http.get(`/exams/e/${this.$route.params.examID}`);
      } catch (e) {
        this.loading = false;
        this.$router.push('/exams');

        return this.$toasted.error(e.response.data.message);
      }

      this.exam = request.data.exam;
      document.title = `${this.exam.title} | LATE`;
      this.loading = false;
    },
    async remove () {
      // Confirm user wants to remove exam
      if (
        !confirm(`Are you sure you want to remove exam ${this.exam.title}?`)
      ) {
        return;
      }

      const examTitle = this.exam.title;
      const examID = this.exam._id;

      this.$router.push('/exams');

      // This handles the API call and state update
      if (this.isUpcoming) {
        await this.$store.dispatch('REMOVE_UPCOMING_EXAM', examID);
      } else {
        await this.$http.delete(`/exams/e/${examID}`);
      }

      // Notify user of success
      this.$toasted.success(`Successfully removed exam '${examTitle}'.`, {
        icon: 'times',
        action: {
          text: 'Undo'
        }
      });
    },
    shortDateTimeString: date =>
      moment(date).format('dddd, MMM Do YYYY [@] h:mma'),
    toFullDateTimeString: date =>
      moment(date).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
    }
  }
};
</script>

<style lang="scss" scoped>
.course-tag {
  cursor: pointer;
  color: white;

  .course-longname {
    margin-right: 5px;
  }

  margin-bottom: 10px;
}

.exam-stats {
  padding: 10px;
}
</style>
