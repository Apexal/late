<template>
  <footer class="footer">
    <h1 class="is-size-5 has-text-centered">
      An RCOS project!
    </h1>
    <div class="content has-text-centered columns">
      <p class="column">
        Learn more
        <router-link to="/about">
          about us.
        </router-link>
      </p>
      <p class="column">
        Source code licensed
        <a
          href="https://opensource.org/licenses/mit-license.php"
          target="_blank"
        >
          MIT.
        </a>
      </p>
      <p class="column">
        <span
          data-v-61dd7a3d
          class="icon"
        >
          <i
            data-v-61dd7a3d
            class="fab fa-github"
          />
        </span>
        Contribute on
        <a
          href="https://github.com/Apexal/late/"
          target="_blank"
        >
          Github.
        </a>
      </p>
      <p class="column">
        View on
        <a
          href="https://rcos.io/projects/apexal/late/profile"
          target="_blank"
        >
          Observatory.
        </a>
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

  /*
    //Desktop - Sticks footer to bottom of page.
    //Note: This will break when we enter the mobile view at 768px, but oddly mediaqueries seem to be ineffective. I'll try some other things later but for now this only works on desktop..
      //Sticks footer on the bottom of the page, even if the page's height < viewport height
      position: absolute;
      width: 100%;
      bottom: 0px;
      left: 0px;
      right: 0px;

      body {
        position: relative!important; //This allows the footer to be "stuck" to the bottom
        padding-bottom: 10rem; //10rem is an estimate of the footer's height.
      }*/
}
</style>
