<template>
  <div class="course-grade-estimator box">
    <h2 class="subtitle">
      Course Grade Estimator
    </h2>

    <div class="buttons">
      <b-button>Clear</b-button>
    </div>
    <form
      class="form"
      @submit.prevent="addCategory"
    >
      <b-field>
        <b-input
          v-model.trim="newCategory"
          type="text"
          placeholder="15% Homework"
          required
        />
        <div class="control">
          <button class="button is-success">
            Add
          </button>
        </div>
      </b-field>
    </form>
    <hr>
    <div class="columns">
      <div class="column is-half">
        <ul v-if="categories.length">
          <li
            v-for="(category, index) in categories"
            :key="index"
          >
            <b-field grouped>
              <span
                class="icon has-text-danger remove-course"
                title="Remove category"
                @click="categories.splice(index, 1)"
              >
                <i class="fas fa-times" />
              </span>
              <b-field>
                <b-input
                  v-model.number="category.weight"
                  type="number"
                  min="0"
                  max="100"
                />
                <p class="control">
                  <span class="button is-static">%</span>
                </p>
              </b-field>
              <b>{{ category.title }}</b>
            </b-field>
          </li>
        </ul>
      </div>
      <div class="column is-half">
        C++
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseGradeEstimator',
  data () {
    return {
      newCategory: '',
      categories: []
    };
  },
  methods: {
    addCategory () {
      const parts = this.newCategory.split('%');
      const weight = parseInt(parts[0]);
      this.categories.push({
        title: parts[1],
        weight: weight,
        value: undefined
      });
      this.newCategory = '';
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
