<template>
  <div class="exam-overview-study-plan">
    <progress
      class="progress is-success is-tooltip-bottom"
      :value="completedCount"
      :title="completedPercent + '%'"
      :max="totalItemCount"
    >
      {{ completedPercent }}%
    </progress>
    <ol class="columns is-multiline">
      <li
        v-for="(item, index) in studyPlan"
        :key="index"
        class="column is-half"
      >
        <label>
          <input
            type="checkbox"
            :checked="item.completed"
            :disabled="loading"
            @change="setItemCompleted(index, !item.completed)"
          >
          {{ item.text }}
        </label>
        <ol v-if="item.children">
          <li
            v-for="(child, childIndex) in item.children"
            :key="childIndex"
          >
            <label>
              <input
                type="checkbox"
                :checked="child.completed"
                :disabled="loading"
                @change="setChildCompleted(index, childIndex, !child.completed)"
              >
              {{ child.text }}
            </label>
          </li>
          <li>
            <input
              type="text is-full-width"
              :placeholder="'Add checkpoint to ' + item.text"
            >
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'ExamOverviewStudyPlan',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false
    };
  },
  computed: {
    studyPlan () {
      return this.assessment.studyPlan;
    },
    completedCount () {
      return this.studyPlan.reduce(
        (acc, item) =>
          acc + item.completed + item.children.filter(c => c.completed).length,
        0
      );
    },
    totalItemCount () {
      return this.studyPlan.reduce(
        (acc, item) => acc + 1 + item.children.length,
        0
      );
    },
    completedPercent () {
      return Math.round((this.completedCount / this.totalItemCount) * 100);
    }
  },
  methods: {
    async setItemCompleted (itemIndex, status) {
      const studyPlan = JSON.parse(JSON.stringify(this.studyPlan));
      studyPlan[itemIndex].completed = status;
      if (status) {
        for (const child of studyPlan[itemIndex].children) {
          child.completed = true;
        }
      }

      await this.updateStudyPlan(studyPlan);
    },
    async setChildCompleted (itemIndex, childIndex, status) {
      const studyPlan = JSON.parse(JSON.stringify(this.studyPlan));
      studyPlan[itemIndex].children[childIndex].completed = status;

      // See if all children of parent are completed
      studyPlan[itemIndex].completed = studyPlan[itemIndex].children.every(
        i => i.completed
      );

      await this.updateStudyPlan(studyPlan);
    },
    async updateStudyPlan (studyPlan) {
      this.loading = true;

      let request;
      try {
        request = await this.$http.patch(`/exams/e/${this.assessment._id}`, {
          studyPlan
        });
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.editing = false;
        return;
      }

      // Calls API and updates state
      if (
        // eslint-disable-next-line
        this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
      ) {
        this.$store.dispatch(
          'UPDATE_UPCOMING_ASSESSMENT',
          request.data.updatedExam
        );
      } else {
        this.$emit('update-assessment', request.data.updatedExam);
      }

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.exam-overview-study-plan {
  font-size: 1.5em;
  ul,
  ol {
    list-style-type: none;
  }
  li > ol {
    padding-left: 20px;
    > li {
      font-size: 0.8em;
    }
  }
}
</style>
