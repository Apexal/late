<!--Footer module-->
<template>
  <footer class="footer">
    <h1 class="is-size-5 has-text-centered">
      <span
        class="has-text-grey"
        @mouseover="changeAdjective"
      >{{ randomAdjective }}</span>
      <router-link
        :to="{name: 'about'}"
        title="Check out the goal of LATE and its team of developers!"
      >
        RCOS project!
      </router-link>
    </h1>
    <h2 class="has-text-grey has-text-centered">
      v1.0.0 - The Honorable
    </h2>
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
          <i class="fas fa-shield-alt" />
        </span>
        Read
        <router-link
          :to="{name: 'privacy-policy'}"
          title="View source code license"
        >
          Privacy Policy.
        </router-link>
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
        >GitHub.</a>
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
import adjectives from '@/modules/adjectives'

export default {
  name: 'TheFooter',
  data () {
    return {
      randomAdjective: ''
    }
  },
  mounted () {
    this.changeAdjective()
  },
  methods: {
    changeAdjective () {
      this.randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
      let vowels = ['a', 'e', 'i', 'o', 'u', 'h']
      let startsWithVowel = vowels.some(vowel => this.randomAdjective[0] === vowel)

      if (startsWithVowel) {
        this.randomAdjective = 'An ' + this.randomAdjective
      } else {
        this.randomAdjective = 'A ' + this.randomAdjective
      }
    }
  }
}
</script>

<style lang="scss">
.footer {
  //Adjusts padding for footer to display columns closer together
  //Desktop styles
  @media screen and (min-width: 769px) {
    padding: 2rem 6rem 2rem !important;
    //Bottom padding to set the h1 ("An RCOS Project!") apart from the columns below
    h2 {
      padding-bottom: 1rem;
    }
  }

  //Mobile styles
  @media screen and (max-width: 768px) {
    padding: 1rem 0rem 1rem !important;
  }

  //Centers and clumps footer elements together
  .columns {
    max-width: 1000px;
    margin: 0 auto;
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
