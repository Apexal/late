<!--Assessments: assessment overview comments module-->
<template>
  <div class="assessment-comments">
    <div
      v-if="!hasComments"
      class="has-text-grey has-text-centered"
    >
      {{
        assessment.passed
          ? "No comments were posted for this " + assessmentType + "."
          : "You have not posted any comments yet."
      }}
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
            <small class="level-item has-text-grey">
              <b
                class="tooltip has-tooltip-bottom"
                :data-tooltip="c._student ? c._student.rcs_id : 'anonymous'"
              >{{ c._student ? c._student.displayName : "Anonymous" }}</b>
              &nbsp;|&nbsp;
              <span
                class="tooltip has-tooltip-right"
                :data-tooltip="longDateTimeFormat(c.addedAt)"
              >{{ fromNow(c.addedAt) }}</span>
            </small>
          </div>
        </nav>
      </div>
      <div
        v-if="c._student._id === user._id"
        class="media-right"
      >
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
      <div class="is-clearfix">
        <form @submit.prevent="addComment">
          <div class="field">
            <div class="control">
              <textarea
                id="new-comment"
                v-model.trim="newComment"
                placeholder="Write your comment here. Markdown is supported!"

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
import VueMarkdown from 'vue-markdown'
import assessmentsMixin from '@/mixins/assessments'

export default {
  name: 'AssessmentOverviewComments',
  components: { VueMarkdown },
  mixins: [assessmentsMixin],
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
    }
  },
  computed: {
    hasComments () {
      return this.assessment.comments && this.assessment.comments.length > 0
    }
  },
  watch: {
    assessment () {
      this.newComment = ''
    }
  },
  methods: {
    async addComment () {
      if (!this.newComment) return

      this.loading = true
      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch(
          'ADD_ASSESSMENT_COMMENT',
          { assessment: this.assessment, newComment: this.newComment }
        )
      } catch (e) {
        this.showError(e.response.data.message)
        this.loading = false
        return
      }

      this.$emit('updated-assessment', updatedAssessment)

      this.$buefy.toast.open({
        message: 'Added comment!',
        type: 'is-success'
      })

      this.newComment = ''
      this.loading = false
    },
    async deleteComment (commentIndex) {
      this.loading = true

      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch(
          'REMOVE_ASSESSMENT_COMMENT',
          { assessment: this.assessment, commentIndex }
        )
      } catch (e) {
        this.showError(e.response.data.message)
        this.loading = false
        return
      }

      this.$emit('updated-assessment', updatedAssessment)

      this.$buefy.toast.open({
        message: 'Removed comment!',
        type: 'is-success'
      })

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.delete-comment {
  font-size: 13px;
  margin-top: -2px;
  margin-left: 8px;
}

#new-comment {
  min-width: 100%;
  max-width: 100px;
  width: 100%;
  min-height: 50px;
  max-height: 150px;
}
</style>
