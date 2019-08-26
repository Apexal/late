export default {
  determineWeight (assignmentCount, examCount) {
    const weight = assignmentCount + examCount * 5
    if (weight === 0) {
      return this.weights[0]
    } else if (weight < 10) {
      return this.weights[1]
    } else if (weight < 15) {
      return this.weights[2]
    }
    return this.weight[3]
  },
  weights: [
    {
      className: 'is-white box',
      title: 'Empty'
    },
    {
      className: 'is-success',
      title: 'Light'
    },
    {
      className: 'is-warning',
      title: 'Medium'
    },
    {
      className: 'is-danger',
      title: 'Heavy'
    }
  ]
}
