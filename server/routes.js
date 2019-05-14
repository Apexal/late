const { loginStudent, cas } = require('./modules/auth');
const request = require('request-promise');
const google = require('./modules/google');
const btoa = require('btoa');
const logger = require('./modules/logger');

module.exports = router => {
  // router.use(path, router);
  router.use(
    '/api',
    async function (ctx, next) {
      if (
        !ctx.request.url.startsWith('/api/students/loginas') &&
        !ctx.request.url.startsWith('/api/students/counts') &&
        !ctx.request.url.startsWith('/api/checklists') &&
        !ctx.session.cas_user
      ) {
        return ctx.unauthorized('You must be logged in to use the API.');
      }
      await next();
    },
    require('./api')
  );

  // CAS Auth routes
  router.get(
    '/auth/login',
    async (ctx, next) => {
      // In case just /login without redirectTo in the query
      ctx.query.redirectTo = ctx.query.redirectTo || '/';
      await next();
    },
    cas.bounce,
    loginStudent
  );
  router.get('/auth/logout', cas.logout);

  router.get('/auth/google', ctx => {
    const googleAuth = google.createConnection();
    ctx.redirect(google.createUrl(googleAuth));
  });

  router.get('/auth/google/callback', async ctx => {
    const googleAuth = google.createConnection();

    const { code } = ctx.query;
    const { tokens } = await googleAuth.getToken(code);

    Object.assign(ctx.state.user.integrations.google.tokens, tokens);
    ctx.state.user.setup.google = true;

    await ctx.state.user.save();

    ctx.redirect('/account/googlecalendar');
  });

  router.get('/auth/discord', ctx => {
    ctx.redirect(process.env.DISCORD_REDIRECT_URL);
  });

  router.get('/auth/discord/callback', async ctx => {
    const { code } = ctx.request.query;
    const creds = btoa(
      `${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`
    );
    logger.info(`Authenticating ${ctx.state.user.rcs_id} through Discord...`);
    const tokens = await request({
      uri: `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${
        process.env.DISCORD_CALLBACK_URL
      }`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`
      },
      json: true
    });

    logger.info('Getting Discord user info...');
    // Get info on user (mainly to get their user ID)
    const me = await request({
      uri: 'https://discordapp.com/api/users/@me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      },
      json: true
    });

    ctx.session.discord_tokens = tokens;
    ctx.state.user.integrations.discord = {
      verified: true,
      userID: me.id,
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      }
    };

    await ctx.state.user.save();

    // Forcibly add the user to the LATE server ;)
    const addToServer = await request({
      uri: `https://discordapp.com/api/guilds/${
        process.env.DISCORD_SERVER_ID
      }/members/${me.id}`,
      method: 'PUT',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
      },
      body: {
        access_token: tokens.access_token,
        nick: ctx.state.user.display_name,
        roles: [process.env.DISCORD_USER_ROLE_ID]
      },
      json: true
    });
    logger.info(
      `Added ${ctx.state.user.rcs_id} to the LATE Discord server as @${
        ctx.state.user.display_name
      }`
    );
    ctx.redirect('/account/integrations#discord');
  });
};
