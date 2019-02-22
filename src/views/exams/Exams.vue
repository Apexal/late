<template>
  <div class="exams">
    <section class="section exam-list">
      <div class="tab-nav has-addons is-pulled-right tabs">
        <ul>
          <li>
            <router-link
              class=""
              to="/exams/upcoming"
              title="Switch to view upcoming exams."
            >
              Upcoming
            </router-link>
          </li>
          <li>
            <router-link
              class=""
              to="/exams/past"
              title="Switch to view past exams."
            >
              Previous
            </router-link>
          </li>
          <li>
            <router-link
              class=""
              to="/exams/calendar"
              title="Switch to view your exam calendar."
            >
              Calendar
            </router-link>
          </li>
        </ul>
      </div>

      <h1 class="title">
        {{ title }}
      </h1>

      <div class="level box exam-controls">
        <div class="level-left disable-shrink">
          <div class="filters">
            <span class="subtitle is-6">
              Filter Courses
            </span>
            <span
              v-for="c in courses"
              :key="c.original_longname"
              class="tag is-white course-tag level-item is-unselectable"
              :title="`Click to toggle filtering out ${c.longname} exam.`"
              :class="{ 'has-text-grey-light filtered': isFiltered(c) }"
              @click="toggleFilter(c)"
            >
              <span
                class="dot course-dot"
                :style="{ 'background-color': c.color }"
              />
              {{ c.longname }}
            </span>
          </div>
        </div>
      </div>
      <hr>
      <transition
        name="slide-left"
        mode="out-in"
      >
        <router-view
          class="child-view"
          :filter="filter"
        />
      </transition>
      <hr>
      <button
        class="button is-dark"
        @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
      >
        Add Exam
      </button>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Exams',
  data () {
    return {
      filter: []
    };
  },
  computed: {
    view () {
      return this.$route.name;
    },
    title () {
      return this.$route.meta.title;
    },
    courses () {
      return this.$store.getters.current_schedule;
    }
  },
  methods: {
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN);
    },
    isFiltered (c) {
      return this.filter.includes(c.crn);
    },
    toggleFilter (c) {
      if (this.filter.includes(c.crn)) {
        this.filter.splice(this.filter.indexOf(c.crn), 1);
        this.$toasted.info(`Now including '${c.longname}' exams.`, {
          icon: 'plus',
          position: 'top-right',
          fullWidth: false,
          duration: 1000
        });
      } else {
        this.filter.push(c.crn);
        this.$toasted.error(`No longer showing '${c.longname}' exams.`, {
          icon: 'minus',
          position: 'top-right',
          fullWidth: false,
          duration: 1000
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
span.tag.course-tag {
  cursor: pointer;
  font-weight: bold;
  margin: 0;
  padding-right: 0;
}

span.dot.course-dot {
  margin-right: 2px;
}

.level .disable-shrink {
  flex-shrink: initial;
}

.exam-controls {
  padding: 10px !important;
}

@media only screen and (max-width: 768px) {
  .buttons.exam-view-buttons {
    float: unset !important;
  }

  .level-left + .level-right {
    margin-top: 5px !important;
  }
}

//Copied header styling from Assignments.vue
.tab-nav {
  router-link {
    display: block;
  }

  .is-active {
    border-bottom-color: #3273dc;
    color: #3273dc;
  }

  ul {
    border-style: none;
  }

  a {
    margin: -3px 0px 0px 0px; //Negative margins. I'm sorry.
    padding: 0px 5px 0px 5px;
    //border-style: none; //For some reason we get double border styling
    padding: 0.5em 1em;
  }
}

.title {
    border-bottom-color: #dbdbdb;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    padding-bottom: 1px; //Slightly shifts title up to match dashboard
}
</style>
