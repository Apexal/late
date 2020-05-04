export default {
  /**
   * Determine the weight of an assignment or exam
   *
   * @param {Object} assessment Assignment or exam
   * @returns {Number} Decimal weight
   */
  calculateAssessmentWeight (assessment) {
    const { assessmentType, priority } = assessment

    let weight = 1
    if (assessmentType === 'assignment') {
      if (priority === 0) return 0

      weight += priority
    } else if (assessmentType === 'exam') {
      weight *= 4
      weight += priority * 2
    }

    return weight
  },
  /**
   * Determine the weight of assignments and exams based on their count, importance, and estimated hours to complete
   *
   * @param {*} assignments
   * @param {*} exams
   */
  determineWeight (assessments) {
    const weight = assessments.reduce((acc, ass) => acc + this.calculateAssessmentWeight(ass), 0)

    if (weight === 0) {
      return this.weights[0]
    } else if (weight < 25) {
      return this.weights[1]
    } else if (weight < 35) {
      return this.weights[2]
    }
    return this.weights[3]
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
