<!--Tools: Move-in checklist page-->
<template>
  <section class="section move-in-checklist">
    <h1 class="title has-text-centered-mobile">
      Dorm Move In Checklist
    </h1>
    <details
      v-if="!loggedIn"
      class="notification is-warning"
    >
      <summary>
        <i class="fas fa-info-circle" />

        <b>Info</b>
      </summary>Your checklist is only saved on your current device.
      <b>RPI Students</b> can login to <b>LATE</b> below to save their checklist
      to their account and access all the other features of the site!
    </details>
    <form
      @submit.prevent="addCategory"
    >
      <div class="columns">
        <div class="column is-narrow buttons">
          <b-button
            v-if="loggedIn"
            type="is-warning"
            @click="toggleEditing"
          >
            {{ editing ? "Save" : "Edit" }}
          </b-button>
          <b-button
            v-if="loggedIn && !editing"
            type="is-link"
          >
            Share
          </b-button>
          <a
            v-else-if="!loggedIn"
            class="button is-success"
            href="/auth/login"
          >
            <b>RPI Students:</b> Login to Save and Share
          </a>
        </div>
        <div
          v-if="editing"
          class="column"
        >
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
              <b-button
                :disabled="checklist.categories.length === 0"
                @click="clearChecklist"
              >
                Clear Categories
              </b-button>
            </p>
          </b-field>
        </div>
      </div>
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
          :editing="editing"
        />
      </div>
    </div>

    <template v-if="checklist.categories.length === 0">
      <p
        v-if="editing"
        class="has-text-grey has-text-cen"
      >
        Add categories above! You can then add items under each category, with a count of how many you need!
      </p>
      <p
        v-else
        class="has-text-grey has-text-cen"
      >
        No categories have been added yet! Go into <a @click="toggleEditing">edit mode</a> and add categories
        above!
      </p>
    </template>

    <hr>
  </section>
</template>

<script>
import MoveInChecklistCategory from '@/views/checklists/components/MoveInChecklistCategory';

export default {
  name: 'MoveInChecklist',
  components: { Category: MoveInChecklistCategory },
  data () {
    return {
      editing: false,
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
  async created () {
    await this.$store.dispatch('GET_CHECKLIST');
    if (this.checklist.categories.length === 0) this.editing = true;
  },
  methods: {
    clearChecklist () {
      this.$dialog.confirm({
        message: 'Totally clear your checklist? All items will be lost.',
        onConfirm: () => this.$store.commit('CLEAR_CHECKLIST')
      });
    },
    addCategory () {
      if (this.categoryTitles.includes(this.newCategory)) {
        this.$toast.open({
          message: 'You already have that category!',
          type: 'is-warning '
        });
        return;
      }
      this.$store.commit('ADD_CHECKLIST_CATEGORY', this.newCategory);
      this.newCategory = '';
    },
    async toggleEditing () {
      this.editing = !this.editing;

      if (!this.editing) {
        await this.$store.dispatch('SAVE_CHECKLIST');
        this.$toast.open('Saved checklist!');
      }
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
