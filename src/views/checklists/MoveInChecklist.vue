<!--Tools: Move-in checklist page-->
<template>
  <section class="section move-in-checklist">
    <h1 class="title has-text-centered-mobile">
      Your Dorm Move In Checklist
    </h1>
    <form
      @submit.prevent="addCategory"
    >
      <b-field
        grouped
        group-multiline
      >
        <div class="control">
          <b-button
            type="is-warning"
            @click="toggleEditing"
          >
            {{ editing ? "Save" : "Edit" }}
          </b-button>
        </div>
        <template v-if="editing">
          <div class="control">
            <b-button
              :disabled="checklist.categories.length === 0"
              @click="clearChecklist"
            >
              Clear
            </b-button>
          </div>
          <b-field>
            <input
              v-model="newCategory"
              class="input"
              type="text"
              placeholder="New category"
              required
              list="recommended-categories"
            >
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
        </template>
        <template v-else>
          <b-button
            v-if="loggedIn && categories.length > 0"
            :title="checklist.private ? 'Click to make public.' : 'Click to make private.'"
            @click="togglePrivate"
          >
            <span class="icon">
              <i
                class="fas"
                :class="checklist.private ? 'fa-lock' : 'fa-unlock'"
              />
            </span>
            {{ checklist.private ? 'Private' : 'Public' }}
          </b-button>
          <input
            v-if="loggedIn && !checklist.private && categories.length > 0"
            type="text"
            class="input checklist-url"
            disabled
            :value="'https://www.late.work/checklist/' + checklist._id"
          >
          <a
            v-else-if="!loggedIn"
            class="button is-success"
            href="/auth/login"
          >
            <b>RPI Students:</b>&nbsp;Login to Save to Account
          </a>
        </template>
      </b-field>

      <div class="columns">
        <div
          v-if="editing"
          class="column"
        />
      </div>
    </form>

    <hr>

    <Draggable
      v-model="categories"
      :disabled="!editing"
      group="categories"
      class="columns is-desktop is-multiline categories"
    >
      <div
        v-for="(category, index) in checklist.categories"
        :key="index"
        class="column is-one-third-fullhd is-half-desktop is-full category-column"
        :title="editing ? 'Drag me to reorder categories!' : ''"
      >
        <Category
          :category-index="index"
          :category="category"
          :editing="editing"
        />
      </div>
    </Draggable>

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

    <div class="buttons">
      <router-link
        class="button is-link"
        :to="{name: 'tools'}"
      >
        <i class="fas fa-angle-left" />
        All Tools
      </router-link>
      <b-button
        :disabled="checklist.categories.length === 0"
        @click="download"
      >
        <span class="icon">
          <i class="fas fa-download" />
        </span>
        Download
      </b-button>
    </div>
  </section>
</template>

<script>
import Draggable from 'vuedraggable'

import MoveInChecklistCategory from '@/views/checklists/components/MoveInChecklistCategory'

export default {
  name: 'MoveInChecklist',
  components: { Draggable, Category: MoveInChecklistCategory },
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
    }
  },
  computed: {
    checklist () {
      return this.$store.state.checklists.checklist
    },
    categories: {
      get () {
        return this.checklist.categories
      },
      set (newCategories) {
        this.$store.commit('SET_CHECKLIST', { ...this.checklist, categories: newCategories })
      }
    },
    remainingRecommendedCategories () {
      return this.recommendedCategories.filter(
        cat => !this.categoryTitles.includes(cat)
      )
    },
    categoryTitles () {
      return this.checklist.categories.map(cat => cat.title)
    }
  },
  async created () {
    await this.$store.dispatch('GET_CHECKLIST')
    if (this.checklist.categories.length === 0) this.editing = true
  },
  methods: {
    download () {
      const lineArray = ['Category,Item,Count,Complete']
      for (const category of this.checklist.categories) {
        for (const item of category.items) {
          lineArray.push(`${category.title},${item.title},${item.count},${item.complete}`)
        }
      }

      const csv = lineArray.join('\n')

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, 'checklist.csv')
      } else {
        var link = document.createElement('a')
        if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', 'checklist.csv')
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    },
    clearChecklist () {
      this.$buefy.dialog.confirm({
        message: 'Totally clear your checklist? All items will be lost.',
        onConfirm: () => this.$store.commit('CLEAR_CHECKLIST')
      })
    },
    addCategory () {
      if (this.categoryTitles.includes(this.newCategory)) {
        this.$buefy.toast.open({
          message: 'You already have that category!',
          type: 'is-warning '
        })
        return
      }
      this.$store.commit('ADD_CHECKLIST_CATEGORY', this.newCategory)
      this.newCategory = ''
    },
    async toggleEditing () {
      this.editing = !this.editing

      if (this.editing) {
        // Enable navigation prompt
        window.onbeforeunload = function () {
          return true
        }
      } else {
        // Remove navigation prompt
        window.onbeforeunload = null
        await this.$store.dispatch('SAVE_CHECKLIST')
        this.$buefy.toast.open(`Saved checklist ${this.loggedIn ? 'to your account!' : 'to this device!'}`)
      }
    },
    togglePrivate () {
      this.$store.commit('SET_CHECKLIST', { ...this.checklist, private: !this.checklist.private })
      this.$store.dispatch('SAVE_CHECKLIST')

      this.$buefy.toast.open({
        type: 'is-success',
        message: `Checklist is now ${this.checklist.private ? 'private!' : 'public! Share the link to let others see your list.'}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.button i.fas {
  margin-right: 3px;
}

.private-field {
  display: inline-block;
}

.checklist-url {
  cursor: text;
}
</style>
