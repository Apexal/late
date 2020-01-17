import moment from 'moment'
import store from '@/store'

const TIME_FORMAT = 'h:mm a'
const SHORT_DATE_FORMAT = 'M/D/YY'
const LONG_DATE_FORMAT = 'dddd, MMMM Do YYYY '

export default {
  methods: {
    timeFormat: dateOrStr => (dateOrStr.length === 5 ? moment(dateOrStr, 'HH:mm') : moment(dateOrStr)).format(TIME_FORMAT), // Very bad I know
    shortDateFormat: date => moment(date).format(SHORT_DATE_FORMAT),
    longDateFormat: date => moment(date).format(LONG_DATE_FORMAT),
    shortDateTimeFormat: date =>
      moment(date).format(SHORT_DATE_FORMAT + ' ' + TIME_FORMAT),
    longDateTimeFormat: date =>
      moment(date).format(LONG_DATE_FORMAT + ' ' + TIME_FORMAT),
    fromNow: date => moment(date).from(store.state.now)
  }
}
