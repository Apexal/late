<!--Assessments: assessment list filter module-->
<template>
  <details
    class="assessments-filter has-background-light box"
    :open="expanded"
    @toggle="toggleExpanded"
  >
    <summary class="has-text-centered">
      Filters
    </summary>
    <div class="filters-body has-background-white">
      <div class="is-flex">
        <label class="hide-label">Filter:</label>
        <div class="courses">
          <span
            v-for="c in courses"
            :key="c.crn"
            class="tag is-white course-tag level-item is-unselectable"
            :class="{ 'filtered-out': filter.includes(c.crn) }"
            :style="{ 'background-color': c.color }"
            :title="c.title"
            @click="$emit('toggle-filter', c)"
          >
            <span>{{ c.title }}</span>
          </span>
        </div>
      </div>
      <div class="is-flex">
        <div class="field">
          <b-checkbox
            :value="showCompleted"
            type="is-link"
            @input="$emit('toggle-show-completed')"
          >
            Show Completed Assignments
          </b-checkbox>
        </div>
        <div
          v-if="showGroupBy"
          class="field"
        >
          <label for="group-by-select">Group Items by</label>
          <select
            id="group-by-select"
            @change="$emit('change-group-by', $event.target.value)"
          >
            <option
              value="date"
              :selected="groupBy === 'date'"
            >
              Date
            </option>
            <option
              value="courseCRN"
              :selected="groupBy === 'courseCRN'"
            >
              Course
            </option>
          </select>
        </div>
      </div>
    </div>
  </details>
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
    }
  },
  data () {
    return {
      expanded: false
    };
  },
  mounted () {
    if (localStorage.getItem('assessmentsShowFilters')) {
      try {
        this.expanded = JSON.parse(
          localStorage.getItem('assessmentsShowFilters')
        );
      } catch (e) {
        localStorage.removeItem('assessmentsShowFilters');
      }
    }
  },
  methods: {
    toggleExpanded (event) {
      this.expanded = event.target.open;
      localStorage.setItem(
        'assessmentsShowFilters',
        JSON.stringify(this.expanded)
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.assessments-filter:hover {
  cursor: pointer;
}

.assessments-filter {
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
  margin-top: 10px;

  .filters-body {
    padding: 10px;
    animation: fadein 0.3s;
  }
  .is-flex {
    align-items: center;
    justify-content: center;

    &:not(:first-child) {
      padding-top: 10px;
    }
  }

  .field {
    margin: 0;
    padding: 0px 30px;
  }

  .subtitle {
    margin: 0;
  }

  .hide-label {
    font-weight: 500;
    width: 60px;
    align-self: flex-start;
  }

  #group-by-select {
    margin-left: 5px;
  }
}
span.tag.course-tag {
  cursor: pointer;
  margin: 0 2px;
  color: white;

  transition: opacity 0.1s ease-out;

  span {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &.filtered-out {
    opacity: 0.3;
    //color: #686868 !important;
    //background-color: rgb(214, 214, 214) !important;
  }
  &:hover:not(.filtered-out) {
    opacity: 0.8;
  }
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
