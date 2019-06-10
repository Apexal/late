<template>
  <div class="course-grade-estimator ">
    <h2 class="subtitle">
      Course Grade Estimator
    </h2>

    <form
      class="form"
      @submit.prevent="addCategory"
    >
      <b-field grouped>
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

        <b-button
          :disabled="categories.length === 0"
          @click="categories = []"
        >
          Clear
        </b-button>
      </b-field>
    </form>
    <hr>
    <div
      v-if="categories.length"
      class="columns is-multiline"
    >
      <div
        v-for="(category, index) in categories"
        :key="index"
        class="column is-half"
      >
        <div class="box">
          <h2 class="subtitle">
            {{ category.title }}
          </h2>

          <b-field
            label="Weight"
            expanded
          >
            <b-field expanded>
              <input
                v-model.number="category.weight"
                class="is-fullwidth"
                type="range"
                min="0"
                max="100"
              >
              <p class="control">
                <span class="button is-static">{{ category.weight }}%</span>
              </p>
            </b-field>
          </b-field>
          <b-field
            label="Values"
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
                placeholder="Add a tag"
              />
              <p class="control">
                <span
                  class="button is-static"
                >{{
                  categoryAverages[category.title]
                    ? round(categoryAverages[category.title], 2)
                    : "?"
                }}%</span>
              </p>
            </b-field>
          </b-field>
        </div>
      </div>
    </div>
    <b>Total Weights:</b><b-tag
      :type="totalWeight === 100 ? 'is-success' : 'is-warning'"
    >
      {{ totalWeight }}%
    </b-tag>

    <div
      v-if="categories.length"
      class="box has-background-dark has-text-white has-text-centered"
    >
      <span v-if="totalWeight === 100 && !isNaN(totalWeightedAverage)">
        FINAL GRADE
        <h1 class="is-size-1">{{ round(totalWeightedAverage) }}%</h1>
      </span>
      <span v-else-if="totalWeight !== 100">
        The weights don't add up to 100%!
      </span>
      <span v-else>
        Add grades for each category!
      </span>
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
  computed: {
    totalWeight () {
      return this.categories.reduce(
        (acc, category) => acc + category.weight,
        0
      );
    },
    categoryAverages () {
      const averages = {};
      this.categories.forEach(category => {
        const values = category.values;

        averages[category.title] =
          values.reduce((acc, v) => acc + (v ? parseInt(v) : 0), 0) /
          values.length;
      });
      return averages;
    },
    totalWeightedAverage () {
      return this.categories.reduce(
        (acc, category) =>
          acc + (category.weight / 100) * this.categoryAverages[category.title],
        0
      );
    }
  },
  methods: {
    round (num) {
      return num.toFixed(2);
    },
    validateValue (val) {
      try {
        parseInt(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    addCategory () {
      const parts = this.newCategory.split('%');
      if (parts.length !== 2) {
        this.$toast.open({
          type: 'is-warning',
          message: 'That\'s not a valid category! Type it like "54% Tests"'
        });
        return;
      }
      const weight = parseInt(parts[0]);
      this.categories.push({
        title: parts[1].trim(),
        weight: weight,
        values: []
      });
      this.newCategory = '';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
