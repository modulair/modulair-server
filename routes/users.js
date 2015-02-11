var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    db.collection('usercollection').find().toArray(function (err, items) {
        res.json(items);
    });
});
/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    db.collection('usercollection').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});
/*
 * POST to adduser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('usercollection').removeById(userToDelete, function(err, result){
        res.send(
            (result === 1) ? { msg: '' } : { msg: err }
        );
    });
});
module.exports = router;
