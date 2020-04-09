<!--Assessments: Overview exam study plan module-->
<template>
  <div class="exam-overview-study-plan">
    <b-notification
      v-if="editing"
      type="is-warning"
      class="is-small"
    >
      <details>
        <summary>
          <span class="icon">
            <i class="fas fa-info-circle" />
          </span>
          <b>Study Plan Help</b>
        </summary>You can keep track of your plan of attack for studying for exams here.
        Use this to plan out categorically how you will study. You can create
        categories such as
        <code>Chapter 1</code>,
        <code>Chapter 2</code>, etc.
        with checkpoints for each such as
        <code>Reread textbook</code>,
        <code>Do pratice test</code>, etc. You can also add multiple
        categories/checkpoints at the same time by separating them with a
        semicolon, e.g.
        <code>Chapter 1; Chapter 2</code>
      </details>
    </b-notification>
    <p
      v-if="totalItemCount === 0 && !editing"
      class="has-text-grey has-text-centered"
    >
      You have not made a study plan yet!
    </p>
    <Draggable
      v-model="studyPlan"
      :disabled="!editing"
      tag="ol"
      class="columns is-multiline"
      group="categories"
      @change="orderChanged"
    >
      <li
        v-for="(item, index) in studyPlan"
        :key="index"
        class="column is-half category"
        :class="{draggable: editing}"
      >
        <label class="category-label">
          <i
            v-if="editing"
            class="fas fa-grip-horizontal"
          />
          <input
            v-else
            type="checkbox"
            :checked="item.completed"
            :disabled="loading"
            @change="setCategoryCompleted(index, !item.completed)"
          >
          {{ item.text }}
        </label>
        <span
          v-if="editing"
          class="delete delete-item"
          title="Remove this category"
          @click="deleteCategory(index)"
        />
        <ol
          v-if="item.children"
          class="category-children"
        >
          <Draggable
            v-model="item.children"
            :disabled="!editing"
            :group="item.text + '-children'"
            @change="orderChanged"
          >
            <li
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
              class="child-item"
              :class="{draggable: editing}"
            >
              <label>
                <i
                  v-if="editing"
                  class="fas fa-grip-horizontal"
                />
                <input
                  v-else
                  type="checkbox"
                  :checked="child.completed"
                  :disabled="loading"
                  @change="
                    setChildCompleted(index, childIndex, !child.completed)
                  "
                >
                {{ child.text }}
              </label>
              <span
                v-if="editing"
                class="delete delete-item"
                title="Remove this item"
                @click="deleteChildItem(index, childIndex)"
              />
            </li>
          </Draggable>
          <li
            v-if="editing"
            class="add-child-item"
          >
            <form @submit.prevent="addChildItem(index, $event)">
              <input
                type="text is-fullwidth"
                class="input"
                name="child-item-name"
                maxlength="200"
                placeholder="New checkpoint"
              >
            </form>
          </li>
        </ol>
      </li>
    </Draggable>
    <form
      v-if="editing"
      @submit.prevent="addCategory"
    >
      <input
        v-model="newCategory"
        class="input new-checkpoint-input"
        type="text is-fullwidth"
        placeholder="New Category"
        maxlength="200"
        required
      >
    </form>
    <hr>
    <span
      class="is-flex"
      :style="{'align-items': 'center'}"
    >
      <b-button
        type="is-warning"
        class="edit-study-plan"
        @click="editing = !editing"
      >{{ editing ? "Save Plan" : "Edit Plan" }}</b-button>
      <progress
        class="progress is-success has-tooltip-bottom"
        :value="completedCount"
        :title="completedPercent + '%'"
        :max="totalItemCount"
      >{{ completedPercent }}%</progress>
    </span>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'

export default {
  name: 'ExamOverviewStudyPlan',
  components: {
    Draggable
  },
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      editing: false,
      newCategory: '',
      studyPlan: []
    }
  },
  computed: {
    completedCount () {
      return this.studyPlan.reduce(
        (acc, item) =>
          acc +
          (item.children.length
            ? item.children.filter(c => c.completed).length
            : item.completed),
        0
      )
    },
    totalItemCount () {
      return this.studyPlan.reduce(
        (acc, item) => acc + (item.children.length ? item.children.length : 1), // count header only if no children
        0
      )
    },
    completedPercent () {
      if (this.totalItemCount === 0) return 0
      return Math.round((this.completedCount / this.totalItemCount) * 100)
    }
  },
  watch: {
    assessment (newAssessemnt) {
      this.studyPlan = JSON.parse(JSON.stringify(newAssessemnt.studyPlan))
    }
  },
  mounted () {
    this.studyPlan = JSON.parse(JSON.stringify(this.assessment.studyPlan))
  },
  methods: {
    async orderChanged () {
      await this.updateStudyPlan(this.studyPlan)
    },
    async addCategory (event) {
      if (!this.newCategory) return

      const items = this.newCategory
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length)

      items.forEach(text =>
        this.studyPlan.push({
          text,
          children: [],
          completed: false
        })
      )

      this.newCategory = ''

      await this.updateStudyPlan(this.studyPlan)
    },
    async addChildItem (itemIndex, event) {
      const text = event.target['child-item-name'].value.trim()
      // account for multiple items separated by semicolon

      const items = text
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length)

      this.studyPlan[itemIndex].completed = false
      items.forEach(item => {
        this.studyPlan[itemIndex].children.push({
          text: item,
          completed: false
        })
      })

      event.target['child-item-name'].value = ''

      await this.updateStudyPlan(this.studyPlan)
    },
    async setCategoryCompleted (itemIndex, status) {
      this.studyPlan[itemIndex].completed = status

      for (const child of this.studyPlan[itemIndex].children) {
        child.completed = status
      }

      await this.updateStudyPlan(this.studyPlan)
    },
    async setChildCompleted (itemIndex, childIndex, status) {
      this.studyPlan[itemIndex].children[childIndex].completed = status

      // See if all children of parent are completed
      // eslint-disable-next-line
      this.studyPlan[itemIndex].completed = this.studyPlan[
        itemIndex
      ].children.every(i => i.completed)

      await this.updateStudyPlan(this.studyPlan)
    },
    async deleteCategory (itemIndex) {
      this.studyPlan.splice(itemIndex, 1)

      await this.updateStudyPlan(this.studyPlan)
    },
    async deleteChildItem (itemIndex, childIndex) {
      this.studyPlan[itemIndex].children.splice(childIndex, 1)

      await this.updateStudyPlan(this.studyPlan)
    },
    async updateStudyPlan (studyPlan) {
      this.loading = true

      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessment.assessmentType,
          updates: { studyPlan }
        })
      } catch (e) {
        this.editing = false
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', updatedAssessment)
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.exam-overview-study-plan {
  font-size: 1.3em;

  .notification.is-warning {
    font-size: 0.7em;
    padding: 10px;
  }

  .edit-study-plan {
    margin-right: 10px;
  }

  .new-checkpoint-input {
    font-size: 1em;
  }

  .child-item label,
  .category label {
    cursor: pointer;
  }

  .draggable label {
    cursor: move;
  }

  .delete-item {
    vertical-align: middle;
  }

  ul,
  ol {
    list-style-type: none;
  }

  li > ol {
    padding-left: 20px;
    > li {
      font-size: 0.8em;
    }
  }

  label.category-label {
    font-weight: 500;
  }
}
</style>
