import Vue from 'vue'
import Router from 'vue-router'

import api from './api'

import store from '@/store'

import { ToastProgrammatic as Toast, SnackbarProgrammatic as Snackbar } from 'buefy'

Vue.use(Router)

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
      }
    }
  },
  routes: [
    {
      path: '/',
      alias: ['/dashboard', '/frontpage'],
      component: () => import('@/views/TheHomePage.vue'),
      children: [
        {
          path: 'overview',
          alias: [''],
          name: 'dashboard-overview',
          meta: {
            title: 'Home',
            isHome: true
          },
          component: () => import('@/views/dashboard/DashboardOverview')
        },
        {
          path: 'calendar',
          name: 'dashboard-calendar',
          meta: {
            title: 'Calendar',
            isHome: true
          },
          component: () => import('@/views/dashboard/DashboardCalendar')
        }
      ]
    },
    {
      path: '/tools',
      component: () => import('@/views/tools/ToolsIndexPage.vue'),
      name: 'tools',
      meta: {
        title: 'Tools'
      }
    },
    {
      path: '/quicklinks',
      component: () => import('@/views/quicklinks/QuickLinks.vue'),
      name: 'quick-links',
      meta: {
        title: 'Quick Links'
      }
    },
    {
      path: '/academicutils',
      component: () => import('@/views/academicutils/AcademicUtilsPage.vue'),
      children: [
        {
          path: '',
          redirect: 'gpa-calculator'
        },
        {
          path: 'gpa-calculator',
          name: 'gpa-calculator',
          meta: {
            title: 'GPA Calculator'
          },
          component: () => import('@/views/academicutils/GPACalculator.vue')
        },
        {
          path: 'coursegrade',
          name: 'course-grade-estimator',
          meta: {
            title: 'Course Grade Calculator'
          },
          component: () =>
            import('@/views/academicutils/CourseGradeEstimator.vue')
        }
      ]
    },
    {
      path: '/studytools',
      name: 'study-tools',
      component: () => import('@/views/studytools/StudyToolsPage.vue'),
      meta: {
        title: 'Study Tools'
      }
    },
    {
      path: '/rpi-dorm-photos',
      component: () => import('@/views/dormphotos/DormPhotos'),
      children: [
        {
          path: '',
          name: 'dorm-photos',
          component: () => import('@/views/dormphotos/DormPhotosHome'),
          meta: {
            title: 'RPI Dorm Photos'
          }
        },
        {
          path: 'confirm',
          name: 'dorm-photos-confirm',
          component: () => import('@/views/dormphotos/DormPhotosConfirm'),
          meta: {
            title: 'Confirm Dorm Photos',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: ':dormKey',
          name: 'dorm-photos-view',
          component: () => import('@/views/dormphotos/DormPhotosView')
        }
      ]
    },
    {
      path: '/study-groups',
      component: () => import('@/views/studygroups/StudyGroups'),
      children: [
        {
          path: '',
          redirect: 'home'
        },
        {
          path: 'home',
          name: 'study-groups-home',
          component: () => import('@/views/studygroups/StudyGroupsHome'),
          meta: {
            title: 'Study Groups'
          }
        },
        {
          path: 'create',
          name: 'study-groups-create',
          component: () => import('@/views/studygroups/StudyGroupsCreate')
        },
        {
          path: 'join',
          name: 'study-groups-join',
          component: () => import('@/views/studygroups/StudyGroupsJoin')
        }
      ]
    },
    {
      path: ':groupID',
      name: 'study-groups-overview',
      component: () =>
        import('@/views/studygroups/StudyGroupsOverview')
    },
    {
      path: '/checklist',
      name: 'checklist',
      component: () => import('@/views/checklists/MoveInChecklist.vue'),
      meta: {
        title: 'Move In Checklist'
      }
    },
    {
      path: '/checklist/:checklistID',
      name: 'view-checklist',
      component: () => import('@/views/checklists/ViewChecklist.vue'),
      meta: {
        title: 'View Checklist'
      }
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: 'About',
        requiresAuth: false
      },
      component: () => import('@/views/TheAboutPage.vue')
    },
    {
      path: '/changelog',
      name: 'changelog',
      meta: {
        title: 'Changelog',
        requiresAuth: false
      },
      component: () => import('@/views/changelog/TheChangelogPage.vue')
    },
    {
      path: '/coursework',
      component: () => import('@/views/assessments/AssessmentsPage.vue'),
      meta: {
        title: 'Coursework',
        cantViewOnBreak: true,
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
      redirect: 'coursework/stats/stats-pie',
      meta: {
        title: 'Coursework Stats',
        cantViewOnBreak: true,
        requiresAuth: true
      },
      children: [
        {
          path: 'stats-pie',
          name: 'stats-pie',
          component: () => import('@/views/assessments/charts/statsPie.vue')
        },
        {
          path: 'stats-bar',
          name: 'stats-bar',
          component: () => import('@/views/assessments/charts/statsBar.vue')
        },
        {
          path: 'stats-line',
          name: 'stats-line',
          component: () => import('@/views/assessments/charts/statsLine.vue')
        }
      ],
      component: () => import('@/views/assessments/AssessmentsStatsPage.vue')
    },
    {
      path: '/coursework/a/latest',
      beforeEnter: (to, from, next) => {
        // Find latest upcoming assignment
        const latestAssignment = store.state.assessments.upcomingAssessments.find(
          assessment => assessment.assessmentType === 'assignment'
        )
        if (latestAssignment) {
          next({
            name: 'assignment-overview',
            params: { assignmentID: latestAssignment._id }
          })
        } else next('/coursework')
      }
    },
    {
      path: '/coursework/a/:assignmentID',
      name: 'assignment-overview',
      component: () =>
        import('@/views/assessments/AssessmentsOverviewPage.vue'),
      props: { assessmentType: 'assignment' },
      meta: {
        cantViewOnBreak: true,
        requiresAuth: true
      }
    },
    {
      path: '/coursework/e/:examID',
      name: 'exam-overview',
      component: () =>
        import('@/views/assessments/AssessmentsOverviewPage.vue'),
      props: { assessmentType: 'exam' },
      meta: {
        cantViewOnBreak: true,
        requiresAuth: true
      }
    },
    {
      path: '/scheduling/plan',
      name: 'schedule-planner',
      component: () => import('@/views/scheduling/SchedulePlannerPage.vue'),
      meta: {
        title: 'Schedule Planner'
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
          path: 'profile',
          name: 'setup-profile',
          meta: {
            title: 'Profile'
          },
          component: () => import('@/views/account/AccountSetupProfile.vue')
        },
        {
          path: 'terms',
          name: 'setup-terms',
          meta: {
            title: 'Terms'
          },
          component: () => import('@/views/account/AccountSetupTerms.vue')
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
          path: 'setupcomplete',
          name: 'setup-complete',
          meta: {
            title: 'Setup Complete'
          },
          component: () =>
            import('@/views/account/accountComplete.vue')
        }
      ]
    },
    {
      path: '/archive',
      meta: {
        title: 'Archive',
        requiresAuth: true
      },
      component: () => import('@/views/archive/TheArchivePage'),
      children: [
        {
          path: '',
          name: 'archive-home',
          component: () => import('@/views/archive/components/ArchiveHome')
        },
        {
          path: ':termCode',
          name: 'archive-term',
          component: () => import('@/views/archive/components/ArchiveTerm')
        }
      ]
    },
    {
      path: '/admin',
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      },
      component: () => import('@/views/admin/TheAdminPage'),
      children: [
        {
          path: '',
          redirect: 'students/1'
        },
        {
          path: 'students',
          redirect: 'students/1'
        },
        {
          path: 'students/:page',
          name: 'admin-student-list',
          meta: {
            title: 'Students'
          },
          component: () =>
            import('@/views/admin/components/AdminStudentList.vue')
        },
        {
          path: 'log',
          name: 'admin-log',
          meta: {
            title: 'Server Log'
          },
          component: () => import('@/views/admin/components/AdminLog.vue')
        },
        {
          path: 'terms',
          name: 'admin-terms',
          meta: {
            title: 'School Terms'
          },
          component: () => import('@/views/admin/components/AdminTermsList.vue')
        },
        {
          path: 'fun',
          name: 'admin-fun',
          meta: {
            title: 'Admin Fun'
          },
          component: () => import('@/views/admin/components/AdminFun.vue')
        },
        {
          path: 'poll',
          name: 'admin-poll',
          meta: {
            title: 'Admin Poll'
          },
          component: () => import('@/views/admin/components/AdminPoll.vue')
        },
        {
          path: 'development',
          name: 'admin-development',
          meta: {
            title: 'Admin Dev Mode'
          },
          component: () => import('@/views/admin/components/AdminDevelopment.vue')
        }
      ]
    },
    {
      path: '/privacypolicy',
      name: 'privacy-policy',
      meta: {
        title: 'LATE Privacy Policy',
        requiresAuth: false
      },
      component: () => import('@/views/ThePrivacyPolicyPage.vue')
    },
    {
      path: '/tos',
      name: 'terms-of-service',
      meta: {
        title: 'LATE Terms of Service',
        requiresAuth: false
      },
      component: () => import('@/views/TheTermsOfServicePage.vue')
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
})

