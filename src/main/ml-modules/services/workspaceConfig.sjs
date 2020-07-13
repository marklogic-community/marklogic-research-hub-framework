function get(context, params) {

var config = cts.doc("/Workspace/config/config.json")

return config
}

exports.GET = get;