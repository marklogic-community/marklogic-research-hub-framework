import jsonParseHighlights from '../utils';

const authorAPI = {
  search: searchQuery => {
    return fetch(new URL('/api/search/author', document.baseURI).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        ...searchQuery,
        queryText: undefined,
        filters: {
          and: [
            {
              type: 'queryText',
              value: searchQuery.queryText
            },
            ...(searchQuery.filters || [])
          ]
        },
        options: {
          ...searchQuery.options
        }
      })
    }).then(async response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      const json = await response.json();
      json.results.forEach(result => {
        if (result.content && result.content.content) {
          if (result.content.highlighted) {
            result.highlighted = jsonParseHighlights(
              result.content.highlighted
            );
            result.highlightedLabel = result.highlighted.personName;
          }
          result.author = result.content.content;
          result.label = result.author.personName;
        }
      });
      return json;
    });
  },
  fetchAuthorID: authorName => {
    return fetch(
      new URL(
        '/api/authorIDByName?name=' + authorName,
        document.baseURI
      ).toString(),
      { credentials: 'same-origin' }
    ).then(async response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }

      try {
        const json = await response.json();
        return json.id;
      }
      catch(err) {
        console.error(err);
      }
      return null;
    });
  }
};

export default authorAPI;
