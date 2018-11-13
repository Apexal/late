const logger = require('../../logger');

/**
 * Only available in development mode. Login as a user given their ID.
 *
 * @param {Koa session} ctx
 **/
async function loginAs (ctx) {
  if (ctx.state.env !== 'development') { return ctx.forbidden('Not in development mode.'); }

  const rcsID = ctx.request.query.rcs_id;
  ctx.session.cas_user = rcsID;
  logger.info(`Logging in as ${rcsID}`);

  await getUser(ctx);
}

async function getUser (ctx) {
  const user = await ctx.db.Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();

  logger.info(`Getting user info for ${ctx.session.cas_user.toLowerCase()}`);

  ctx.ok({
    user
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
