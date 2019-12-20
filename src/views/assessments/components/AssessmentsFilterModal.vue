<!--Assessments: assessment list filter module-->
<template>
  <b-modal
    class="assessments-filter-modal"
    :active="open"
    has-modal-card
    @close="$emit('close-modal')"
  >
    <div
      class="modal-card"
    >
      <header class="modal-card-head">
        <p class="modal-card-title">
          Filter Assignments and Exams
        </p>
      </header>
      <section class="modal-card-body">
        <div class="columns is-multiline">
          <div
            v-for="c in courses"
            :key="c.crn"
            class="column is-half"
          >
            <div class="field">
              <b-checkbox
                v-model="filteredCourses"
                type="is-link"
                :native-value="c.crn"
              >
                Hide {{ c.title }}
              </b-checkbox>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <b-field v-if="showGroupBy">
              <div class="select">
                <select
                  id="group-by-select"
                  :value="groupBy"
                  @change="$emit('change-group-by', $event.target.value)"
                >
                  <option
                    value="date"
                    :selected="groupBy === 'date'"
                  >
                    Group by Date
                  </option>
                  <option
                    value="courseCRN"
                    :selected="groupBy === 'courseCRN'"
                  >
                    Group by Course
                  </option>
                </select>
              </div>
            </b-field>
          </div>

          <div class="column">
            <b-field>
              <b-checkbox
                :value="showCompleted"
                type="is-link"
                @input="$emit('toggle-show-completed')"
              >
                Show Completed Assignments
              </b-checkbox>
            </b-field>
          </div>

          <div class="column">
            <b-field>
              <b-checkbox
                :value="showScheduled"
                type="is-link"
                @input="$emit('toggle-show-scheduled')"
              >
                Show Scheduled Time
              </b-checkbox>
            </b-field>
          </div>
        </div>
      </section>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'AssessmentFilterModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Array,
      required: true
    },
    showCompleted: {
      type: Boolean,
      default: true,
      required: false
    },
    showGroupBy: {
      type: Boolean,
      default: false,
      required: false
    },
    groupBy: {
      type: String,
      default: 'dueDate',
      required: false
    },
    showScheduled: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  computed: {
    filteredCourses: {
      get () {
        return this.filter
      },
      set (newCourseCRNS) {
        this.$emit('set-filter-course-crns', newCourseCRNS)
      }
    }
  },
  mounted () {
    if (localStorage.getItem('assessmentsShowFilters')) {
      try {
        this.expanded = JSON.parse(
          localStorage.getItem('assessmentsShowFilters')
        )
      } catch (e) {
        localStorage.removeItem('assessmentsShowFilters')
      }
    }
  },
  methods: {
    toggleExpanded () {
      this.expanded = !this.expanded
      localStorage.setItem(
        'assessmentsShowFilters',
        JSON.stringify(this.expanded)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.toggle-filters {
  cursor: pointer;
}

// .assessments-filter {
//   margin-top: 8px;
//   padding: 5px;

//   // Hide the filters if they are toggled off
//   .columns {
//     &.expanded {
//       display: flex;
//     }
//   }
// }

// .bottom-filters {
//   padding-top: 17px;

//   .field {
//     text-align: center;
//     flex: 1;
//     margin: 0;
//   }
// }

.courses {
  line-height: 2;
}

.course-tag {
  margin: 0 2px;
  cursor: pointer;

  transition: all 0.1s ease-out;

  span {
    color: white;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &.filtered-out {
    background-color: initial !important;
    span {
      color: grey !important;
    }
  }
//   &:hover:not(.filtered-out) {
//     opacity: 0.8;
//   }
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
