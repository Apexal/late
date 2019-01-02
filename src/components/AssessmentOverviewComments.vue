<template>
  <div class="assessment-comments">
    <div
      v-if="assessment.comments.length === 0"
      class="has-text-grey has-text-centered"
    >
      {{ assessment.passed ? 'No comments were posted for this ' + assessmentType + '.' : 'You have not posted any comments yet.' }}
    </div>
    <div
      v-for="(c, index) in assessment.comments"
      :key="index"
      class="box"
    >
      <small
        class="has-text-grey is-pulled-right added-at tooltip is-tooltip-left"
        :data-tooltip="toFullDateTimeString(c.addedAt)"
      >
        {{ fromNow(c.addedAt) }}
      </small>
      <VueMarkdown
        :source="c.body"
        :html="false"
        :emoji="true"
        :anchor-attributes="{target: '_blank'}"
      />
    </div>
    <template>
      <hr>
      <div class="box is-clearfix">
        <form @submit.prevent="$emit('add-comment', newComment); newComment = '';">
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
              />
            </div>
          </div>
          <button
            :class="{ 'is-loading': loading }"
            class="button is-success is-pulled-right"
            :disabled="newComment.length === 0"
          >
            Add Comment
          </button>
        </form>
      </div>
    </template>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';

export default {
  name: 'AssessmentOverviewComments',
  components: { VueMarkdown },
  props: {
    assessmentType: {
      type: String,
      required: true
    },
    assessment: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      newComment: ''
    };
  },
  methods: {
    shortDateTimeString: date =>
      moment(date).format('dddd, MMM Do YYYY [@] h:mma'),
    toFullDateTimeString: date =>
      moment(date).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
    }
  }
};
</script>

<style lang="scss" scoped>
#new-comment {
  max-width: 900px;
  min-height: 100px;
  max-height: 200px;
}
</style>
