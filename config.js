var routes = {};
if (process.env.NODE_ENV=='production') {
  routes = {api: 'http://modulair.muhammadmustadi.com'}
} else {
  routes = {api: 'http://localhost:3211'}
}

exports.routes = routes;
