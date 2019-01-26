<template>
  <div class="course box">
    <template v-if="!editing">
      <details :open="open">
        <summary
          class="is-clearfix is-unselectable"
          style="cursor:pointer;"
        >
          {{ courseData.longname }}
          <small
            class="has-text-grey"
          >
            {{ courseData.periods.length }} periods
          </small>
          <span
            class="tag is-pulled-right"
            :style="{'background-color': courseData.color, 'color': 'white'}"
            :title="'You are in Section ' + courseData.section_id"
          >
            Section {{ courseData.section_id }}
          </span>
          <span
            class="icon edit-course is-pulled-right"
            @click="editing = true"
          >
            <i class="fas fa-pencil-alt" />
          </span>
        </summary>

        <div class="periods">
          <table class="table is-full-width">
            <thead class="is-unselectable">
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Location</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in sortedPeriods"
                :key="p.day + p.start"
              >
                <td>{{ day(p.day) }}</td>
                <td>
                  {{ time(p.start) }}
                  <span class="has-text-grey-light">
                    -
                  </span>
                  {{ time(p.end) }}
                </td>
                <td>{{ p.location }}</td>
                <td>{{ type(p.type) }}</td>
              </tr>
            </tbody>
          </table>

          <ul class="course-links">
            <li
              v-for="l in courseData.links"
              :key="l"
            >
              <a
                :href="l"
                target="_blank"
              >
                {{ l }}
              </a>
            </li>
          </ul>
        </div>
      </details>
    </template>
    <template v-else>
      <form
        class="course-edit"
        @submit.prevent="save"
      >
        <div class="columns is-multiline">
          <div class="column">
            <label>Course</label>
            <input
              type="text"
              class="input"
              :value="courseData.summary"
              disabled
            >
          </div>
          <div class="column">
            <label :for="'course-title-' + elementID">
              Title
            </label>
            <input
              :id="'course-title-' + elementID"
              v-model.trim="courseData.longname"
              type="text"
              :placeholder="courseData.original_longname"
              class="input course-longname-input"
              required
            >
          </div>
        </div>
        <div class="columns">
          <div class="column">
            <label :for="'course-section-' + elementID">
              Section
            </label>
            <input
              :id="'course-section-' + elementID"
              v-model.trim="courseData.section_id"
              type="text"
              placeholder="Section"
              class="input course-section-input"
              required
            >
          </div>
          <div class="column">
            <label :for="'course-color-' + elementID">
              Color
            </label>
            <input
              :id="'course-color-' + elementID"
              v-model="courseData.color"
              type="color"
              class="input course-color-input"
            >
          </div>
        </div>


        <label :for="'course-links-' + elementID">
          Links
        </label>
        <InputTag
          :id="'course-links-' + elementID"
          v-model="courseData.links"
          placeholder="Put links to courses here! Hit Enter after each link."
        />
        <button
          type="button"
          class="button is-warning"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          :disabled="saved"
          class="button is-primary"
        >
          Save
        </button>
      </form>
    </template>
  </div>
</template>

<script>
import moment from 'moment';
import InputTag from 'vue-input-tag';

export default {
  name: 'ProfileCourse',
  components: { InputTag },
  props: {
    course: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data () {
    return {
      open: false,
      courseData: Object.assign({}, this.course),
      editing: false
    };
  },
  computed: {
    elementID () { return this.courseData.summary.replace(' ', '').toLowerCase(); },
    sortedPeriods () {
      return this.courseData.periods
        .concat()
        .sort((a, b) => parseInt(a.day) - parseInt(b.day));
    },
    saved () {
      return JSON.stringify(this.course) === JSON.stringify(this.courseData);
    }
  },
  watch: {
    course (newCourse) {
      this.courseData = Object.assign({}, this.course);
    }
  },
  methods: {
    day: num =>
      [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ][num],
    time: t => {
      const dt = moment(t, 'Hmm', true);
      if (dt.hours() === 12 && dt.minutes() === 0) {
        return 'Noon';
      } else if (dt.minutes() === 0) {
        return dt.format('ha');
      }
      return dt.format('h:mma');
    },
    type (pType) {
      return this.$store.getters.periodType(pType);
    },
    cancel () {
      this.courseData = Object.assign({}, this.course);
      this.editing = false;
    },
    async save () {
      if (
        this.courseData.longname.length === 0 ||
        this.courseData.section_id.length === 0
      ) {
        return;
      }
      this.$emit('update-course', this.courseData);
      this.editing = false;
      this.open = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.periods {
  overflow: auto;
}

.course.box {
  .edit-course {
    display: none;
    cursor: pointer;
  }
  &:hover {
    .edit-course {
      display: inherit;
    }
  }

  .course-links {
    li {
      list-style-type: none;
    }
  }
}

//Displays edit button with better margins
.fa-pencil-alt {
  margin-left: 6px;
}

.course-edit {
  p { margin-top: 5px; }
  //Button readability and interactivity
  button { margin-top: 10px; margin-right: 10px; }
}
</style>
