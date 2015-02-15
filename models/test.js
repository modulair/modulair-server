exports.dummyTestMethod = {
    'spec': {
        description : "Test method",
        path : "/test/",
        method: "GET",
        summary : "This is a dummy test method",
        type : "void",
        nickname : "dummyTestMethod",
        produces : ["application/json"]
    },
    'action': function (req, res) {
        res.send(JSON.stringify("test is ok"));
    }
};
