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
        />
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
        v-for="(category, index) in categories"
        :key="index"
        class="column is-one-third"
      >
        <Category
          :category="category"
          @add-item="addItem(index, arguments[0])"
        />
      </div>
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
      categories: [],
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
  methods: {
    addCategory () {
      this.categories.push({
        title: this.newCategory,
        items: []
      });
      this.newCategory = '';
    },
    addItem (categoryIndex, item) {
      this.categories[categoryIndex].items.push(item);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
