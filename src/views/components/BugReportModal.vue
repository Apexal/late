<template>
  <b-modal
    class="bug-report-modal"
    style="height: 100%;"
    :active.sync="bugReportModalOpen"
  >
    <form>
      Enter a title for this issue: <br>
      <input
        type="text"
        name="title"
      > <br>
      Describe the issue in as much detail as possible.<br>
      <textarea
        id="description"
        name="description"
      /><br>
      Optional: Enter your RCS ID here so we can contact you for more information about this issue. (We may also give you credit for reporting this issue!)
      <input
        id="rcsid"
        type="text"
      >
      <input
        type="submit"
        value="Submit"
      >
    </form>
  </b-modal>
</template>

<script>
export default {
  name: 'BugReportModal'
}
</script>

<style>

</style>

<!--    -->
