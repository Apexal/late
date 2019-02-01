<template>
  <div class="user-overview box">
    <h2 class="subtitle">
      <span
        v-if="student.accountLocked"
        class="icon"
        title="This student's account is locked."
      >
        <i class="fa fa-lock" />
      </span>
      <span class="has-text-grey">
        {{ student.grade_name }}
      </span>
      {{ student.display_name }}
    </h2>
  </div>
</template>

<script>
export default {
  name: 'AdminStudentListOverview',
  props: ['student']
};
</script>

<style>

</style>
