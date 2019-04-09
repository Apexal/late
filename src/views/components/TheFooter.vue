<template>
  <footer class="footer">
    <h1 class="is-size-5 has-text-centered">
      An
      <router-link
        to="/about"
        title="View project proposal and contributors"
      >
        RCOS project!
      </router-link>
    </h1>
    <div class="content has-text-centered columns">
      <p class="column">
        <span class="icon">
          <img
            src="https://github.com/Apexal/old-ontrac/blob/master/client/public/images/logos/logo128x128.png?raw=true"
            style="max-height: 15px; max-width: 15px;"
          >
        </span>In memory of
        <a
          href="https://github.com/Apexal/old-ontrac/"
          target="_blank"
          title="View the project that inspired LATE"
        >OnTrac.</a>
      </p>
      <p class="column">
        <span class="icon">
          <i class="fab fa-osi" />
        </span>
        Source code licensed
        <a
          href="https://opensource.org/licenses/mit-license.php"
          target="_blank"
          title="View source code license"
        >MIT.</a>
      </p>
      <p class="column">
        <span class="icon">
          <i class="fab fa-github" />
        </span>
        Contribute on
        <a
          href="https://github.com/Apexal/late/"
          target="_blank"
          title="View repository"
        >Github.</a>
      </p>
      <p class="column">
        <span class="icon">
          <i class="far fa-eye" />
        </span>
        View on
        <a
          href="https://rcos.io/projects/apexal/late/profile"
          target="_blank"
          title="View RCOS project listing"
        >Observatory.</a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'TheFooter'
};
</script>

<style lang="scss">
//Adjusts padding for footer to display columns closer together
.footer {
  padding: 2rem 6rem 2rem !important;

  //Centers and clumps footer elements together
  .columns {
    max-width: 1000px;
    margin: 0 auto;
  }

  //Bottom padding to set the h1 ("An RCOS Project!") apart from the columns below
  h1 {
    padding-bottom: 1rem;
  }

  //Mobile styling to bring the footer columns closer together when stacked.
  //I don't believe Bulma provides mediaquery mixins so these are defined using the standard CSS mediaquery format
  .column {
    @media screen and (max-width: 1087px) {
      margin: 10px 0px 0px 0px;
      padding: 0.2em;
    }
  }
}
</style>
