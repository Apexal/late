<template>
  <div class="course box">
    <template v-if="!editing">
      <details :open="open">
        <summary
          class="is-clearfix is-unselectable"
          style="cursor:pointer;"
        >
          <span class="has-text-grey">
            {{ courseData.summary }}
          </span>
          {{ courseData.title }}
          <small
            class="has-text-grey"
          >
            {{ courseData.periods.length }} periods | {{ courseData.links.length }} links
          </small>
          <span
            class="tag is-pulled-right"
            :style="{'background-color': courseData.color, 'color': 'white'}"
            :title="'You are in Section ' + courseData.sectionId"
          >
            Section {{ courseData.sectionId }}
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
              v-model.trim="courseData.title"
              type="text"
              :placeholder="courseData.originalTitle"
              class="input course-title-input"
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
              v-model.trim="courseData.sectionId"
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
              required
            >
          </div>
        </div>
        <div>
          <label :for="'course-hidden-' + elementID">
            Mark as hidden
          </label>
          <input
            :id="'course-links-' + elementID"
            v-model="courseData.hidden"
            type="checkbox"
            title="Hidden courses will not show in the course selection list"
          >
        </div>
        <label :for="'course-links-' + elementID">
          Links
        </label>
        <InputTag
          :id="'course-links-' + elementID"
          v-model="courseData.links"
          placeholder="Put links to courses here! Hit Enter after each link."
        />
        <div class="periods">
          <table class="table is-full-width">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Location</th>
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in editedPeriods"
                :key="p.day + p.start"
              >
                <td>
                  <select
                    v-model.number="p.day"
                    required
                  >
                    <option
                      v-for="i in 7"
                      :key="i"
                      :value="i - 1"
                    >
                      {{ day(i-1) }}
                    </option>
                  </select>
                </td>
                <td>
                  <input
                    :value="formatToInputTime(p.start)"
                    type="time"
                    required
                    @change="changePeriodTime(p, 'start', $event.target.value)"
                  >
                  <span class="has-text-grey-light">
                    -
                  </span>
                  <input
                    :value="formatToInputTime(p.end)"
                    type="time"
                    required
                    @change="changePeriodTime(p, 'end', $event.target.value)"
                  >
                </td>
                <td>
                  <input
                    v-model="p.location"
                    type="text"
                    :placeholder="p.location"
                    required
                  >
                </td>
                <td>
                  <select
                    v-model="p.type"
                    required
                  >
                    <option
                      v-for="t in periodTypes"
                      :key="t"
                      :value="t"
                    >
                      {{ type(t) }}
                    </option>
                  </select>
                </td>
                <td title="Remove period.">
                  <i
                    class="fa fa-times has-text-danger remove-period"
                    @click="removePeriod(p)"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <select v-model.number="newPeriod.day">
                    <option
                      v-for="i in 7"
                      :key="i"
                      :value="i - 1"
                    >
                      {{ day(i-1) }}
                    </option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="newPeriod.start"
                    type="time"
                  >
                  <span class="has-text-grey-light">
                    -
                  </span>
                  <input
                    v-model="newPeriod.end"
                    type="time"
                  >
                </td>
                <td>
                  <input
                    v-model.trim="newPeriod.location"
                    type="text"
                    placeholder="Location of new period."
                  >
                </td>
                <td>
                  <select v-model="newPeriod.type">
                    <option
                      v-for="t in periodTypes"
                      :key="t"
                      :value="t"
                    >
                      {{ type(t) }}
                    </option>
                  </select>
                </td>
                <td title="Add period.">
                  <i
                    class="fa fa-plus has-text-success add-period"
                    @click="addPeriod"
                  />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <b-button
          type="is-warning"
          @click="cancel"
        >
          Cancel
        </b-button>
        <b-button
          :disabled="saved"
          type="is-primary"
        >
          Save
        </b-button>
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
      editedPeriods: JSON.parse(JSON.stringify(this.course.periods)),
      editing: false,
      periodTypes: ['LEC', 'REC', 'LAB', 'TES', 'STU'],
      newPeriod: {
        day: 1,
        start: '08:00',
        end: '09:50',
        location: '',
        type: 'LEC'
      }
    };
  },
  computed: {
    elementID () {
      return this.courseData.summary.replace(' ', '').toLowerCase();
    },
    sortedPeriods () {
      return this.courseData.periods
        .concat()
        .sort((a, b) => parseInt(a.day) - parseInt(b.day));
    },
    saved () {
      return (
        JSON.stringify(this.course) ===
        JSON.stringify(
          Object.assign(this.courseData, {
            periods: this.editedPeriods
          })
        )
      );
    }
  },
  watch: {
    course (newCourse) {
      this.courseData = Object.assign({}, this.course);
      this.editedPeriods = JSON.parse(JSON.stringify(this.course.periods));
    }
  },
  methods: {
    changePeriodTime (p, startOrEnd, inputFormat) {
      p[startOrEnd] = moment(inputFormat, 'HH:mm', true).format('Hmm');
    },
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
    formatToInputTime: oldFormat =>
      moment(oldFormat, 'Hmm', true).format('HH:mm'),
    type (pType) {
      return this.$store.getters.periodType(pType);
    },
    cancel () {
      this.courseData = Object.assign({}, this.course);
      this.editedPeriods = JSON.parse(JSON.stringify(this.course.periods));
      this.editing = false;
    },
    async save () {
      if (
        this.courseData.title.length === 0 ||
        this.courseData.sectionId.length === 0
      ) {
        this.$toasted.error(
          'You cannot set an empty name or section for a course!'
        );
        return;
      }
      this.$emit(
        'update-course',
        Object.assign(this.courseData, {
          periods: this.editedPeriods
        })
      );
      this.editing = false;
      this.open = true;
    },
    removePeriod (periodToRemove) {
      if (
        !confirm(
          `Remove ${periodToRemove.start} ${this.type(
            periodToRemove.type
          )} period on ${this.day(periodToRemove.day)}?`
        )
      ) {
        return;
      }

      // Remove period by filtering by day and start time
      this.editedPeriods = this.editedPeriods.filter(
        p => !(p.day === periodToRemove.day && p.start === periodToRemove.start)
      );

      this.$toasted.show(
        `${this.type(periodToRemove.type)} period will be removed from ${
          this.courseData.title
        } when you save.`
      );
    },
    addPeriod () {
      // Validate
      if (
        this.newPeriod.location.length === 0 ||
        !this.newPeriod.start ||
        !this.newPeriod.end
      ) {
        this.$toasted.error('Make sure the time and location is set!');
        return;
      }
      // Remeber to convert start/end from HH:mm to Hmm
      this.editedPeriods.push(
        Object.assign({}, this.newPeriod, {
          start: moment(this.newPeriod.start, 'HH:mm', true).format('Hmm'),
          end: moment(this.newPeriod.end, 'HH:mm', true).format('Hmm')
        })
      );

      this.$toasted.success(
        `New ${this.type(this.newPeriod.type)} period will be added ${
          this.courseData.title
        } when you save.`
      );

      this.newPeriod = {
        day: 1,
        start: '08:00',
        end: '09:50',
        location: '',
        type: 'LEC'
      };
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
  p {
    margin-top: 5px;
  }
  //Button readability and interactivity
  button {
    margin-top: 10px;
    margin-right: 10px;
  }

  .remove-period,
  .add-period {
    cursor: pointer;
  }
}
</style>
