const assert = require('assert')

const directory = require('../modules/directory')

describe('Directory', function () {
  const { scrapeForName, getNameAndMajor } = directory
  describe('#scrapeForName', function () {
    it('should find the url for rcsid', async function () {
      const rcsID = 'muk'
      const url = 'https://info.rpi.edu/people/karen-mu'

      assert.equal(await scrapeForName(rcsID), url)
    })
  })

  describe('#getNameAndMajor', function () {
    it('should get the right name and major', async function () {
      const rcsID = 'matraf'
      const firstName = 'Frank'
      const lastName = 'Matranga'
      const major = 'Information Tech and Web Science'
      const actual = await getNameAndMajor(rcsID)
      assert.equal(actual.major, major)
      assert.equal(actual.name.first, firstName)
      assert.equal(actual.name.last, lastName)
    })
  })
})
