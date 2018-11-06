const request = require('request-promise');
const logger = require('./logger');

const CMS_API_RCS_ID_BASE_URL = 'https://cms.union.rpi.edu/api/users/view_rcs/';

async function getStudentInfoFromRCS(rcs_id) {
  const uri = CMS_API_RCS_ID_BASE_URL + rcs_id;

  logger.info(`Getting student info for ${rcs_id} from CMS API.`);

  // TODO: authenticate with API key if it arrives
  let data = await request({ uri, json: true });
  // TODO: check if response is valid

  return data;
}

module.exports = { getStudentInfoFromRCS };
