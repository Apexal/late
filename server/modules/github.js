const { Octokit } = require('@octokit/rest')
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
})

const owner = 'apexal'
const repo = 'late'

/**
 * Submit an issue on the GitHub repo under Frank's account. (Kinda dangerous...)
 * Used to report an issue.
 *
 * @param submitterRCSID String RCS ID of the user reporting
 * @param title String title of the report
 * @param body String content of the report
 */
module.exports.createIssue = function (submitterRCSID, title, body) {
  return octokit.issues.create({
    owner,
    repo,
    labels: ['Automated', 'User Submitted'],
    title: '[AUTOMATED] ' + title || 'User Submitted Issue',
    body: body ? `**Issue submitted from the web app by ${submitterRCSID}**\n---\n${body}` : 'The use did not give any further info.'
  })
}

/**
 * Get LATE's releases from the repo.
 *
 * @param {Number} page Page number (default=1)
 * @returns {Promise<Response>} Response from GitHub API
 */
module.exports.getReleases = function (page = 1) {
  return octokit.repos.listReleases({
    owner,
    repo,
    page
  })
}
