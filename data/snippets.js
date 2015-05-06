//RESPONSES
res.status(stat).send(JSON.stringify(message, null, 3));

//ASYNC
async.series([
      function (callback) {
        // do some stuff ...
        callback(null);
      },
      function (callback) {
        // do some more stuff ...
        callback(null, 'two');
      }
    ],
    // optional callback
    function (err, results) {
      if (err) {
        switch(err) {
          case 400:
            res.status(err).send(errorHandling(err, "Bad request."));
            break;
          case 404:
            res.status(err).send(errorHandling(err, "Not found."));
            break;
          default:
            res.status(500).send(JSON.stringify("Unknown error."));
            break;
        }
      } else {
        res.status(200).send(JSON.stringify("OK"));
      }
    });

//ObjectID checking
function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(user_id)) {
          callback(null);
        } else {
          callback(400);
        }
      }
