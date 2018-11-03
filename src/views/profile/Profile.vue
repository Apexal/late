<template>
  <div id="profile">
    <section class="section">
      <h1 class="title">Your Profile</h1>
      <keep-alive>
        <component :is="currentForm"/>
      </keep-alive>
    </section>
  </div>
</template>

<script>
import PersonalInfoForm from './PersonalInfoForm';

export default {
  name: 'Profile',
  components: { PersonalInfoForm },
  data () {
    return {
      currentForm: 'PersonalInfoForm'
    };
  }
};
</script>

<style lang='scss' scoped>
</style>
