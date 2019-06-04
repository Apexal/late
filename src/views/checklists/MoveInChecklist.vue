<template>
  <section class="section move-in-checklist">
    <h1 class="title has-text-centered-mobile">
      Move In Checklist
    </h1>

    <form @submit.prevent="addCategory">
      <b-field>
        <b-input
          v-model="newCategory"
          type="text"
          placeholder="New category"
          required
          list="recommended-categories"
        />
        <datalist id="recommended-categories">
          <option
            v-for="(c, index) in remainingRecommendedCategories"
            :key="index"
            :value="c"
          />
        </datalist>

        <p class="control">
          <button class="button is-success">
            Add
          </button>
        </p>
      </b-field>
    </form>

    <hr>

    <div class="columns is-multiline categories">
      <div
        v-for="(category, index) in checklist.categories"
        :key="index"
        class="column is-one-third"
      >
        <Category
          :category-index="index"
          :category="category"
        />
      </div>
    </div>

    <hr>

    <div class="buttons">
      <b-button @click="clearChecklist">
        Clear
      </b-button>
      <b-button
        v-if="loggedIn"
        type="is-link"
      >
        Share
      </b-button>
    </div>
  </section>
</template>

<script>
import MoveInChecklistCategory from '@/views/components/checklists/MoveInChecklistCategory';

export default {
  name: 'MoveInChecklist',
  components: { Category: MoveInChecklistCategory },
  data () {
    return {
      newCategory: '',
      recommendedCategories: [
        'Bedroom Items',
        'Clothing',
        'Entertainment',
        'Footwear',
        'Office Supplies',
        'Outer Wear',
        'Technology',
        'Toiletries'
      ]
    };
  },
  computed: {
    checklist () {
      return this.$store.state.checklists.checklist;
    },
    remainingRecommendedCategories () {
      return this.recommendedCategories.filter(
        cat => !this.categoryTitles.includes(cat)
      );
    },
    categoryTitles () {
      return this.checklist.categories.map(cat => cat.title);
    }
  },
  created () {
    this.$store.commit('LOAD_CHECKLIST');
  },
  methods: {
    clearChecklist () {
      this.$store.commit('CLEAR_CHECKLIST');
      this.$store.commit('SAVE_CHECKLIST');
    },
    addCategory () {
      if (this.categoryTitles.includes(this.newCategory)) {
        this.$toast.open({
          message: 'You already have that category!',
          type: 'is-warning '
        });
        return;
      }
      this.$store.commit('ADD_CATEGORY', this.newCategory);
      this.$store.commit('SAVE_CHECKLIST');
      this.newCategory = '';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
