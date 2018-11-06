import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';

import store from '@/store';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/assignments',
    name: 'assignments',
    component: () => import('@/views/assignments/AssignmentList.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (!store.state.auth.user.name)
    await store.dispatch('GET_USER');
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