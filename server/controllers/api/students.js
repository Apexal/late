const logger = require('../../logger');
const cas = require('../../auth').cas;

/**
 * Only available in development mode. Login as a user given their ID.
 *
 * @param {Koa session} ctx
 **/
async function loginAs(ctx) {
  console.log(ctx.request);

  const rcs_id = ctx.request.query.rcs_id;
  ctx.session.cas_user = rcs_id;
  logger.info(`Logging in as ${rcs_id}`);

  await getUser(ctx);
}

async function getUser(ctx) {
  const user = await ctx.db.Student.find().byUsername(ctx.session.cas_user.toLowerCase()).exec();
  if (!user) {
    ctx.internalServerError('Cannot find logged in user.');
    await cas.logout;
  } else {
    ctx.ok({
      user
    });
  }
}

async function getStudent(ctx) {

}

module.exports = {
  loginAs,
  getUser,
  getStudent
};