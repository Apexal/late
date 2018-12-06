<template>
  <div class="profile-ho">
    <h1 class="is-size-5 integration-note">
      For <b>LATE</b> to function, it must know basic info about yourself, your course schedule, your
      work/study schedule, and (optionally) accounts you want to integrate <b>LATE</b> with.
    </h1>
    <br>
    <router-link
      class="button is-medium is-primary"
      to="/profile/personalinfo"
    >Start Setup</router-link>
  </div>
</template>

<script>
export default {
  name: 'ProfileHome'
};
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
    padding: 1.5em 0 1em 0;
    max-width: 1000px;
    margin: 0 auto;
}

/*Centers and resizes button*/
.button {
    margin: 0 auto;
    display: block;
    max-width: 500px;
    height: 3em;
    line-height: 2em;
}
</style>
