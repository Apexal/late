async function index(ctx) {
  ctx.body = "Don't be LATE";
}

async function about(ctx) {
  ctx.body = 'About LATE';
}

module.exports = { index, about };
