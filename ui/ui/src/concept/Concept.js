/* Subclass this abstract class for every Concept in the system. Recall that Concepts are items that
   exist on the knowledge graph in RDF, but do not have full documents or Entity definitions.

   Some defaults are provided, such as truncating titles to 100 characters and adding an elipsis. These
   behaviors can be overridden if desired.
 */

const MAX_TITLE_LENGTH = 100;

class Concept {

  concept;

  constructor(data) {
    this.concept = data;
  }

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static truncateTitle(string) {
    return typeof string === 'string' && string.length > MAX_TITLE_LENGTH
      ? string.substring(0, MAX_TITLE_LENGTH) + '...'
      : string;
  }

  static arrayToTitle(list, propName, label) {
    // Slice off the trailing comma and space.
    let title = label
    return '<p><b>' + label + ' (' + list.length + '): </b>' + title + '</p>';
  }

  static valueToTitle(value, label) {
    let title = value//Entity.truncateTitle(value);
    return '<p><b>' + label + ': </b>' + title + '</p>';
  }

  static getInstance(data) {
    throw new Error('You have to override the getInstance() method for this concept')
  }

  static getConceptName() {
    throw new Error('You have to override the getConceptName() method for this concept')
  }

  static getGraphIcon() {
    throw new Error('You have to override the getGraphIcon() method for this concept')
  }

  static getGraphColor() {
    throw new Error('You have to override the getGraphColor() method for this concept')
  }

  static getGraphShape() {
    throw new Error('You have to override the getGraphShape() method for this concept')
  }

  static getGraphGroupOptions() {
    throw new Error('You have to override the getGraphGroupOptions() method for this concept')
  }

  static getGraphGroupPrefixes() {
    throw new Error('You have to override the getGraphGroupPrefixes() method for this concept')
  }

}

export default Concept;
