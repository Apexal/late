export default {
  allowedKeys: {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    66: 'b'
  },
  konamiCode: ['down', 'down', 'up', 'up', 'right', 'left', 'right', 'left', 'a', 'b'],

  // a variable to remember the 'position' the user has reached so far.
  konamiCodePosition: 0,

  // add keydown event listener
  addReverse () {
    document.addEventListener('keydown', function (e) {
      // get the value of the key code from the key map
      var key = this.allowedKeys[e.keyCode]
      // get the value of the required key from the konami code
      var requiredKey = this.konamiCode[this.konamiCodePosition]

      // compare the key with the required key
      if (key === requiredKey) {
        // move to the next key in the konami code sequence
        this.konamiCodePosition++

        // if the last key is reached, activate cheats
        if (this.konamiCodePosition === this.konamiCode.length) {
          this.activateReverse()
          this.konamiCodePosition = 0
        }
      } else {
        this.konamiCodePosition = 0
      }
    })
  },

  activateReverse () {
    open('http://koalastothemax.com/?aHR0cHM6Ly93aWtpLm9wZW5zb3VyY2Uub3JnL2Jpbi9kb3dubG9hZC9NYWluL09TSStCb2FyZCtvZitEaXJlY3RvcnMvQm9hcmQrTWVtYmVyK0VsZWN0aW9ucy9GcmFua01hdHJhbmdhMjAxOS9mcmFua19sYXB0b3AucG5nP3dpZHRoPTMwMCZ3aWR0aD0zMDAmd2lkdGg9MzAwJndpZHRoPTMwMCZ3aWR0aD0zMDAmd2lkdGg9MzAwJndpZHRoPTMwMCZ3aWR0aD0zMDAmd2lkdGg9MzAwJndpZHRoPTMwMCZ3aWR0aD0zMDAmd2lkdGg9MzAwJndpZHRoPTMwMCZ3aWR0aD0zMDAmd2lkdGg9MzAwJndpZHRoPTMwMCZ3aWR0aD0zMDA=')
  }
}
