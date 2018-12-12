<template>
  <div class="assignment-comments">
    <div
      v-if="assignment.comments.length === 0"
      class="has-text-grey has-text-centered"
    >
      {{ assignment.passed ? 'No comments were posted for this assignment.' : 'You have not posted any comments yet.' }}
    </div>
    <div
      v-for="(c, index) in assignment.comments"
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
  name: 'AssignmentOverviewTabsComments',
  components: { VueMarkdown },
  props: {
    assignment: {
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
    shortDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMM Do YYYY [@] h:mma'),
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
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
