<template>
  <div id="profile">
    <section class="section">
      <h1 class="title">Your Profile</h1>
      <nav
        class="breadcrumb"
        aria-label="breadcrumbs">
        <ul>
          <li
            v-for="s in setups"
            :key="s.component"
            :class="{ 'is-active' : currentForm==s.component}">
            <a
              href="#"
              @click="currentForm=s.component">{{ s.label }}</a>
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
import CourseScheduleForm from './CourseScheduleForm';

export default {
  name: 'Profile',
  components: { PersonalInfoForm, CourseScheduleForm },
  data() {
    return {
      currentForm: '',
      setups: [
        { label: 'Personal Info', component: 'PersonalInfoForm', setup_check: 'personal_info' },
        { label: 'Course Schedule', component: 'CourseScheduleForm', setup_check: 'course_schedule' }
      ]
    };
  }
};
</script>

<style lang='scss' scoped>
</style>
