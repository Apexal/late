const { loginStudent, cas } = require('./modules/auth');
const request = require('request-promise');
const google = require('./modules/google');
const btoa = require('btoa');

module.exports = router => {
  // router.use(path, router);

  router.use(
    '/api',
    async function (ctx, next) {
      if (
        !ctx.request.url.startsWith('/api/students/loginas') &&
        !ctx.request.url.startsWith('/api/students/counts') &&
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

  router.get('/google/auth/callback', async ctx => {
    const googleAuth = google.createConnection();

    const { code } = ctx.query;
    const { tokens } = await googleAuth.getToken(code);

    ctx.session.googleAuthToken = tokens;

    ctx.ok(tokens);
  });

  router.get('/auth/discord', ctx => {
    ctx.redirect(process.env.DISCORD_REDIRECT_URL);
  });

  router.get('/auth/discord/callback', async ctx => {
    const { code } = ctx.request.query;
    const creds = btoa(`${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`);
    const tokens = await request({
      uri: `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${process.env.DISCORD_CALLBACK_URL}`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`
      },
      json: true
    });

    ctx.session.discord_tokens = tokens;
    ctx.state.user.integrations.discord = {
      verified: true,
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      }
    };

    await ctx.state.user.save();

    ctx.ok(tokens);
  });

  router.get('/auth/discord/user', async ctx => {
    const token = ctx.session.discord_tokens.access_token;
    let who = await request({
      uri: 'https://discordapp.com/api/users/@me',
      query: {
        'client_secret': process.env.DISCORD_CLIENT_SECRET
      },
      headers: {
        Authorization: `Bearer ${token}`
      },
      json: true
    });

    ctx.ok(who);
  });
};
