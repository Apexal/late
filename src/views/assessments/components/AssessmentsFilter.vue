<!--Assessments: assessment list filter module-->
<template>
  <div class="assessments-filter has-background-light box">
    <p
      class="toggle-filters has-text-centered"
      @click="toggleExpanded"
    >
      <b>{{ expanded ? "Hide" : "Show" }} Filters</b>
      <span class="icon">
        <i
          class="fas"
          :class="expanded ? 'fa-angle-up' : 'fa-angle-down'"
        />
      </span>
    </p>
    <div
      class="columns is-multiline is-vcentered courses-container"
      :class="{expanded}"
    >
      <div class="column is-full-touch has-text-centered-touch courses">
        <span
          v-for="c in courses"
          :key="c.crn"
          class="tag is-white course-tag level-item is-unselectable"
          :class="{'filtered-out': filter.includes(c.crn)}"
          :style="{'background-color': c.color}"
          :title="c.title"
          @click="$emit('toggle-filter', c)"
        >
          <span>{{ c.title }}</span>
        </span>
      </div>
      <div class="column is-narrow-desktop has-text-centered bottom-filters">
        <button
          class="button is-warning"
          @click="isEditFiltersActive = true"
        >
          Edit Filters
        </button>
        <b-modal
          :active.sync="isEditFiltersActive"
          has-modal-card
        >
          <div
            class="modal-card"
            style="width: auto"
          >
            <header class="modal-card-head">
              <p class="modal-card-title">
                Filters
              </p>
            </header>
            <section class="modal-card-body">
              <b-field>
                <b-checkbox
                  :value="showCompleted"
                  type="is-link"
                  @input="$emit('toggle-show-completed')"
                >
                  Show Completed Assignments
                </b-checkbox>
                <b-checkbox
                  :value="showScheduled"
                  type="is-link"
                  @input="$emit('toggle-show-scheduled')"
                >
                  Show Scheduled Time
                </b-checkbox>
              </b-field>
            </section>
          </div>
        </b-modal>
      </div>
      <div class="column has-text-centered is-narrow-desktop">
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssessmentFilter',
  props: {
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
  data () {
    return {
      expanded: false,
      isEditFiltersActive: false
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

.assessments-filter {
  margin-top: 8px;
  padding: 5px;

  // Hide the filters if they are toggled off
  .columns {
    display: none;
    &.expanded {
      display: flex;
    }
  }
}

.bottom-filters {
  padding-top: 17px;

  .field {
    text-align: center;
    flex: 1;
    margin: 0;
  }
}

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
