const assert = require('assert')

const directory = require('../modules/directory')

describe('Directory', function () {
  const { scrapeForName, getNameAndMajor } = directory
  describe('#scrapeForName', function () {
    it('should find the url for rcsid', async function () {
      const rcsID = 'matraf'
      const url = 'https://info.rpi.edu//people/frank-matranga'

      assert.equal(await scrapeForName(rcsID), url)
    })
  })
})
