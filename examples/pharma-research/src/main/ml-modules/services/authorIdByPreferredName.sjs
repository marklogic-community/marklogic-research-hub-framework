function get(context, params) {
  const error = require('/lib/error.sjs');

  if (params.hasOwnProperty('preferredName')){
    const query = cts.andQuery([
      cts.collectionQuery('Author'),
      cts.collectionQuery('authorProcessed'),
      cts.jsonPropertyValueQuery('authorPreferredName', params.preferredName)
    ])

    const authorUri = fn.head(cts.uris('', ['limit=1'], query));
    context.outputTypes = ['application/json'];
    if (authorUri) {
      const response = { uri: authorUri };
      return response;
    } else {
      return {uri: null}
    }
  } else {
    return fn.error(400, 'noPreferredName', {'message': 'You must supply an rs:preferredName'})
  }
}

exports.GET = get;
