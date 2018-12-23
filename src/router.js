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
      path: '/assignments',
      component: () => import('@/views/assignments/Assignments.vue'),
      meta: {
        title: 'Assignments',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          redirect: 'upcoming'
        },
        {
          path: 'calendar',
          name: 'assignments-calendar',
          meta: {
            title: 'Assignment Calendar'
          },
          component: () => import('@/views/assignments/AssignmentsCalendar.vue')
        },
        {
          path: 'upcoming',
          name: 'assignments-upcoming',
          meta: {
            title: 'Upcoming Assignments'
          },
          component: () => import('@/views/assignments/AssignmentsUpcoming.vue')
        },
        {
          path: 'past',
          name: 'past-assignments',
          meta: {
            title: 'Past Assignments'
          },
          component: () => import('@/views/assignments/AssignmentsPastList.vue')
        }
      ]
    },
    {
      path: '/assignments/:assignmentID',
      name: 'assignments-overview',
      component: () => import('@/views/assignments/AssignmentsOverview.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/exams/:examID',
      name: 'exams-overview',
      component: () => import('@/views/exams/ExamsOverview.vue'),
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
            title: 'Integrations'
          },
          component: () =>
            import('@/views/profile/ProfileSetupIntegrations.vue')
        }
      ]
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

  // if (!store.state.auth.user.name) await store.dispatch('GET_USER');

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
