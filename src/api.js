/**
 * LATE uses the Axios library to easily make HTTP requests to the server
 * or to any url. It is available to all components as 'this.$http'
 *
 * Making requests is extremely easy. You can make GET, POST, PUSH, DELETE, etc.
 * requests simply by calling the appropriate function this.$http.<HTTP VERB>, e.g.
 * this.$http.get(), this.$http.post()
 *
 * They should be made in asynchronous functions
 * since the requests are asynchronous. For example:
 *
 * async function getAssignments() {
 *   const request = await this.$http.get('/assignments')
 *   const assignments = request.data.assignments
 * }
 *
 * It is common to wrap an API call in a try-catch block to handle an error:
 *
 * async function addAssignment() {
 *   const data = { ... }
 *   let request
 *   try {
 *     request = await this.$http.post('/assignments', data)
 *   } catch (e) {
 *     this.showError('Failed to add assignment: ' + e)
 *   }
 * }
 *
 * Documentation can be found at https://github.com/axios/axios
 */
import axios from 'axios'
import app from './main'

const instance = axios.create({
  baseURL: '/api/',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(config => {
  app.$Progress.start() // For every request start the progress
  return config
})

instance.interceptors.response.use(
  response => {
    app.$Progress.finish() // Finish when a response is received
    return response
  },
  error => {
    app.$Progress.finish() // Finish if the request errors

    // If the request returns an error, its most likely that
    // the session has expired and we need to refresh the page
    // However, there could be an exception where we don't want
    // to force refresh.
    if (
      error.response.status === 401 &&
      error.response.config.url !== '/students/user' &&
      !error.response.config.url.includes('discordapp') &&
      error.response.config.url !== '/students/loginas'
    ) {
      alert('Your session has expired! Refreshing...')
      location.reload()
      return
    }
    return Promise.reject(error)
  }
)

export default instance
