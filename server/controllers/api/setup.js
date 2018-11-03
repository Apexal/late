const logger = require('../../logger');

/**
 * Given personal info in the request body:
 * - first_name
 * - last_name
 * - rin
 * - grad_year
 * Save it to the logged in user.
 *
 * @param {Koa context} ctx
 */
async function setPersonalInfo(ctx) {
  const body = ctx.request.body;
  const user = await ctx.db.Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();

  // TODO: validate RIN
  user.rin = body.rin;
  user.name.first = body.first_name;
  user.name.last = body.last_name;

  user.grad_year = parseInt(body.grad_year);

  user.setup.personal_info = true;

  try {
    await user.save();

    logger.info(`Saved personal info for ${user.rcs_id}`);
    ctx.ok({ user });
  } catch (err) {
    logger.error(`Failed to save personal info for ${user.rcs_id}: ${err}`);
    ctx.badRequest({ err });
  }
}

module.exports = {
  setPersonalInfo
};
