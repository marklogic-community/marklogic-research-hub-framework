const sem = require("/MarkLogic/semantics.xqy");

const PREFIX_RDFA = "";
const PREFIX_MAP = sem.prefixes(PREFIX_RDFA);
const PREFIXES = ["xs","xhtml","dcterms","og","atom","rdf","vcard","dbpedia-owl","owl","rss","geonames","foaf","doap","dbpedia","cc","product","rdfs","media","prov","result-set","skos","dc","void","wikidata"];
const IRI_TYPE = sem.curieExpand("rdf:type");
const IRI_LABEL = sem.curieExpand("rdfs:label");


function dynIRI(expr) {
   if (!expr || expr == null) return null;
   var type = xdmp.type(expr)
   if (type == "array") {
    var arr = [];
    for (var i = 0; i < expr.length; i++) {
      var expri = dynIRI(expr[i]);
      if (expri && expri != null) arr.push(expri);
    }
    return arr;
   }
   if (type == "iri" || type == "blank") return expr;
   if (type == "string") {
	   for (var i = 0; i < PREFIXES.length; i++) {
	      if (expr.startsWith(PREFIXES[i] + ":")) return sem.curieExpand(expr, PREFIX_MAP);	
	   }
	   return sem.iri(expr);
   }
   throw expr + " " + type;
}

function addTriple(ret, s, p, o) {
  if (!s || s== null || !p || p == null || !o || o == null) return;
  if (xdmp.type(o) == "array") {
    for (var i = 0; i < o.length; i++) addTriple(ret, s, p, o[i]);
  }
  else ret.push(sem.triple(s,p,o));    
}

function extractEnvelopeInstanceValue(envelope, field) {
	var nenv = envelope instanceof Node ? envelope : xdmp.toJSON(envelope);
	return nenv.xpath("string(/*:envelope/*:instance//" + field + ")");
}

function setTriples_Concept(id, content, headers, ioptions) {
  var iri = dynIRI(content.id);
  var ret = [];
  return ret;
}
function setTriples_Organization(id, content, headers, ioptions) {
  var iri = dynIRI(content.id);
  var ret = [];
  return ret;
}
module.exports = {
  setTriples_Concept:setTriples_Concept,
  setTriples_Organization:setTriples_Organization
};