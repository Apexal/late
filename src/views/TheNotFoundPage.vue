<!--Not found page-->
<template>
  <div class="not-found">
    <section class="section">
      <h1 class="title has-text-centered">
        Page Not Found (404)
      </h1>
      <div class="study-girl">
        <video
          autoplay
          loop
        >
          <source
            src="https://giant.gfycat.com/AgedMiniatureBoto.webm"
            type="video/webm"
          >
          <source
            src="https://thumbs.gfycat.com/AgedMiniatureBoto-mobile.mp4"
            type="video/mp4"
          >
        </video>
      </div>
      <div class="subtitle has-text-centered">
        <p>
          The page you are looking for does not exist! Try checking the URL for
          typos.
        </p>
      </div>

      <div class="columns is-centered">
        <div class="column is-one-third is-full-touch">
          <pre
            class="has-text-centered"
          ><b>Here's a haiku for your trouble</b><br>{{ randomHaiku }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import haikus from '@/modules/haikus';

export default {
  name: 'TheNotFoundPage',
  computed: {
    randomHaiku () {
      return haikus[Math.floor(Math.random() * haikus.length)].join('\n');
    }
  }
};
</script>

<style lang="scss" scoped>
.study-girl {
  margin-right: -70px;
}
video {
  display: block;
  clip-path: circle(110px at 170px 110px);
  margin: 0 auto;
  width: 400px;
  overflow: hidden;
}

.subtitle {
  margin-top: 20px;
}
</style>
