const config = require('config');
const CAS = require('koa2-cas');

//cas.configure({ host: 'https://cas-auth.rpi.edu/cas' });

const cas = new CAS({
  cas_url: 'https://cas-auth.rpi.edu/cas',
  service_url: `http://${config.get('server.base_url')}:${config.get(
    'server.port'
  )}`,
  cas_version: '3.0'
});

async function loginStudent(ctx) {
  let student = await ctx.db.Student.findOne().byUsername(ctx.session.cas_user);

  if (student) {
    console.log(`[Logging in ${student.rcs_id}]`);
  } else {
    student = ctx.db.Student({
      rcs_id: ctx.session.cas_user,
      joined_date: new Date()
    });
    console.log(
      `[Creating and logging in new student with rcs_id: ${student.rcs_id}]`
    );
  }

  student.last_login = new Date();
  await student.save();

  ctx.redirect(ctx.query.redirectTo);
}

module.exports = { cas, loginStudent };
