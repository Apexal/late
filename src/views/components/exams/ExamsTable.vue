<template>
  <table class="exam-table table is-full-width">
    <thead>
      <tr>
        <th>When</th>
        <th class="is-hidden-mobile">
          Course
        </th>
        <th>Title</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="ex in exams"
        :key="ex._id"
      >
        <td
          class="tooltip"
          :data-tooltip="fromNow(ex.date)"
        >
          {{ toDateShorterString(ex.date) }}
        </td>
        <td
          class="exam-course is-hidden-mobile"
          @click="$store.commit('OPEN_COURSE_MODAL', course(ex))"
        >
          <span
            class="dot"
            :title="course(ex).longname"
            :style="'background-color: ' + course(ex).color"
          />
          {{ course(ex).longname }}
        </td>
        <router-link
          tag="td"
          class="exam-link"
          :title="ex.description.substring(0, 500)"
          :to="{ name: 'exams-overview', params: { examID: ex._id }}"
        >
          <span
            class="dot is-hidden-tablet"
            :title="course(ex).longname"
            :style="'background-color: ' + course(ex).color"
            @click.prevent="$store.commit('OPEN_COURSE_MODAL', course(ex))"
          />
          {{ ex.title }}
        </router-link>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamsTable',
  props: {
    showRemoveButton: {
      type: Boolean,
      default: false
    },
    dateFormat: {
      type: String,
      default: 'dddd [the] Do'
    },
    exams: {
      type: Array,
      required: true
    }
  },
  methods: {
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN);
    },
    fromNow (date) {
      return moment(date).from(this.now);
    },
    toDateShorterString (date) {
      return moment(date).format(this.dateFormat);
    }
  }
};
</script>

<style lang="scss" scoped>
.exam-course {
  font-weight: 600;
  cursor: pointer;
}
.exam-link {
  color: inherit;
  cursor: pointer;
}
</style>
