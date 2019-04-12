<template>
  <div class="exam-overview-study-plan">
    <ol>
      <li
        v-for="(item, index) in studyPlan"
        :key="index"
      >
        <label>
          <input type="checkbox">
          {{ item.text }}
        </label>
        <ol v-if="item.children">
          <li
            v-for="(child, index) in item.children"
            :key="index"
          >
            <label>
              <input type="checkbox">
              {{ child.text }}
            </label>
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
  computed: {
    studyPlan () {
      return this.assessment.studyPlan;
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
