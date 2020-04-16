<!--Courses: Individual course view-->
<template>
  <div class="course box">
    <template v-if="!editing">
      <details :open="highlighted || open">
        <summary
          class="is-clearfix is-unselectable"
          style="cursor:pointer;"
        >
          <span class="has-text-grey">{{ course.summary }}</span>
          {{ course.title }}
          <small class="has-text-grey">
            {{ course.periods.length }} periods |
            {{ course.links.length }} links
          </small>
          <b-taglist class="is-pulled-right">
            <b-tag v-if="course.credits">
              {{ course.credits }} credits
            </b-tag>
            <b-tag
              rounded
              :style="{'background-color': course.color, color: 'white'}"
              :title="'You are in Section ' + course.sectionId"
            >
              Section {{ course.sectionId }}
            </b-tag>
          </b-taglist>
          <span
            class="icon edit-course is-pulled-right"
            title="Click to edit this course"
            @click="editing = true"
          >
            <i class="fas fa-pencil-alt" />
          </span>
        </summary>

        <div class="periods">
          <table class="table is-fullwidth">
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
                :key="p.day + p.startTime"
              >
                <td>{{ day(p.day) }}</td>
                <td>
                  {{ time(p.startTime) }}
                  <span class="has-text-grey-light">-</span>
                  {{ time(p.endTime) }}
                </td>
                <td>
                  {{ p.location }}<a
                    class="icon fa fa-map-marker-alt location-link"
                    :href="'https://maps.google.com/?q=' + roomIntoLocation(p.location)"
                    title="Open in Google Maps"
                    target="_blank"
                  />
                </td>
                <td>{{ type(p.type) }}</td>
              </tr>
            </tbody>
          </table>

          <b-taglist class="course-links">
            <b-tag
              v-for="(l, index) in course.links"
              :key="index + l.url"
              type="is-link"
              class="course-link"
            >
              <span class="icon">
                <i class="fa fa-link" />
              </span>
              <a
                :href="l.url"
                target="_blank"
                style="color: white"
              >{{ l.name }}</a>
            </b-tag>
          </b-taglist>
        </div>
      </details>
    </template>
    <template v-else>
      <form
        class="course-edit"
        @submit.prevent="updateCourse"
      >
        <div class="columns is-multiline">
          <div class="column">
            <h1 class="title has-text-centered-mobile">
              Edit {{ courseData.originalTitle }}
              <h2 class="subtitle has-text-grey has-text-centered-mobile">
                {{ courseData.summary }} - Section {{ courseData.sectionId }}
              </h2>
            </h1>
          </div>
          <div class="column is-narrow has-text-centered-mobile">
            <div class="field">
              <b-checkbox
                v-model="courseData.hidden"
                title="Hidden courses will not show in the course selection list"
              >
                Hide from course list
              </b-checkbox>
            </div>
          </div>
        </div>
        <div class="columns">
          <div class="column">
            <label :for="'course-title-' + elementID">Course Title</label>
            <input
              :id="'course-title-' + elementID"
              v-model.trim="courseData.title"
              type="text"
              :placeholder="courseData.originalTitle"
              class="input course-title-input"
              required
            >
          </div>
          <div class="column">
            <label :for="'course-color-' + elementID">Select Color</label>
            <input
              :id="'course-color-' + elementID"
              v-model="courseData.color"
              type="color"
              class="input course-color-input"
              required
            >
          </div>
        </div>

        <div
          class="course-links"
          style="padding-bottom: 10px;"
        >
          <label :for="'course-links-' + elementID">Add/Remove Links</label>
          <b-taglist>
            <b-tag
              v-for="(link, index) in editedLinks"
              :key="index"
              type="is-link"
              closable
              class="course-link"
              @close="editedLinks.splice(index, 1)"
            >
              <i class="fa fa-link" />
              {{ link.name | limit }} -
              <span
                class="link-url"
                :title="link.url"
              >{{ link.url | limit }}</span>
            </b-tag>
          </b-taglist>
          <div class="field has-addons">
            <div class="control has-icons-left has-icons-right is-expanded">
              <input
                :id="'course-links-' + elementID"
                v-model="newLink.url"
                class="input is-primary"
                placeholder="Link url"
              >
              <input
                :id="'course-links-' + elementID"
                v-model="newLink.name"
                class="input is-primary"
                placeholder="Link name"
              >
              <span class="icon is-small is-left">
                <i
                  class="fa fa-plus"
                />
              </span>
            </div>
            <div class="control">
              <a
                class="button is-primary"
                @click="addLink"
              >
                Add
              </a>
            </div>
          </div>
        </div>

        <div class="periods">
          <table class="table is-fullwidth">
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
                :key="p.day + p.startTime"
              >
                <td>
                  <b-select
                    v-model.number="p.day"
                    size="is-small"
                    placeholder="Day"
                    required
                  >
                    <option
                      v-for="i in 7"
                      :key="i"
                      :value="i - 1"
                    >
                      {{ day(i - 1) }}
                    </option>
                  </b-select>
                </td>
                <td>
                  <input
                    v-model="p.startTime"
                    class="input is-small time-input"
                    type="time"
                    required
                  >
                  <span class="has-text-grey-light">-</span>
                  <input
                    v-model="p.endTime"
                    class="input is-small time-input"
                    type="time"
                    required
                  >
                </td>
                <td>
                  <b-input
                    v-model="p.location"
                    size="is-small"
                    type="text"
                    :placeholder="p.location"
                    maxlength="100"
                    :has-counter="false"
                    required
                  />
                </td>
                <td>
                  <b-select
                    v-model="p.type"
                    placeholder="Period type"
                    size="is-small"
                    required
                  >
                    <option
                      v-for="t in periodTypes"
                      :key="t"
                      :value="t"
                    >
                      {{ type(t) }}
                    </option>
                  </b-select>
                </td>
                <td title="Remove period.">
                  <i
                    class="fa fa-times has-text-danger remove-period"
                    @click="removePeriod(p)"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot class="has-background-success">
              <tr>
                <td>
                  <b-select
                    v-model.number="newPeriod.day"
                    placeholder="Choose day"
                    size="is-small"
                  >
                    <option
                      v-for="i in 7"
                      :key="i"
                      :value="i - 1"
                    >
                      {{ day(i - 1) }}
                    </option>
                  </b-select>
                </td>
                <td>
                  <input
                    v-model="newPeriod.startTime"
                    class="input time-input is-small"
                    type="time"
                  >
                  <span class="has-text-grey-light">-</span>
                  <input
                    v-model="newPeriod.endTime"
                    class="input time-input is-small"
                    type="time"
                  >
                </td>
                <td>
                  <b-input
                    v-model.trim="newPeriod.location"
                    size="is-small"
                    type="text"
                    maxlength="100"
                    :has-counter="false"
                    placeholder="Location of new period."
                  />
                </td>
                <td>
                  <b-select
                    v-model="newPeriod.type"
                    size="is-small"
                  >
                    <option
                      v-for="t in periodTypes"
                      :key="t"
                      :value="t"
                    >
                      {{ type(t) }}
                    </option>
                  </b-select>
                </td>
                <td title="Add new period">
                  <i
                    class="fa fa-plus has-text-white add-period"
                    @click="addPeriod"
                  />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div>
          <b-button
            :disabled="saved"
            type="is-primary"
            class="is-pulled-right"
            @click="updateCourse"
          >
            Save
          </b-button>
          <b-button
            type="is-warning"
            class="is-pulled-right"
            @click="cancel"
          >
            Cancel
          </b-button>
          <b-button
            type="is-danger"
            @click="confirmRemoveCourse"
          >
            Remove
          </b-button>
        </div>
      </form>
    </template>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AccountCourse',
  filters: {
    limit: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.length > 50 ? value.slice(0, 50) + '...' : value
    }
  },
  props: {
    course: {
      type: Object,
      required: true,
      default: () => {}
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      open: false,
      newLink: {
        name: '',
        url: ''
      },
      courseData: Object.assign({}, this.course),
      editedLinks: this.course.links.slice(0),
      editedPeriods: JSON.parse(JSON.stringify(this.course.periods)),
      editing: false,
      periodTypes: ['LEC', 'REC', 'LAB', 'TES', 'STU', 'MET'],
      newPeriod: {
        day: undefined,
        startTime: '08:00',
        endTime: '09:50',
        location: '',
        type: 'LEC'
      }
    }
  },
  computed: {
    elementID () {
      return this.course._id
    },
    sortedPeriods () {
      return this.course.periods
        .concat()
        .sort((a, b) => parseInt(a.day) - parseInt(b.day))
    },
    saved () {
      return (
        JSON.stringify(this.currentCourse) ===
        JSON.stringify(this.updatedCourse)
      )
    },
    currentCourse () {
      return {
        _id: this.course._id,
        sectionId: this.course.sectionId,
        title: this.course.title,
        color: this.course.color,
        links: this.course.links,
        periods: this.course.periods,
        hidden: this.course.hidden
      }
    },
    updatedCourse () {
      return {
        _id: this.course._id,
        sectionId: this.courseData.sectionId,
        title: this.courseData.title,
        color: this.courseData.color,
        links: this.editedLinks,
        periods: this.editedPeriods,
        hidden: this.courseData.hidden
      }
    }
  },
  watch: {
    course (newCourse) {
      this.courseData = Object.assign({}, this.course)
      this.editedLinks = this.course.links.slice(0)
      this.editedPeriods = JSON.parse(JSON.stringify(this.course.periods))
    },
    highlighted (newHighlighted) {
      if (newHighlighted) {
        this.open = true
      }
    }
  },
  methods: {
    roomIntoLocation (location) {
      return this.$store.getters.roomIntoLocation(location)
    },
    addLink () {
      this.editedLinks.push(this.newLink)
      this.newLink = {
        name: '',
        url: ''
      }
    },
    changePeriodTime (p, startOrEnd, inputFormat) {
      p[startOrEnd] = moment(inputFormat, 'HH:mm', true).format('HH:mm')
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
      const dt = moment(t, 'HH:mm', true)
      if (dt.hours() === 12 && dt.minutes() === 0) {
        return 'Noon'
      } else if (dt.minutes() === 0) {
        return dt.format('ha')
      }
      return dt.format('h:mma')
    },
    formatToInputTime: oldFormat =>
      moment(oldFormat, 'HH:mm', true).format('HH:mm'),
    type (pType) {
      return this.$store.getters.periodType(pType)
    },
    cancel () {
      this.courseData = Object.assign({}, this.course)
      this.editedLinks = this.course.links.slice(0)
      this.editedPeriods = JSON.parse(JSON.stringify(this.course.periods))
      this.editing = false
    },
    confirmRemoveCourse () {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to remove this course? You should only do this if you are no longer in the course. Otherwise, just mark the course as hidden.',
        confirmText: 'Remove Course',
        type: 'is-danger',
        hasIcon: true,
        icon: 'trash-alt',
        onConfirm: () => {
          this.$emit('remove-course')
        }
      })
    },
    async updateCourse () {
      if (
        this.courseData.title.length === 0 ||
        this.courseData.sectionId.length === 0
      ) {
        return this.showError('You cannot set an empty name or section for a course!')
      }

      let updatedCourse
      try {
        updatedCourse = await this.$store.dispatch(
          'UPDATE_COURSE',
          {
            courseID: this.course.id,
            updates: this.updatedCourse
          }
        )
      } catch (e) {
        const message = e.response ? e.response.data.message : e.message
        return this.showError(message)
      }

      this.$buefy.toast.open({
        duration: 2000,
        message: `Updated '${updatedCourse.title}'`,
        type: 'is-success'
      })

      this.editing = false
      this.open = true
    },
    removePeriod (periodToRemove) {
      this.$buefy.dialog.confirm({
        title: 'Confirm Remove Period',
        message: `Remove <b>${this.courseData.title} ${this.type(
          periodToRemove.type
        )}</b> period on ${this.day(periodToRemove.day)} from <b>${moment(
          periodToRemove.startTime,
          'HH:mm',
          true
        ).format('h:mma')}</b> to <b>${moment(
          periodToRemove.endTime,
          'HH:mm',
          true
        ).format('h:mma')}</b>?`,
        confirmText: 'Yes',
        type: 'is-danger',
        onConfirm: () => {
          // Remove period by filtering by day and start time
          this.editedPeriods = this.editedPeriods.filter(
            p =>
              !(
                p.day === periodToRemove.day && p.startTime === periodToRemove.startTime
              )
          )
        }
      })
    },
    addPeriod () {
      // Validate
      if (
        this.newPeriod.location.length === 0 ||
        !this.newPeriod.startTime ||
        !this.newPeriod.endTime
      ) {
        return this.showError('Make sure the time and location is set!')
      }
      // Remeber to convert start/end from HH:mm to HH:mm
      this.editedPeriods.push(
        Object.assign({}, this.newPeriod, {
          startTime: moment(this.newPeriod.startTime, 'HH:mm', true).format('HH:mm'),
          endTime: moment(this.newPeriod.endTime, 'HH:mm', true).format('HH:mm')
        })
      )

      this.newPeriod = {
        day: 1,
        startTime: '08:00',
        endTime: '09:50',
        location: '',
        type: 'LEC'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.periods {
  overflow: auto;
}

.course.box {

  .tags {
    margin: 0;
    .tag {
      //padding: 10px;
      margin-bottom: 0;
    }
  }

  .edit-course {
    display: none;
    cursor: pointer;
  }
  &:hover {
    .edit-course {
      display: inherit;
    }
  }

  .time-input {
    width: unset;
    max-width: unset;
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

td .location-link {
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

td:hover .location-link {
  opacity: 1;
}
</style>
