const request = require('request-promise');
const logger = require('./logger');

const CMS_API_RCS_ID_BASE_URL = 'https://cms.union.rpi.edu/api/users/view_rcs/';

async function getStudentInfoFromRCS (rcsID) {
  const uri = CMS_API_RCS_ID_BASE_URL + rcsID;

  logger.info(`Getting student info for ${rcsID} from CMS API.`);

  // TODO: authenticate with API key if it arrives
  let data = await request({ uri, json: true });
  // TODO: check if response is valid

  return data;
}

module.exports = { getStudentInfoFromRCS };
