<template>
  <div id="profile">
    <section class="section">
      <h1 class="title">Your Profile</h1>
      <nav
        class="breadcrumb"
        aria-label="breadcrumbs">
        <ul>
          <li
            v-for="(componentName, name) in setups"
            :key="name"
            :class="{ &quot;is-active&quot;: currentForm==componentName}">
            <a
              href="#"
              @click="currentForm=componentName">{{ name }}</a>
          </li>
        </ul>
      </nav>
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
  data() {
    return {
      currentForm: '',
      setups: {
        'Personal Info': 'PersonalInfoForm'
      }
    };
  }
};
</script>

<style lang='scss' scoped>
</style>
