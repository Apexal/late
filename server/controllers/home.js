async function index(ctx) {
  ctx.state.title = 'Home';
  await ctx.render('home/index');
}

async function about(ctx) {
  ctx.state.title = 'About';
  await ctx.render('home/about');
}

/* THE HONORABLE */
async function honorable(ctx) {
  ctx.body = '<img style="height: 100%;" src="/images/honorable.jpg">';
}

module.exports = { index, about, honorable };
