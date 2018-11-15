<template>
  <footer class="footer">
    <h1 class="is-size-5 has-text-centered">An RCOS project!</h1>
    <div class="content has-text-centered columns">
      <p class="column">Learn more <router-link
        to="/about"
      >about us</router-link>.</p>
      <p class="column">Source code licensed <a
        href="https://opensource.org/licenses/mit-license.php"
        target="_blank"
      >MIT</a>.</p>
      <p class="column">
        <span
          data-v-61dd7a3d=""
          class="icon"
        ><i
          data-v-61dd7a3d=""
          class="fab fa-github"
        /></span>
        Contribute on <a
          href="https://github.com/Apexal/late/"
          target="_blank"
        >Github</a>.
      </p>
      <p class="column">View on <a
        href="https://rcos.io/projects/apexal/late/profile"
        target="_blank"
      >Observatory</a>.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
};
</script>

<style lang="scss">
  .footer {
    padding: 2rem 6rem 2rem!important;
    h1 {
      padding-bottom: 1rem;
    }
  }
</style>
