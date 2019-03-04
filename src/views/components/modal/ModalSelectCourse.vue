<template>
  <div class="columns is-multiline">
    <div
      v-for="c in courses"
      :key="c.crn"
      class="column course-column is-half"
    >
      <div
        class="course box"
        :value="c.crn"
        :class="{ 'active': isActive(c.crn) }"
        :style="{'--box-shadow-color': c.color}"
        @click="setCRN(c.crn)"
      >
        <span
          class="tag is-pulled-right"
          :style="{'background-color': c.color , 'color': 'white'}"
          :title="'You are in Section ' + c.section_id"
        >Section {{ c.section_id }}</span>
        {{ c.longname }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalSelectCourse',
  props: ['courses', 'courseCRN'],
  methods: {
    isActive (crn) {
      return this.courseCRN === crn ? 'active' : '';
    },
    setCRN (crn) {
      this.$emit('update-crn', crn);
      this.$emit('next-step');
    }
  }
};
</script>

<style lang="scss" scoped>
.course-column {
  padding: 6px;
}

.course.box {
  padding: 10px 15px;
  cursor: pointer;
}

.active {
  box-shadow: -0px 0px 2px 0.5px var(--box-shadow-color);
}
</style>
