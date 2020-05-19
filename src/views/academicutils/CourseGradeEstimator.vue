<!--Tools: Course Grade Calculator-->
<template>
  <div class="course-grade-estimator">
    <h2 class="subtitle">
      Course Grade Estimator
    </h2>

    <form
      class="form"
      @submit.prevent="addCategory"
    >
      <b-field
        grouped
        group-multiline
        class="is-block-touch"
      >
        <b-field
          v-if="loggedIn && !onBreak"
          class="choose-course"
        >
          <b-select
            v-model="selectedCourseCRN"
            placeholder="Choose course"
          >
            <option
              v-for="course in courses"
              :key="course.crn"
              :value="course.crn"
            >
              {{ course.title }}
            </option>
          </b-select>
        </b-field>
        <b-field class="add-category">
          <b-input
            v-model.trim="newCategory"
            type="text"
            placeholder="15% Homework"
            :disabled="totalWeight === 100"
            required
          />
          <div class="control">
            <button class="button is-success">
              Add
            </button>
          </div>
        </b-field>

        <b-button
          class="clear-categories"
          :disabled="categories.length === 0"
          @click="categories = []"
        >
          Clear
        </b-button>

        <b-tag
          class="total-weight"
          size="is-medium"
          :type="totalWeight === 100 ? 'is-success' : 'is-warning'"
        >
          Total Weight {{ totalWeight }}%
        </b-tag>
        <div class="control">
          <b-button
            v-if="loggedIn && selectedCourse"
            @click="save"
          >
            Save Categories for {{ selectedCourse.title }}
          </b-button>
        </div>
      </b-field>
    </form>
    <hr>
    <div v-if="categories.length">
      <div class="columns is-multiline">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="column is-half"
        >
          <div class="box category">
            <span
              class="category-weight"
              :class="relativeSizeClass(category.weight)"
              @click="changeWeight(index)"
            >{{ category.weight }}%</span>
            <span
              class="delete category-remove"
              @click="categories.splice(index, 1)"
            />
            <h2 class="subtitle category-title">
              {{ category.title }}
            </h2>

            <b-field
              label="Your Grades"
              expanded
            >
              <b-field expanded>
                <b-taginput
                  v-model="category.values"
                  :allow-duplicates="true"
                  :attached="true"
                  :before-adding="validateValue"
                  ellipsis
                  icon="label"
                  placeholder="91, 45/50, etc."
                />
                <p class="control">
                  <span class="button is-static">
                    {{
                      categoryAverages[category.title]
                        ? round(categoryAverages[category.title], 2)
                        : "?"
                    }}%
                  </span>
                </p>
              </b-field>
            </b-field>
          </div>
        </div>
      </div>

      <div class="box has-background-dark has-text-white has-text-centered">
        <span v-if="totalWeight === 100 && !isNaN(totalWeightedAverage)">
          FINAL GRADE
          <h1 class="is-size-1">{{ round(totalWeightedAverage) }}%</h1>
        </span>
        <span
          v-else-if="totalWeight !== 100"
        >The category weights don't add up to 100%!</span>
        <span
          v-else
        >Add grades for each category to see your overall course grade!</span>
      </div>
    </div>
    <p
      v-else
      class="has-text-centered has-text-grey"
    >
      Add categories above, e.g.
      <b>45% Homework</b> and <b>10% Quizzes</b>.
    </p>
  </div>
</template>

<script>
export default {
  name: 'CourseGradeEstimator',
  data () {
    return {
      selectedCourseCRN: '00000',
      newCategory: '',
      categories: []
    }
  },
  computed: {
    selectedCourse () {
      return this.courses.find(c => c.crn === this.selectedCourseCRN)
    },
    totalWeight () {
      return this.categories.reduce(
        (acc, category) => acc + category.weight,
        0
      )
    },
    categoryAverages () {
      const averages = {}
      this.categories.forEach(category => {
        const values = category.values

        averages[category.title] =
          values.reduce((acc, v) => acc + this.getGradeValue(v), 0) /
          values.length
      })
      return averages
    },
    totalWeightedAverage () {
      return this.categories.reduce(
        (acc, category) =>
          acc + (category.weight / 100) * this.categoryAverages[category.title],
        0
      )
    }
  },
  watch: {
    courses: 'getCategories',
    selectedCourseCRN: 'getCategories'
  },
  mounted () {
    this.getCategories()
  },
  methods: {
    getGradeValue (gradeString) {
      // Convert fractions to decimals
      if (gradeString.indexOf('/') !== -1) {
        const parts = gradeString.split('/').map(val => parseFloat(val))

        return (parts[0] / parts[1]) * 100
      }
      return parseFloat(gradeString)
    },
    changeWeight (categoryIndex) {
      this.$buefy.dialog.prompt({
        message: `Change weight of ${this.categories[categoryIndex].title}`,
        inputAttrs: {
          type: 'number',
          placeholder: '%',
          value: this.categories[categoryIndex].weight,
          maxlength: 2,
          min: 0
        },
        onConfirm: value => (this.categories[categoryIndex].weight = +value)
      })
    },
    getCategories () {
      if (this.loggedIn) {
        if (this.selectedCourse) {
          this.categories = this.selectedCourse.gradingCategories.map(cat => ({
            ...cat,
            values: []
          }))
        }
      } else {
        return JSON.parse(
          localStorage.getItem('courseGradeEstimatorCategories')
        )
      }
    },
    async save () {
      if (this.loggedIn) {
        try {
          await this.$store.dispatch(
            'UPDATE_COURSE',
            {
              courseID: this.selectedCourse.id,
              updates: { gradingCategories: this.categories }
            }
          )
        } catch (e) {
          const message = e.response ? e.response.data.message : e.message
          return this.showError(message)
        }

        this.$buefy.toast.open({
          type: 'is-success',
          message: 'Saved grading categories for ' + this.selectedCourse.title
        })
      } else {
        localStorage.setItem(
          'courseGradeEstimatorCategories',
          JSON.stringify(this.categories)
        )
      }
    },
    relativeSizeClass (weight) {
      if (weight >= 90) {
        return 'is-size-1'
      } else if (weight >= 70) {
        return 'is-size-2'
      } else if (weight >= 50) {
        return 'is-size-3'
      } else if (weight >= 30) {
        return 'is-size-4'
      }
      return 'is-size-5'
    },
    round (num) {
      return num.toFixed(2)
    },
    validateValue (val) {
      try {
        parseInt(val)
        return true
      } catch (e) {
        return false
      }
    },
    addCategory () {
      if (this.totalWeight === 100) return

      const parts = this.newCategory.split('%')
      if (parts.length !== 2) {
        this.$buefy.toast.open({
          type: 'is-warning',
          message: 'That\'s not a valid category! Type it like "54% Tests"'
        })
        return
      }
      const weight = parseInt(parts[0])
      this.categories.push({
        title: parts[1].trim(),
        weight: weight,
        values: []
      })
      this.newCategory = ''

      if (!this.loggedIn) this.save()
    }
  }
}
</script>

<style lang="scss" scoped>
.subtitle {
  font-weight: bold;
}
.category {
  position: relative;

  .category-title {
    font-weight: 600;
    font-size: 2em;
  }

  .category-weight {
    position: absolute;
    top: 10px;
    right: 20px;
  }

  .category-remove {
    position: absolute;
    top: 5px;
    right: 5px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    .category-remove {
      opacity: 1;
    }
  }
}
</style>
