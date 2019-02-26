<template>
  <div class="exams">
    <section class="section exam-list">
      <div class="tab-nav tabs is-right">
        <ul>
          <h1
            class="title"
            style="flex: 1"
          >
            {{ title }}
          </h1>
          <li>
            <router-link
              class
              to="/exams/upcoming"
              title="Switch to view upcoming exams"
            >
              Upcoming
            </router-link>
          </li>
          <li>
            <router-link
              class
              to="/exams/past"
              title="Switch to view past exams"
            >
              Previous
            </router-link>
          </li>
          <li>
            <router-link
              class
              to="/exams/calendar"
              title="Switch to view your exam calendar"
            >
              Calendar
            </router-link>
          </li>
        </ul>
      </div>

      <div class="level box exam-controls">
        <div class="level-left disable-shrink">
          <div class="filters">
            <span class="subtitle is-6">Filter Courses: </span>
            <span
              v-for="c in courses"
              :key="c.original_longname"
              class="tag is-white course-tag level-item is-unselectable"
              :title="`Click to toggle filtering out ${c.longname} exam.`"
              :class="{ 'filtered-out filtered': isFiltered(c) }"
              :style="{ 'background-color': c.color }"
            >
              <span @click="toggleFilter(c)">{{ c.longname }}</span>
            </span>
          </div>
        </div>
      </div>

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
  //font-weight: bold;
  margin: 0;
  margin-left: 2px;
  margin-right: 2px;
  color: white;
}

.filtered-out {
  color: #686868!important;
  background-color:rgb(214, 214, 214)!important;
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

.tab-nav {
  .title {
    margin: 0;
  }
  .is-active {
    border-bottom-color: #3273dc;
    color: #3273dc;
  }
}
</style>
