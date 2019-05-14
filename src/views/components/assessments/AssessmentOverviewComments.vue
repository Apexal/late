<template>
  <div class="assessment-comments">
    <div
      v-if="!hasComments"
      class="has-text-grey has-text-centered"
    >
      {{ assessment.passed ? 'No comments were posted for this ' + assessmentType + '.' : 'You have not posted any comments yet.' }}
    </div>

    <article
      v-for="(c, index) in assessment.comments"
      :key="index"
      class="media"
    >
      <div class="media-content">
        <VueMarkdown
          :source="c.body"
          :html="false"
          :emoji="true"
          :anchor-attributes="{target: '_blank'}"
        />
        <nav class="level is-mobile">
          <div class="level-left">
            <small
              class="level-item tooltip is-tooltip-right has-text-grey"
              :data-tooltip="longDateTimeFormat(c.addedAt)"
            >{{ fromNow(c.addedAt) }}</small>
          </div>
        </nav>
      </div>
      <div class="media-right">
        <button
          title="Delete comment."
          class="delete"
          @click="deleteComment(index)"
        />
      </div>
      <hr>
    </article>

    <template>
      <hr>
      <div class="box is-clearfix">
        <form @submit.prevent="addComment">
          <div class="field">
            <div class="control">
              <textarea
                id="new-comment"
                v-model.trim="newComment"
                placeholder="Write your comment here. Markdown is supported!"
                cols="30"
                rows="10"
                class="input"
                required
                @keyup.ctrl.enter="addComment"
              />
            </div>
          </div>
          <b-button
            :loading="loading"
            type="is-success"
            class="is-pulled-right"
            :disabled="newComment.length === 0"
            @click="addComment"
          >
            Add Comment
          </b-button>
        </form>
      </div>
    </template>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown';

export default {
  name: 'AssessmentOverviewComments',
  components: { VueMarkdown },
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      newComment: '',
      loading: false
    };
  },
  computed: {
    hasComments () {
      return this.assessment.comments && this.assessment.comments.length > 0;
    },
    assessmentType () {
      return this.assessment.assessmentType;
    },
    capitalizedAssessmentType () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    }
  },
  methods: {
    async addComment () {
      if (!this.newComment) return;

      this.loading = true;
      let updatedAssessment;
      try {
        updatedAssessment = await this.$store.dispatch('ADD_ASSESSMENT_COMMENT', { assessment: this.assessment, newComment: this.newComment });
      } catch (e) {
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        this.loading = false;
        return;
      }

      this.$emit('updated-assessment', updatedAssessment);

      this.$toast.open({
        message: 'Added comment!',
        type: 'is-success'
      });

      this.newComment = '';
      this.loading = false;
    },
    async deleteComment (commentIndex) {
      this.loading = true;

      let updatedAssessment;
      try {
        updatedAssessment = await this.$store.dispatch('REMOVE_ASSESSMENT_COMMENT', { assessment: this.assessment, commentIndex });
      } catch (e) {
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        this.loading = false;
        return;
      }

      this.$emit('updated-assessment', updatedAssessment);

      this.$toast.open({
        message: 'Removed comment!',
        type: 'is-success'
      });


      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.delete-comment {
  font-size: 13px;
  margin-top: -2px;
  margin-left: 8px;
}

#new-comment {
  max-width: 900px;
  min-height: 100px;
  max-height: 200px;
}
</style>
