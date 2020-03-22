const { Octokit } = require('@octokit/rest')
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
})

const owner = 'apexal'
const repo = 'late'

module.exports = {
  createIssue (submitterRCSID, title, body) {
    return octokit.issues.create({
      owner,
      repo,
      labels: ['Automated', 'User Submitted'],
      title: '[AUTOMATED] ' + title || 'User Submitted Issue',
      body: body ? `**Issue submitted from the web app by ${submitterRCSID}**\n---\n${body}` : 'The use did not give any further info.'
    })
  }
}
