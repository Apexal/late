<!--Assessments: assessment overview description module-->
<template>
  <div class="content assessment-description">
    <blockquote>
      <textarea
        v-if="editing"
        ref="textarea"
        v-model.trim="edited"
        class="edited-description"
        autofocus
        @blur="toggleEditing"
      />
      <template v-else>
        <VueMarkdown
          v-if="assessment.description && assessment.description.length > 0"
          :source="assessment.description"
          :html="false"
          :emoji="true"
          :anchor-attributes="{target: '_blank'}"
        />
        <i v-else>No description given.</i>
      </template>
      <span
        v-if="assessmentType === 'exam' || isOwner"
        class="edit-description tooltip has-tooltip-left"
        :data-tooltip="
          editing ? 'Click to save description.' : 'Click to edit description.'
        "
        @click="toggleEditing"
      >
        <i class="fas fa-pencil-alt" />
      </span>
    </blockquote>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'

import assessmentsMixin from '@/mixins/assessments'

export default {
  name: 'AssessmentOverviewDescription',
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
      editing: false,
      edited: this.assessment.description
    }
  },
  computed: {

  },
  watch: {
    assessment () {
      this.editing = false
      // this.edited causes it to remain in editing
    }
  },
  methods: {
    async toggleEditing () {
      if (!this.isOwner) {
        this.editing = false
        return
      }

      if (this.editing) {
        if (this.edited === this.assessment.description) {
          this.editing = false
          return
        }

        let updatedAssessment
        try {
          updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
            assessmentID: this.assessment._id,
            assessmentType: this.assessment.assessmentType,
            updates: { description: this.edited }
          })
        } catch (e) {
          this.showError(e.response.data.message)
          this.editing = false
          return
        }

        this.$emit('updated-assessment', updatedAssessment)

        this.$buefy.toast.open({
          message: 'Updated the description!',
          type: 'is-success'
        })

        this.editing = false
      } else {
        this.edited = this.assessment.description
        this.editing = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.assessment-description blockquote {
  word-break: break-word;
  position: relative;

  .edited-description {
    font-size: 1em;
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
