<template>
  <div
    :class="{'is-active': open}"
    class="modal dashboard-calendar-select-modal"
  >
    <div
      class="modal-background"
      @click="$emit('close-modal')"
    />
    <div class="modal-content panel">
      <p class="panel-heading">
        Schedule
        <b>{{ dateStrs.start }}</b> to
        <b>{{ dateStrs.end }}</b>
      </p>
      <div
        v-if="assessments.length === 0"
        class="panel-block has-text-grey"
      >
        No assignments or exams are open to work on at that time.
      </div>
      <div
        v-for="assessment in limitedAssessments"
        :key="assessment._id"
        class="panel-block is-flex"
        @click="$emit('add-work-block', assessment)"
      >
        <span style="flex: 1">
          <span
            class="tag assessment-type-tag"
            :style="{ 'background-color': course(assessment.courseCRN).color }"
          >
            {{ assessment.assessmentType }}
          </span>
          {{ assessment.title }}
        </span>
        <span
          class="has-text-grey is-pulled-right"
        >
          due {{ formatDate(assessment.dueDate || assessment.date) }}
        </span>
      </div>
      <template v-if="hasExtra">
        <div v-if="showingExtra">
          <div

            v-for="assessment in extraAssessments"
            :key="assessment._id"
            class="panel-block is-flex"
            @click="$emit('add-work-block', assessment)"
          >
            <span style="flex: 1">
              <span
                class="tag assessment-type-tag"
                :style="{ 'background-color': course(assessment.courseCRN).color }"
              >
                {{ assessment.assessmentType }}
              </span>
              {{ assessment.title }}
            </span>
            <span
              class="has-text-grey is-pulled-right"
            >
              due {{ formatDate(assessment.dueDate || assessment.date) }}
            </span>
          </div>
        </div>
        <div
          class="panel-block has-text-grey has-text-centered"
          @click="showingExtra = !showingExtra"
        >
          <span class="is-full-width">
            {{ showingExtra ? 'Hide' : 'Show' }} Extra ({{ extraAssessments.length }})
          </span>
        </div>
      </template>
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      @click="$emit('close-modal')"
    />
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'DashboardCalendarSelectModal',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    start: {
      type: Object,
      required: true
    },
    end: {
      type: Object,
      required: true
    },
    assessments: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      limit: 10,
      showingExtra: false
    };
  },
  computed: {
    dateStrs () {
      if (this.start.isSame(this.end, 'day')) {
        return {
          start: this.start.format('M/D/YY h:mm a'),
          end: this.end.format('h:mm a')
        };
      } else {
        return {
          start: this.start.format('M/D/YY h:mm a'),
          end: this.end.format('M/D/YY h:mm a')
        };
      }
    },
    limitedAssessments () {
      return this.assessments.slice(0, this.limit);
    },
    extraAssessments () {
      if (!this.hasExtra) return [];
      return this.assessments.slice(this.limit, this.assessments.length);
    },
    hasExtra () {
      return this.assessments.length > this.limit;
    }
  },
  methods: {
    formatDate (date) {
      return moment(date).format('M/D/YY h:mm A');
    },
    course (crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
