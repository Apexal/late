<template>
  <section>
    <div class="block">
      <span>Items per page: </span>
      <b-select
        v-model="perPage"
        @input="changeItemCount"
      >
        <option value="10">
          10
        </option>
        <option value="25">
          25
        </option>
        <option value="50">
          50
        </option>
        <option value="200">
          200
        </option>
        <option value="1000">
          1000
        </option>
      </b-select>
    </div>
    <b-pagination
      :total="totalItems"
      :current.sync="currentPage"
      :range-before="1"
      :range-after="1"
      :per-page="perPage"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
      @change="goToPage"
    />
  </section>
</template>

<script>
export default {

  name: 'AdminStudentListPagination',
  props: {
    totalItems: { type: Number, required: true },
    perPage: { type: Number, required: true },
    currentPage: { type: Number, required: true }
  },
  data () {
    return {}
  },
  methods: {
    async goToPage (page) {
      this.$emit('go-to-page', page)
    },
    async changeItemCount (count) {
      this.$emit('change-item-count', count)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
