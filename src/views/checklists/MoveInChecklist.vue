<!--Tools: Move-in checklist page-->
<template>
  <section class="section move-in-checklist">
    <h1 class="title has-text-centered-mobile">
      Move In Checklist
    </h1>
    <details
      v-if="!loggedIn"
      class="notification is-warning"
    >
      <summary>
        <i class="fas fa-info-circle" />

        <b>Info</b>
      </summary>Your checklist is only saved on your current device.
      <b>RPI Students</b> can login to
      <b>LATE</b> below to save their checklist
      to their account and access all the other features of the site!
    </details>
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

    <div class="columns is-desktop is-multiline categories">
      <div
        v-for="(category, index) in checklist.categories"
        :key="index"
        class="column is-one-third-fullhd is-half-desktop is-full"
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
      <a
        v-else
        class="button is-success"
        href="/auth/login"
      >
        <b>RPI Students:</b> Login to Save
      </a>
    </div>
  </section>
</template>

<script>
import MoveInChecklistCategory from '@/views/checklists/components/MoveInChecklistCategory';

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
    this.$store.dispatch('GET_CHECKLIST');
  },
  methods: {
    clearChecklist () {
      this.$store.dispatch('CLEAR_CHECKLIST');
    },
    addCategory () {
      if (this.categoryTitles.includes(this.newCategory)) {
        this.$toast.open({
          message: 'You already have that category!',
          type: 'is-warning '
        });
        return;
      }
      this.$store.dispatch('ADD_CATEGORY', this.newCategory);
      this.newCategory = '';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
