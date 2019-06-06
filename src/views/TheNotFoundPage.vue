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
        </video>
      </div>
      <div class="subtitle has-text-centered">
        <p>The page you are looking for does not exist! Trying checking the URL for typos.</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'TheNotFoundPage'
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
