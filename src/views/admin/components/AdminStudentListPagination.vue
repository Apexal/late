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
      :range-before="2"
      :range-after="2"
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
  props: { totalItems: { type: Number, required: true },
    perPage: { type: Number, required: true },
    currentPage: { type: Number, required: true } },
  data () {
    return {
      /* FIXME My understanding is it's bad practice to use props directly as it causes them to mutate, however
          I can't seem to get this component to rerender if I update via $emit/events in parent - Erik
       */
      // perPageLocal: Math.ceil(Math.max(1, this.perPage)),
      // currentPageLocal: Math.ceil(Math.max(1, Math.min(this.totalItems / this.perPage, this.currentPage)))
    }
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
