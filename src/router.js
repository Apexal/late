import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

import { Toast } from 'buefy/dist/components/toast';

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
      path: '/academicutils',
      component: () => import('@/views/academicutils/AcademicUtilsPage.vue'),
      name: 'academic-utils',
      meta: {
        title: 'Academic Utilities'
      },
      children: [
        {
          path: 'gpa-calulator',
          name: 'gpa-calulator',
          component: () => import('@/views/academicutils/GPACalculator.vue')
        },
        {
          path: 'coursegrade',
          name: 'course-grade-estimator',
          component: () => import('@/views/academicutils/CourseGradeEstimator.vue')
        }
      ]
    },
    {
      path: '/studytools',
      component: () => import('@/views/studytools/StudyToolsPage.vue'),
      meta: {
        title: 'Study Tools'
      },
      children: [
        {
          path: '',
          name: 'study-tools'
        }
      ]
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
      path: '/coursework',
      component: () => import('@/views/assessments/AssessmentsPage.vue'),
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
          name: 'coursework-calendar',
          meta: {
            title: 'Coursework Calendar'
          },
          component: () => import('@/views/assessments/AssessmentsCalendar.vue')
        },
        {
          path: 'upcoming',
          name: 'coursework-upcoming',
          meta: {
            title: 'Upcoming Coursework'
          },
          component: () => import('@/views/assessments/AssessmentsUpcoming.vue')
        },
        {
          path: 'past',
          name: 'coursework-past',
          meta: {
            title: 'Past Coursework'
          },
          component: () => import('@/views/assessments/AssessmentsPastList.vue')
        }
      ]
    },
    {
      path: '/coursework/stats',
      name: 'coursework-stats',
      meta: {
        title: 'Coursework Stats',
        requiresAuth: true
      },
      component: () => import('@/views/assessments/AssessmentsStatsPage.vue')
    },
    {
      path: '/coursework/a/:assignmentID',
      name: 'assignment-overview',
      component: () => import('@/views/assessments/AssessmentsOverviewPage.vue'),
      props: { assessmentType: 'assignment' },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/coursework/e/:examID',
      name: 'exam-overview',
      component: () => import('@/views/assessments/AssessmentsOverviewPage.vue'),
      props: { assessmentType: 'exam' },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/account',
      component: () => import('@/views/account/AccountPage.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'account',
          meta: {
            title: 'Your Account'
          },
          component: () => import('@/views/account/AccountHome.vue')
        },
        {
          path: 'personalinfo',
          name: 'setup-personal-info',
          meta: {
            title: 'Account Info'
          },
          component: () =>
            import('@/views/account/AccountSetupPersonalInfo.vue')
        },
        {
          path: 'courseschedule',
          name: 'setup-course-schedule',
          meta: {
            title: 'Course Schedule'
          },
          component: () =>
            import('@/views/account/AccountSetupCourseSchedule.vue')
        },
        {
          path: 'unavailability',
          name: 'setup-unavailability',
          meta: {
            title: 'Study/Work Unavailability'
          },
          component: () =>
            import('@/views/account/AccountSetupUnavailability.vue')
        },
        {
          path: 'integrations',
          name: 'setup-integrations',
          meta: {
            title: 'Notifications'
          },
          component: () =>
            import('@/views/account/AccountSetupIntegrations.vue')
        },
        {
          path: 'googlecalendar',
          name: 'setup-google-calendar',
          meta: {
            title: 'Google Calendar'
          },
          component: () =>
            import('@/views/account/AccountSetupGoogleCalendar.vue')
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
      children: [
        {
          path: 'students',
          name: 'admin-student-list',
          meta: {
            title: 'Students'
          },
          component: () => import('@/views/components/admin/AdminStudentList.vue')
        },
        {
          path: 'log',
          name: 'admin-log',
          meta: {
            title: 'Server Log'
          },
          component: () => import('@/views/components/admin/AdminLog.vue')
        }
      ],
      beforeEnter: (to, from, next) => {
        // this route requires admin
        if (!store.state.auth.user.admin) {
          next('/');
          Toast.open({
            message: 'You are not an admin!',
            type: 'is-warning'
          });
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
