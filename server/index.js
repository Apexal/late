const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body =
    '<img src="https://lh3.googleusercontent.com/CwEEoTgzHqUWILyz88FGBKRc6cGBGOGyeVrfZkHgJctUQj8NiJ5uNcsy7YKotCPfcpTuiZZwCUzI8McXVMMoS530cAcDcT_0uAKoE-DMrxu2ABwyRVczud6IAOI07m9m0oy4ke-cmgaqIYzyUnIDY2eEbGYsOvEOJGBIQYHbVjRmOt8dsTQPwVR-MyumbZQ5ET4MF02HNa2RzMtIG5gyAgQC-eV04HFnDAFLh_ePWIA_VXn-RHagdsekV1X4rOV0wCg5w_ymmDsMUYuHXHMh93Tfb3DzoPJ1qLqhjHfEJcl9hmin-R-FmLV5wb0vqdxp178QF-i3xnU9Y5yBjAp24xNeKHzT9lWB65uK2zaXPSb7ZJEj76UH0FBwIMuoOuE4j_9W_wxkrUtf4FYiCzhdST-O3uRMr_oJf59sBivX7t87XGrvc6I-dijyN9Y3WuZPYCF0h2xkjk41GBItjyNlJXPC5a0ZBmZah7iYfm3khllxS8rdxd7gWnBQrvCHDBHiirUwNPWIk2MvzQNBJkGMP6s-vNNPlRTPzpW8BHVXgMFsYnQlyRSlW9oCdm49O1N2sW9hN_ripzqw-lnv2JuwrLOF5Z6JdUcl5G17aLXGBgsUbUjKr9Bo2blQxIs9CXcw=w1174-h948-no">';
});

app.on('error', err => {
  log.error('server error', err);
});

module.exports = app;
