<!--Main container - Goes to dashboard if logged in, promo page if not-->
<template>
  <div class="home">
    <TheDashboard v-if="loggedIn" />
    <ThePromoPage v-else />
  </div>
</template>

<script>
import TheDashboard from '@/views/TheDashboard';
import ThePromoPage from '@/views/ThePromoPage';
import { setTimeout } from 'timers';

export default {
  name: 'TheHomePage',
  components: { TheDashboard, ThePromoPage }
};
</script>

