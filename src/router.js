import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'is-active',
  scrollBehavior (to, from, savedPosition) {
    if (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
      return {
        selector: '#content'
      };
    }
  },
  routes: [
    {
      path: '/',
      alias: '/dashboard',
      name: 'home',
      component: () => import('@/views/TheHomePage.vue'),
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: 'About'
      },
      component: () => import('@/views/TheAboutPage.vue')
    },
    {
      path: '/assessments',
      component: () => import('@/views/assessments/Assessments.vue'),
      meta: {
        title: 'Coursework',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          redirect: 'upcoming'
        },
        {
          path: 'calendar',
          name: 'assessments-calendar',
          meta: {
            title: 'Coursework Calendar'
          },
          component: () => import('@/views/assessments/AssessmentsCalendar.vue')
        },
        {
          path: 'upcoming',
          name: 'assessments-upcoming',
          meta: {
            title: 'Upcoming Coursework'
          },
          component: () => import('@/views/assessments/AssessmentsUpcoming.vue')
        },
        {
          path: 'past',
          name: 'past-assessments',
          meta: {
            title: 'Past Coursework'
          },
          component: () => import('@/views/assessments/AssessmentsPastList.vue')
        }
      ]
    },
    {
      path: '/assessments/a/:assignmentID',
      name: 'assignments-overview',
      component: () => import('@/views/assessments/AssessmentsOverview.vue'),
      props: { assessmentType: 'assignment' },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/assessments/e/:examID',
      name: 'exams-overview',
      component: () => import('@/views/assessments/AssessmentsOverview.vue'),
      props: { assessmentType: 'exam' },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      component: () => import('@/views/profile/Profile.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'profile',
          meta: {
            title: 'Your Profile'
          },
          component: () => import('@/views/profile/ProfileHome.vue')
        },
        {
          path: 'personalinfo',
          name: 'setup-personal-info',
          meta: {
            title: 'Personal Info'
          },
          component: () =>
            import('@/views/profile/ProfileSetupPersonalInfo.vue')
        },
        {
          path: 'courseschedule',
          name: 'setup-course-schedule',
          meta: {
            title: 'Course Schedule'
          },
          component: () =>
            import('@/views/profile/ProfileSetupCourseSchedule.vue')
        },
        {
          path: 'unavailability',
          name: 'setup-unavailability',
          meta: {
            title: 'Study/Work Unavailability'
          },
          component: () =>
            import('@/views/profile/ProfileSetupUnavailability.vue')
        },
        {
          path: 'integrations',
          name: 'setup-integrations',
          meta: {
            title: 'Notifications'
          },
          component: () =>
            import('@/views/profile/ProfileSetupIntegrations.vue')
        },
        {
          path: 'googlecalendar',
          name: 'setup-google-calendar',
          meta: {
            title: 'Google Calendar'
          },
          component: () =>
            import('@/views/profile/ProfileSetupGoogleCalendar.vue')
        }
      ]
    },
    {
      path: '/admin',
      name: 'AdminPage',
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      },
      component: () => import('@/views/admin/TheAdminPage'),
      beforeEnter: (to, from, next) => {
        // this route requires admin
        if (!store.state.auth.user.admin) {
          next('/');
          // Vue.$toasted.error('You are not an admin!');
        } else {
          next();
        }
      }
    },
    {
      path: '*',
      name: 'NotFound',
      meta: {
        title: 'Not Found'
      },
      component: () => import('@/views/TheNotFoundPage.vue')
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (store.state.navbarExpanded) store.commit('TOGGLE_NAVBAR');
  if (store.state.courseModal.open) store.commit('CLOSE_COURSE_MODAL');

  if (!store.state.auth.isAuthenticated) await store.dispatch('GET_USER');
  if (to.meta.title) document.title = to.meta.title + ' | LATE';
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.state.auth.isAuthenticated) {
      window.location = '/auth/login?redirectTo' + to.fullPath;
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
