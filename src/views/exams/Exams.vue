<template>
  <div class="exams">
    <section class="section exam-list">
      <h1 class="is-hidden-desktop has-text-centered is-marginless title">
        {{ title }}
      </h1>

      <div class="tab-nav tabs is-centered">
        <ul>
          <h1
            class="is-hidden-touch title"
            style="flex: 1"
          >
            {{ title }}
          </h1>

          <router-link
            tag="li"
            to="/exams/upcoming"
            title="Switch to view upcoming exams"
          >
            <a>Upcoming</a>
          </router-link>

          <router-link
            tag="li"
            to="/exams/past"
            title="Switch to view past exams"
          >
            <a>Previous</a>
          </router-link>

          <router-link
            tag="li"
            to="/exams/calendar"
            title="Switch to view your exam calendar"
          >
            <a>Calendar</a>
          </router-link>
        </ul>
      </div>

      <AssessmentsFilter
        :filter="filter"
        @toggle-filter="toggleFilter"
      />

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
        title="Add an upcoming exam"
        @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
      >
        Add Exam
      </button>
    </section>
  </div>
</template>

<script>
import AssessmentsFilter from '@/views/components/assessment/AssessmentsFilter';

export default {
  name: 'Exams',
  components: { AssessmentsFilter },
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
        this.$toasted.info(`Showing '${c.longname}' exams.`, {
          icon: 'plus',
          position: 'top-right',
          fullWidth: false,
          duration: 1000
        });
      } else {
        this.filter.push(c.crn);
        this.$toasted.error(`Hiding '${c.longname}' exams.`, {
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

  span {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: 0.3s;
    -webkit-transition: 0.3s;
    transition-delay: 0.1s;
    -webkit-transition-delay: 0.1s;
  }

  span:hover {
    max-width: 100vw;
    transition: 0.4s;
    -webkit-transition: 0.4s;
    //transition-delay:0.3s;
  }
}

.filtered-out {
  color: #686868 !important;
  background-color: rgb(214, 214, 214) !important;
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
  margin-bottom: 0;
  .title {
    margin: 0;
  }
}
</style>