router.beforeEach(async (to, from, next) => {
  if (store.state.courseModal.open) store.commit('CLOSE_COURSE_MODAL')
  if (store.state.navbarExpanded) store.commit('TOGGLE_NAVBAR') // Close the navbar if clicked on

  if (
    process.env.NODE_ENV === 'development' &&
    store.state.auth.isAuthenticated === null
  ) {
    let rcsID = localStorage.getItem('devUserRcsId')
    if (rcsID === null) {
      rcsID = prompt('Log in as what user? (rcs_id) Leave blank to not login.')
      if (rcsID) {
        localStorage.setItem('devUserRcsId', rcsID)
      } else {
        localStorage.removeItem('devUserRcsId')
      }
    }

    if (rcsID) {
      const response = await api.get('/students/loginas?rcs_id=' + rcsID)
      await store.dispatch('SET_USER', response.data.user)
    } else {
      store.commit('UNSET_USER')
      store.commit('SET_LOADED', true)
    }
  } else if (store.state.auth.isAuthenticated === null) {
    await store.dispatch('GET_USER')
  }

  if (store.state.auth.isAuthenticated && !store.state.loaded) {
    await store.dispatch('GET_TERMS')
    const calls = []
    if (!store.getters.onBreak) {
      await store.dispatch('GET_COURSES')
      calls.concat([
        store.dispatch('GET_UNAVAILABILITIES'),
        store.dispatch('AUTO_GET_UPCOMING_WORK')
      ])
    }
    calls.concat([
      store.dispatch('GET_TODOS'),
      store.dispatch('GET_POLLS', 'false'),
      store.dispatch('GET_ANNOUNCEMENTS'),
      store.dispatch('AUTO_UPDATE_NOW')
    ])
    await Promise.all(calls)
    store.commit('SET_LOADED', true)
  }

  if (to.meta.title) document.title = to.meta.title + ' | LATE'
  if (
    to.matched.some(record => record.meta.requiresAuth) &&
    !store.state.auth.isAuthenticated
  ) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    window.location = '/auth/login' + (to.fullPath ? '?redirectTo=' + to.fullPath : '')
    return
  }

  if (
    to.matched.some(record => record.meta.requiresAdmin) &&
    !store.state.auth.user.admin
  ) {
    Toast.open({
      message: 'Only admins can view this page!',
      type: 'is-warning',
      duration: 3000
    })
    return next('/')
  }

  if (
    to.matched.some(record => record.meta.cantViewOnBreak) &&
    store.getters.onBreak &&
    store.state.schedule.terms.length > 0
  ) {
    Snackbar.open({
      message: 'You cannot view this page while on break!',
      type: 'is-warning',
      duration: 8000,
      position: 'is-bottom',
      actionText: 'Not on Break?',
      onAction: () => {
        router.push({ name: 'setup-terms' })
      }
    })
    return next('/')
  }

  next()
})

export default router
