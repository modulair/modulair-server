var routes = {};
if (process.env.NODE_ENV=='production') {
  routes = {
    api: 'http://modulair.muhammadmustadi.com',
    domain: 'modulair.muhammadmustadi.com'
    }
} else {
  routes = {
    api: 'http://localhost:3211',
    domain: 'localhost'
    }
}
exports.routes = routes;
