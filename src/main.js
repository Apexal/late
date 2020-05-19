import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Api from './api'

import Buefy from 'buefy'

import 'bulma-tooltip'

import VueProgressBar from 'vue-progressbar'
import VueTour from 'vue-tour'

import CourseAssessmentDot from '@/views/courses/components/CourseAssessmentDot'

import datemethods from './mixins/datemethods'
import sharedproperties from './mixins/sharedproperties'
import utils from './mixins/utils'

import * as VueGoogleMaps from 'vue2-google-maps'

import VueSocketio from 'vue-socket.io-extended'
import io from 'socket.io-client'

import 'vue-tour/dist/vue-tour.css'
import './sw/registerServiceWorker'
import VueAnalytics from 'vue-analytics'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

Vue.use(VueAnalytics, {
  id: 'UA-147908456-1',
  router,
  debug: {
    sendHitTask: process.env.NODE_ENV === 'production'
  }
})

const ignoreErrors = [
  'x_magnitude',
  'request is not allowed by the user agent',
  'play() failed',
  'read property'
]

Sentry.init({
  dsn: 'https://8dc02c8aff11495696641a303123f176@o296943.ingest.sentry.io/1548286',
  debug: process.env.NODE_ENV !== 'production',
  environment: process.env.NODE_ENV,
  integrations: [new Integrations.Vue({ Vue, attachProps: true, logErrors: process.env.NODE_ENV !== 'production' })],
  beforeSend (event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({
        eventId: event.event_id,
        title: 'Something went wrong!',
        subtitle: 'The LATE team has been notified.',
        user: {
          email: store.state.auth.user ? (store.state.auth.user.rcs_id + '@rpi.edu') : '',
          name: store.state.auth.user ? store.state.auth.user.displayName : ''
        }
      })
    }
    return event
  }
})

Vue.use(VueSocketio, io(process.env.BASE_URL), { store })

Vue.use(VueTour)

Vue.component('CourseAssessmentDot', CourseAssessmentDot)

Vue.use(Buefy, {
  defaultIconPack: 'fas'
})

const options = {
  color: '#70cad1',
  failedColor: '#874b4b',
  thickness: '2px',
  transition: {
    speed: '0.2s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  location: 'top',
  inverse: false
}
Vue.use(VueProgressBar, options)

Vue.config.productionTip = false

Vue.prototype.$http = Api
Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_API_KEY
  }

  /// / If you intend to programmatically custom event listener code
  /// / (e.g. `this.$refs.gmap.$on('zoom_changed', someFunc)`)
  /// / instead of going through Vue templates (e.g. `<GmapMap @zoom_changed="someFunc">`)
  /// / you might need to turn this on.
  // autobindAllEvents: false,

  /// / If you want to manually install components, e.g.
  /// / import {GmapMarker} from 'vue2-google-maps/src/components/marker'
  /// / Vue.component('GmapMarker', GmapMarker)
  /// / then disable the following:
  // installComponents: true,
})

Vue.mixin(datemethods)
Vue.mixin(sharedproperties)
Vue.mixin(utils)

const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

export default app
