const jsonParseHighlights = highlighted =>
  Object.keys(highlighted).reduce((highlightedObj, key) => {
    let highlightedValue;
    try {
      highlightedValue = JSON.parse(highlighted[key]);
    } catch (e) {
      // not JSON
      highlightedValue = highlighted[key];
    }
    highlightedObj[key] = highlightedValue;
    return highlightedObj;
  }, {});

export default jsonParseHighlights;