<template>
  <div class="columns is-multiline">
    <div
      v-for="c in courses"
      :key="c.crn"
      class="column is-half"
    >
      <div
        class="course box"
        :value="c.crn"
        @click="nextStep($event)"
      >
        <span
          class="tag is-pulled-right"
          :style="{'background-color': c.color , 'color': 'white'}"
          :title="'You are in Section ' + c.section_id"
        >
          Section {{ c.section_id }}
        </span>
        {{ c.longname }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssessmentAddSelectCourse',
  props: {
    courses: {
      type: Array,
      required: true
    }
  },
  methods: {
    nextStep (event) {
      this.$emit('update-crn', event.target.attributes.value.value);
      this.$emit('next-step');
    }
  }
};
</script>

<style lang="scss" scoped>
.course.box {
  padding: 15px 20px;
  &:hover {
    cursor: pointer;
  }
}
</style>
