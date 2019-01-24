<template>
  <div>
    <h1>Which course has the Assignment:</h1>
    <div
      v-for="c in courses"
      :key="c.crn"
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
  &:hover{
    cursor: pointer;
  }
  margin-top: 10px;
}
</style>
