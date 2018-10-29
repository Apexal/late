import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Api from './api';

// Bulma CSS
import '../node_modules/bulma/bulma.sass';

Vue.config.productionTip = false;

Vue.prototype.$http = Api;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
