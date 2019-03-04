<template>
  <div class="content assessment-description">
    <blockquote>
      <textarea
        v-if="editing"
        v-model.trim="edited"
        class="edited-description"
      />
      <template v-else>
        <VueMarkdown
          v-if="assessment.description.length > 0"
          :source="assessment.description"
          :html="false"
          :emoji="true"
          :anchor-attributes="{target: '_blank'}"
        />
        <i v-else>No description given.</i>
      </template>
      <span
        class="edit-description tooltip is-tooltip-left"
        :data-tooltip="editing ? 'Click to save description.' : 'Click to edit description.'"
        @click="toggleEditing"
      >
        <i class="fas fa-pencil-alt" />
      </span>
    </blockquote>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown';

export default {
  name: 'AssessmentOverviewDescription',
  components: { VueMarkdown },
  props: {
    assessmentType: {
      type: String,
      required: true
    },
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editing: false,
      edited: this.assessment.description
    };
  },
  computed: {
    capitalizedAssessmentType () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    }
  },
  methods: {
    async toggleEditing () {
      if (this.editing) {
        if (this.edited === this.assessment.description) {
          this.editing = false;
          return;
        }

        let request;
        try {
          request = await this.$http.patch(
            `/${this.assessmentType}s/${this.assessmentType.charAt(0)}/${
              this.assessment._id
            }`,
            { description: this.edited }
          );
        } catch (e) {
          this.$toasted.error(e.response.data.message);
          this.editing = false;
          return;
        }

        // Calls API and updates state
        if (
          // eslint-disable-next-line
          this.$store.getters[
            `getUpcoming${this.capitalizedAssessmentType}ById`
          ](this.assessment._id)
        ) {
          this.$store.dispatch(
            `UPDATE_UPCOMING_${this.assessmentType.toUpperCase()}`,
            request.data[`updated${this.capitalizedAssessmentType}`]
          );
        } else {
          this.$emit(
            'update-assessment',
            request.data[`updated${this.capitalizedAssessmentType}`]
          );
        }

        this.editing = false;
      } else {
        this.edited = this.assessment.description;
        this.editing = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment-description blockquote {
  word-break: break-word;
  position: relative;

  .edited-description {
    max-width: 600px;
    min-width: 100%;

    min-height: 100px;
    max-height: 400px;
  }

  .edit-description {
    cursor: pointer;
    z-index: 2;
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
