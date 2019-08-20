<!--Tools: GPA Calculator-->
<template>
  <div class="gpa-calculator">
    <h2 class="subtitle">
      GPA Calculator
    </h2>

    <form
      class="form"
      @submit.prevent="addCourse"
    >
      <b-field
        grouped
        class="is-block-touch"
      >
        <b-field class="add-course">
          <b-input
            v-model.trim="newCourseTitle"
            type="text"
            placeholder="Add a course"
            required
          />
          <p class="control">
            <button class="button is-success">
              Add
            </button>
          </p>
        </b-field>
        <b-field>
          <div class="buttons">
            <b-button
              v-if="!onBreak"
              class="auto-fill-courses"
              type="is-dark"
              @click="fillCourses"
            >
              Auto Fill Courses
            </b-button>
            <b-button
              class="clear-courses"
              type="is-warning"
              @click="enteredCourses = []"
            >
              Clear Courses
            </b-button>
          </div>
        </b-field>
      </b-field>
    </form>
    <hr>
    <div class="columns">
      <div class="column is-half">
        <ul v-if="enteredCourses.length">
          <li
            v-for="(c, index) in enteredCourses"
            :key="index"
          >
            <b-field grouped>
              <span
                class="icon has-text-danger remove-course"
                title="Remove course"
                @click="enteredCourses.splice(index, 1)"
              >
                <i class="fas fa-times" />
              </span>
              <b-field>
                <b-select
                  v-model="c.gradeValue"
                  placeholder="Grade"
                >
                  <option
                    v-for="(gradeValue, letter) in grades"
                    :key="gradeValue"
                    :value="gradeValue"
                  >
                    {{ letter }}
                  </option>
                </b-select>
              </b-field>
              <b-field>
                <b-input
                  v-model.number="c.credits"
                  type="number"
                  min="0"
                  max="10"
                />
                <p class="control">
                  <span class="button is-static">credits</span>
                </p>
              </b-field>
              <b>{{ c.title }}</b>
            </b-field>
          </li>
        </ul>
        <p
          v-else
          class="has-text-centered has-text-grey"
        >
          Add courses manually above or auto fill this semester's courses above!
        </p>
      </div>
      <div class="column is-half has-text-centered">
        <div v-if="enteredCourses.length > 0 && allGradesIn">
          <span class="has-text-grey">GPA</span>
          <h1 class="title gpa">
            {{ gpa }}
          </h1>
        </div>
        <div
          v-else
          class="has-text-grey"
        >
          Please enter all your grades to see a GPA!
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const grades = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0
}

export default {
  name: 'GPACalculator',
  data () {
    return {
      grades,
      newCourseTitle: '',
      enteredCourses: []
    }
  },
  computed: {
    allGradesIn () {
      return this.enteredCourses.every(
        course => course.gradeValue !== undefined && course.credits !== undefined
      )
    },
    gpa () {
      const total = this.enteredCourses.reduce(
        (acc, course) => acc + course.gradeValue * course.credits,
        0
      )
      const takenCredits = this.enteredCourses.reduce(
        (acc, course) => acc + course.credits,
        0
      )

      return (total / takenCredits).toFixed(2)
    }
  },
  methods: {
    fillCourses () {
      this.enteredCourses = this.courses
        .filter(course => course.credits)
        .map(course => ({
          title: course.title,
          gradeValue: undefined,
          credits: course.credits
        }))
    },
    addCourse () {
      this.enteredCourses.push({
        title: this.newCourseTitle,
        gradeValue: undefined,
        credits: 4
      })
      this.newCourseTitle = ''
    },
    launch (utilName) {
      this.$toast.open({
        message: 'Coming soon!',
        type: 'is-warning'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.subtitle {
  font-weight: bold;
}

.remove-course {
  cursor: pointer;
  height: 36px;
  width: 10px;
  margin-right: 10px;
}

.gpa {
  font-size: 5em;
}
</style>
