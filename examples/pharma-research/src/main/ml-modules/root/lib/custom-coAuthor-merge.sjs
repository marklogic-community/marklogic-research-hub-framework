'use strict'

function unique(arr, keyProps) {
 const kvArray = arr.map(entry => {
  const key = keyProps.map(k => entry[k]).join('|');
  return [key, entry];
 });
 const map = new Map(kvArray);
 return Array.from(map.values());
};

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
};

function coAuthorMerge(propertyName, properties, propertySpec) {
 //we'll use double metaphone as key
 var results = []
 properties.forEach(function(property) {
  let author = property.values.author;
  results.push({spell: Array.from(spell.doubleMetaphone(author)).join('-'), author: author})
 });

var values = unique(results, ['spell'])
//If there is result restriction in config honour it.
if (propertySpec.maxValues) {
  const maxValues = propertySpec.maxValues;
  values = values.slice(0,maxValues);
};

 xdmp.log("coAuthors merged from " + results.length + " to " + values.length)

// return something like Sequence.from([{name: propertyName, values: new NodeBuilder().addNode({author:"Bill Smith"}).toNode()}]);
return Sequence.from([{name: propertyName, values: new NodeBuilder().addNode(sortByKey(values, "author")).toNode()}]);
};

exports.coAuthorMerge = coAuthorMerge;
