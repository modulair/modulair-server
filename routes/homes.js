var express = require('express');
var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'scratch-server' });
// });
/*
 * GET userlist.
 */
router.get('/all', function(req, res) {
    var db = req.db;
    db.collection('homecollection').find().toArray(function (err, items) {
        res.json(items);
    });
});
/*
 * POST to adduser.
 */
router.post('/add', function(req, res) {
    var db = req.db;
    db.collection('homecollection').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});
/*
 * POST to adduser.
 */
router.delete('/delete/:id', function(req, res) {
    var db = req.db;
    var homeToDelete = req.params.id;
    db.collection('homecollection').removeById(homeToDelete, function(err, result){
        res.send(
            (result === 1) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;