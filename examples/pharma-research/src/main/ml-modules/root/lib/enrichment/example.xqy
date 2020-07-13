xquery version "1.0-ml";

import module namespace ee = "http://marklogic.com/phr/lib/enrichment/entity-enrichment" at "/lib/enrichment/entity-enrichment.xqy";
(:
/test.xml
<html>
<article>1. The donkey postalbumin protein has been shown to be the equivalent of human alpha 1 alpha-1B-glycoprotein alpha-1B-glycoprotein alpha-1B-glycoprotein alpha-1B-glycoprotein by protein immunoblotting and N-terminal amino acid sequence. 2. The horse A1B system (already identified as the homologue of human alpha 1 B-glycoprotein) and the donkey alpha 1 B-glycoprotein were characterized further for terminal sialic acid content, isoelectric point, amino acid composition and affinity for the dye-ligand, Cibacron Blue F3GA (known to bind human alpha 1 B-glycoprotein). 3. Two new alleles in the horse A1B system were found, bringing the total number of alleles to five. No polymorphism was found in the donkey alpha 1 B system. 4. As expected the first 20 N-terminal residues of the donkey and horse proteins are highly conserved with only two differences being found. 5. The polymorphism of the horse alpha 1 B-glycoproteins may be due in part to differing numbers of terminal sialic acid residues and the higher electrophoretic mobility of the donkey alpha 1 B-glycoprotein may be due in part to increased sialylation. 6. The horse and donkey alpha 1 B-glycoproteins exhibited differences in affinity for the dye-ligand, Cibacron Blue F3GA, with the donkey alpha 1 B-glycoprotein not being bound.</article>
</html>
:)
let $uri := "/test.xml"
let $options := map:map()
=>map:with("showRelevance","true")
=>map:with("threshold",.3)
=>map:with("dbName","data-hub-FINAL")
return 
ee:enrich($uri, $options)