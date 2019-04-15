<template>
  <div class="exam-overview-study-plan">
    <p
      v-if="totalItemCount === 0 && !editing"
      class="has-text-grey has-text-centered"
    >
      You have not made a study plan yet!
    </p>
    <Draggable
      v-model="studyPlan"
      tag="ol"
      class="columns is-multiline"
      group="categories"
      @change="orderChanged"
    >
      <li
        v-for="(item, index) in studyPlan"
        :key="index"
        class="column is-half category"
      >
        <label class="category-label">
          <input
            type="checkbox"
            :checked="item.completed"
            :disabled="loading || editing"
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
            :group="item.text + '-children'"
            @change="orderChanged"
          >
            <li
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
              class="child-item"
            >
              <label>
                <input
                  type="checkbox"
                  :checked="child.completed"
                  :disabled="loading || editing"
                  @change="setChildCompleted(index, childIndex, !child.completed)"
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
                type="text is-full-width"
                class="input"
                name="child-item-name"
                maxlength="200"
                :placeholder="'Add checkpoint to ' + item.text"
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
        type="text is-full-width"
        placeholder="Add new category, e.g 'Chapter 1'"
        maxlength="200"
        required
      >
    </form>
    <hr>
    <span
      class="is-flex"
      :style="{ 'align-items': 'center' }"
    >
      <button
        class="button is-warning edit-study-plan"
        @click="editing = !editing"
      >
        {{ editing ? 'Save Plan' : 'Edit Plan' }}
      </button>
      <progress
        class="progress is-success is-tooltip-bottom"
        :value="completedCount"
        :title="completedPercent + '%'"
        :max="totalItemCount"
      >
        {{ completedPercent }}%
      </progress>
    </span>
  </div>
</template>

<script>
import Draggable from 'vuedraggable';

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
    };
  },
  computed: {
    completedCount () {
      return this.studyPlan.reduce(
        (acc, item) =>
          acc + (item.children.length ? item.children.filter(c => c.completed).length : item.completed),
        0
      );
    },
    totalItemCount () {
      return this.studyPlan.reduce(
        (acc, item) => acc + (item.children.length ? item.children.length : 1), // count header only if no children
        0
      );
    },
    completedPercent () {
      if (this.totalItemCount === 0) return 0;
      return Math.round((this.completedCount / this.totalItemCount) * 100);
    }
  },
  watch: {
    assessment (newAssessemnt) {

    }
  },
  mounted () {
    this.editing = this.totalItemCount === 0;
    this.studyPlan = JSON.parse(JSON.stringify(this.assessment.studyPlan));
  },
  methods: {
    async orderChanged () {
      await this.updateStudyPlan(this.studyPlan);
    },
    async addCategory (event) {
      if (!this.newCategory) return;

      this.studyPlan.push({
        text: this.newCategory,
        children: [],
        completed: false
      });

      this.newCategory = '';

      await this.updateStudyPlan(this.studyPlan);
    },
    async addChildItem (itemIndex, event) {
      const text = event.target['child-item-name'].value.trim();

      this.studyPlan[itemIndex].completed = false;
      this.studyPlan[itemIndex].children.push({
        text,
        completed: false
      });

      event.target['child-item-name'].value = '';

      await this.updateStudyPlan(this.studyPlan);
    },
    async setCategoryCompleted (itemIndex, status) {
      this.studyPlan[itemIndex].completed = status;

      for (const child of this.studyPlan[itemIndex].children) {
        child.completed = status;
      }

      await this.updateStudyPlan(this.studyPlan);
    },
    async setChildCompleted (itemIndex, childIndex, status) {
      this.studyPlan[itemIndex].children[childIndex].completed = status;

      // See if all children of parent are completed
      this.studyPlan[itemIndex].completed = this.studyPlan[itemIndex].children.every(
        i => i.completed
      );

      await this.updateStudyPlan(this.studyPlan);
    },
    async deleteCategory (itemIndex) {
      this.studyPlan.splice(itemIndex, 1);

      await this.updateStudyPlan(this.studyPlan);
    },
    async deleteChildItem (itemIndex, childIndex) {
      this.studyPlan[itemIndex].children.splice(childIndex, 1);

      await this.updateStudyPlan(this.studyPlan);
    },
    async updateStudyPlan (studyPlan) {
      this.loading = true;

      let request;
      try {
        request = await this.$http.patch(`/exams/e/${this.assessment._id}`, {
          studyPlan
        });
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.editing = false;
        return;
      }

      // Calls API and updates state
      if (
        // eslint-disable-next-line
        this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
      ) {
        this.$store.dispatch(
          'UPDATE_UPCOMING_ASSESSMENT',
          request.data.updatedExam
        );
      } else {
        this.$emit('update-assessment', request.data.updatedExam);
      }

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.exam-overview-study-plan {
  font-size: 1.5em;

  .edit-study-plan {
    margin-right: 10px;
  }

  .new-checkpoint-input {
    font-size: 1em;
  }

  .child-item label {
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
