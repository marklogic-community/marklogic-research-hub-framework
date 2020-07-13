import Concept from '../concept/Concept';
import jsonParseHighlights from './utils';

const MAX_TITLE_LENGTH = 100;

class Entity extends Concept {
  
  constructor(data) {
    super(data);
    this.entity = data;
  }

  getGraphTitle() {
    let title = null;
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';
    } else {
      title = '<p><b>Name: </b><i>Unknown</i></p>';
    }

    return title;
  }

  static fetchEntityById(id) {
    let contentType;
    return fetch(
      new URL(
        '/v1/resources/entity?rs:id=' + encodeURIComponent(id),
        document.baseURI
      ).toString(),
      { credentials: 'same-origin' }
    )
      .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then(response => {
        if (response.entity && response.relationships) {
          response.entity.relationships = response.relationships;
        }
        return {
          content: response.entity || response,
          contentType: response.contentType || contentType
        };
      });
  }

  static searchFunc(entityType) {
    return {
      search: (searchQuery) => {
        return fetch(new URL(`/api/search/${entityType}`, document.baseURI).toString(), {
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
        }).then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.message);
            });
          }
          return response.json()
          .then(res => {
            res.results.forEach(result => {
              if (result.content && result.content.highlighted) {
                result.highlighted = jsonParseHighlights(
                  result.content.highlighted
                );
                result.highlightedLabel = result.highlighted.preferredName;
              }
            });
            return res;
          });
        });
      }
    };
  }
  
  static truncateTitle(string) {
    return typeof string === 'string' && string.length > MAX_TITLE_LENGTH
      ? string.substring(0, MAX_TITLE_LENGTH) + '...'
      : string;
  }

  static arrayToTitle(list, propName, label) {
    let values = '';
    list.forEach(x => {
      values += (propName ? x[propName] : x) + ', ';
    });

    // Slice off the trailing comma and space.
    let title = Entity.truncateTitle(values.slice(0, -2));
    return '<p><b>' + label + ' (' + list.length + '): </b>' + title + '</p>';
  }

  static valueToTitle(value, label) {
    let title = Entity.truncateTitle(value);
    return '<p><b>' + label + ': </b>' + title + '</p>';
  }

  static getInstance(data) {
    throw new Error('You have to override the getInstance() method for this entity')
  }

  static getEntityName() {
    throw new Error('You have to override the entityName() method for this entity')
  }

  static getGraphIcon() {
    throw new Error('You have to override the getGraphIcon() method for this entity')
  }

  static getIcon() {
    throw new Error('You have to override the getIcon() method for this entity')
  }

  static getColor() {
    throw new Error('You have to override the getColor() method for this entity')
  }

  static getShape() {
    throw new Error('You have to override the getShape() method for this entity')
  }

  static getGraphGroupPrefixes() {
    throw new Error('You have to override the getGraphGroupPrefixes() method for this entity')
  }

  static getSearchReducerNamespace() {
    throw new Error('You have to override the getSearchReducerNamespace() method for this entity')
  }

  static getWorkspacePredicates() {
    throw new Error('You have to override the getWorkspacePredicates() method for this entity')
  }
}

export default Entity;
