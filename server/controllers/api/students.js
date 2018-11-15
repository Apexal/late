const logger = require('../../logger');

/**
 * Only available in development mode. Login as a user given their ID.
 *
 * @param {Koa session} ctx
 **/
async function loginAs (ctx) {
  if (ctx.state.env !== 'development') {
    return ctx.forbidden('Not in development mode.');
  }

  const rcsID = ctx.request.query.rcs_id;
  ctx.session.cas_user = rcsID;
  logger.info(`Logging in as ${rcsID}`);

  await getUser(ctx);
}

async function getUser (ctx) {
  logger.info(`Getting user info for ${ctx.state.user.rcs_id}`);

  ctx.ok({
    user: ctx.state.user
  });
}

/*
async function getStudent (ctx) {

}
*/
module.exports = {
  loginAs,
  getUser
  // getStudent
};
