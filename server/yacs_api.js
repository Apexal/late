const request = require('request-promise');

const YACS_SECTION_API_BASE_URL =
  'https://nightly.yacs.io/api/v6/sections?filter[crn][eql]=';

async function getSectionInfoFromCRN(crn) {
  const uri = YACS_SECTION_API_BASE_URL + crn;

  let data = (await request({ uri, json: true })).data;

  if (data.length == 0) return false;
  data = data[0];

  // get listing
  const listing_uri = data.relationships.listing.links.related;
  const listing = (await request({ uri: listing_uri, json: true })).data;

  const section = {
    listing_id: listing.id,
    longname: listing.attributes.longname,
    crn,
    periods: data.attributes.periods
  };

  return section;
}

module.exports = { getSectionInfoFromCRN };
