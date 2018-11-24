import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';

import store from '@/store';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      alias: '/dashboard',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: 'About'
      },
      component: () => import('@/views/About.vue')
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
          name: 'assignment-calendar',
          meta: {
            title: 'Assignment Calendar'
          },
          component: () => import('@/views/assignments/AssignmentCalendar.vue')
        },
        {
          path: 'upcoming',
          name: 'upcoming-assignments',
          meta: {
            title: 'Upcoming Assignments'
          },
          component: () => import('@/views/assignments/UpcomingAssignments.vue')
        },
        {
          path: 'past',
          name: 'past-assignments',
          meta: {
            title: 'Past Assignments'
          },
          component: () => import('@/views/assignments/PastAssignments.vue')
        }
      ]
    },
    {
      path: '/assignments/:assignmentID',
      name: 'assignment-overview',
      component: () => import('@/views/assignments/AssignmentOverview.vue'),
      meta: {
        title: 'View Assignment',
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
          meta: {
            title: 'Personal Info'
          },
          component: () => import('@/views/profile/PersonalInfoForm.vue')
        },
        {
          path: 'courseschedule',
          meta: {
            title: 'Course Schedule'
          },
          component: () => import('@/views/profile/CourseScheduleForm.vue')
        },
        {
          path: 'unavailability',
          meta: {
            title: 'Study/Work Unavailability'
          },
          component: () => import('@/views/profile/UnavailabilitySetup.vue')
        }
      ]
    },
    {
      path: '*',
      name: 'NotFound',
      meta: {
        title: 'Not Found'
      },
      component: () => import('@/views/NotFound.vue')
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (store.state.navbarExpanded) store.commit('TOGGLE_NAVBAR');

  if (!store.state.auth.user.name) await store.dispatch('GET_USER');
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
