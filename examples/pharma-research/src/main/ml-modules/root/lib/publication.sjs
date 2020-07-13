/*
  Might move this to a common lib

  it checks to make sure we can use xpath on this 
  element. if not it created a node that allows us to do so.
*/


function castAsNode(content){
  let source;

  if (content.hasOwnProperty('xpath')) {
      source = content;
  } else {
      const nb = new NodeBuilder();
      nb.startDocument();
      if (content instanceof Sequence) {
          for (let part of content) {
            nb.addNode(part);
          }
      } else {
         nb.addNode(content)
      }
      
      nb.endDocument();
      
      source = nb.toNode().root;
  }

  return source
}

function getSystemTime() {

  const currentDateTime = fn.currentDateTime();
  const elapsedTime = xdmp.elapsedTime();
  const systemDateTimeCreated = currentDateTime.add(elapsedTime);

  const builder = new NodeBuilder();
      
  builder.startElement('systemDateTimeCreated');
    builder.addText(xs.string(systemDateTimeCreated));
  builder.endElement();

  return builder.toNode();
}

function buildDate2 (dateNodeIn){

    if (fn.exists(dateNodeIn)){
    let year, month, day ;
   if (fn.exists(fn.head(dateNodeIn).xpath("year/text()")))
   { 
     year = fn.head(dateNodeIn).xpath("year/text()") ;
     month = fn.head(dateNodeIn).xpath("month/text()")
     day =  fn.head(dateNodeIn).xpath("month/text()")
     //if ((fn.string(month)).lenght() == 1 ){
      //month = "0" + month;
     //}
     
     //i//f ((fn.string(day)).lenght() == 1 ){
      //day = "0" + day;
     //}
   }
    else {
    year = fn.head(dateNodeIn).xpath("Year/text()") ;
     month = fn.head(dateNodeIn).xpath("Month/text()")
     day =  fn.head(dateNodeIn).xpath("day/text()")
   }; 
    
  let dateString = fn.string(year + "-" + month + "-" + day)

// This is to have a valid xml date node 
   let date2 = new Date(dateString)
  return  xs.string(xs.date(date2))
 // xdmp.parseDateTime("[Y0001]-[M01]-[D01]", dateString)

  
  }
  else return null
}

function buildDate(dateNodeIn){
  var dateNode = castAsNode(dateNodeIn)
  return dateNode.xpath("Year/text()") + "-" + dateNode.xpath("Month/text()") + "-" + dateNode.xpath("Day/text()");
}

function getLastModifiedDate(sourceIn) {

  var source = castAsNode(sourceIn)

  var dateCompleted = source.xpath("/PubmedArticle/MedlineCitation/DateCompleted");
  var dateRevised = source.xpath("/PubmedArticle/MedlineCitation/DateRevised");

  var lastModifiedDate;
  if (fn.exists(dateRevised)) {
    lastModifiedDate = buildDate(dateRevised); 
  } else {
    lastModifiedDate = buildDate(dateCompleted); 
  }

  const builder = new NodeBuilder();
      
  builder.startElement('lastModifiedDate');
    builder.addText(lastModifiedDate);
  builder.endElement();

  return builder.toNode();
}

function getLastModifiedDatePMC (sourceIn) {

  let lastModifiedDate = buildDate2(sourceIn)
  
if(fn.exists(lastModifiedDate)) {
  const builder = new NodeBuilder();
  builder.startElement('lastModifiedDate');
  builder.addText(lastModifiedDate);
  builder.endElement();
  return builder.toNode();
}
else {
  return null
}

  
}

function cleanTopic(topic) {
  return fn.normalizeSpace(topic)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ').replace(".","");
};

function getTopicsArray(sourceIn) {
  let source = castAsNode(sourceIn)

  let path;

  if (source.localName == "envelope") {
    path = "/*:envelope/*:attachments/"
  } else {
    path ="/"
  }

  let  topics = source.xpath(path + '*:PubmedArticle/*:MedlineCitation/*:KeywordList/*:Keyword/text()')

  var results = [];

  for (let topic of topics) {
    results.push(cleanTopic(topic))
  }

  return results
}

function getTopicsXML(sourceIn) {
  let topics = getTopicsArray(sourceIn);

  const nb = new NodeBuilder();

  nb.startElement('topics');

  topics.forEach(function(topic) {
    const builder = new NodeBuilder();
        
    builder.startElement('topicPreferredName');
      builder.addText(topic);
    builder.endElement();
    
    nb.addNode(builder.toNode()); 
  });

  nb.endElement();

  return nb.toNode();
}

module.exports = {

  getLastModifiedDatePMC: getLastModifiedDatePMC,
  castAsNode: castAsNode,
  getLastModifiedDate: getLastModifiedDate,
  getSystemTime: getSystemTime,
  getTopicsArray: getTopicsArray,
  getTopicsXML: getTopicsXML
};