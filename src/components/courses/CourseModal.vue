<template>
  <div
    class="modal course-modal"
    :class="{'is-active': open}"
  >
    <div
      class="modal-background"
      @click="$store.commit('CLOSE_COURSE_MODAL')"
    />
    <div class="modal-content">
      <div class="box">
        <div
          class="tag section-tag is-pulled-right"
          :style="{ 'background-color': course.color }"
        >
          Section {{ course.section_id }}
        </div>
        <h2 class="subtitle">
          {{ course.longname }}
          <router-link
            title="Edit course info and links."
            :to="{ name: 'setup-course-schedule' }"
            class="icon margin-left"
          >
            <i class="fas fa-pencil-alt" />
          </router-link>
        </h2>
        <hr>
        <ul
          v-if="course.links && course.links.length > 0"
          class="course-links"
        >
          <li
            v-for="l in course.links"
            :key="l"
          >
            <a
              :href="l"
              target="_blank"
            >
              {{ linkDisplay(l) }}
            </a>
          </li>
        </ul>
        <span
          v-else
          class="has-text-centered has-text-grey"
        >
          No links added.
        </span>

        <hr>

        <div class="buttons">
          <button
            class="button is-info"
            @click="addAssessment('assignment')"
          >
            <i class="fa fa-clipboard-list" />
            Add Assignment
          </button>
          <button
            class="button is-info"
            @click="addAssessment('exam')"
          >
            <i class="fa fa-file-alt" />
            Add Exam
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseModal',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    course: { type: Object, required: true }
  },
  methods: {
    linkDisplay (href) {
      href = href.replace('https://', '').replace('http://', '').replace('www.', '');
      if (href.length > 30) href = href.substr(0, 30) + '...';
      return href;
    },
    addAssessment (assessmentType) {
      this.$store.commit('CLOSE_COURSE_MODAL');
      this.$store.commit(
        'SET_ADD_' + assessmentType.toUpperCase() + '_MODAL_COURSE_CRN',
        this.course.crn
      );
      this.$store.commit('TOGGLE_ADD_' + assessmentType.toUpperCase() + '_MODAL');
    }
  }
};
</script>

<style lang="scss" scoped>
.section-tag {
  color: white;
}

.course-links {
  overflow: auto;
}

.buttons {
  button {
    i.fa {
      margin-right: 3px;
    }
  }
}
</style>
