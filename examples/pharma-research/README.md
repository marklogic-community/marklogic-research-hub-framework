# Reference Implementation: Pharma Research

This Reference Implementation serves the purpose of providing an example of how to implement an elaborate example in Research Hub, leveraging Pharma related data.

Installation will require a few manual steps, mostly to put necessary files in place, and to hook them up into the Research Hub code base.

## Installation

### Extracting the distribution
The Research Hub project includes the .../examples/pharma-research subdirectories with this example.

If you do not have it for some reason, you can have someone zip it and send to you. Then unzip the reference into the root folder of your Research Hub project:

- `unzip pharma-research.zip`

This will not install anything yet, just provide you with the necessary files (in the .../examples directory) without harming the existing project.

### Enabling example tasks in Gradle

No action required. The example comes with a build.gradle file of its own, which is included into the main research-hub gradle project automatically. You can verify if it is indeed recognized using:

- `./gradlew projects`

That should print something like:

    Root project 'research-hub'
    \--- Project ':examples'
        \--- Project ':examples:pharma-research'


### Putting the files in place

You can use gradle tasks to pull all files in place:

- `./gradlew examples:install -Pexample=pharma-research`

### Wiring entities into Research Hub

The "install" task copied entire files into the right places. For files where you need to insert lines of code, you need to do that manually.

Edit the following frontend file:

- `ui/ui/src/entity/entityConfig.js`

And add imports for `author, drug, gene, protein, pubblication, study`, and include them in the `export` section. It should look like this:

    import { default as publication } from './publication';
    import { default as author } from './author';
    import { default as drug } from './drug';
    import { default as gene } from './gene';
    import { default as protein } from './protein';
    import { default as study } from './study';

    const entityConfig = {
      publication,
      author,
      drug,
      gene,
      protein,
      study,
    };
    export default entityConfig;

The order of the classes in the exported object is important, as it determines the order of the "uber-facets" on the GUI.

Edit the following frontend file:

- `ui/ui/src/concept/conceptConfig.js`

And add an import for `Skill`, and include it in the `export` section so it looks like this:

    import {default as activeingredient} from './activeingredient';
    import {default as disease} from './disease';
    import {default as institution} from './institution';
    import {default as topic} from './topic';
    import {default as workspace} from './workspace';

    export default {
      activeingredient,
      disease,
      institution,
      topic,
      workspace
    }

### Adding extra properties

Append the contents of `examples/pharma-research/extra-gradle.properties` to `./gradle.properties`. Copy and override some of them for environment specific gradle properties if necessary. In particular, consider running with smaller datasets first, and less threads:

    # Data folder properties
    inputPathStudies=data/smaller/studyData
    inputPathGenes=data/smaller/ncbi_gene/Homo_sapiens.gene_info.tsv.txt

    #loadThreadCount=4
    #harmonizeThreadCount=4

### Adding necessary indexes

Append the following indexes to `src/main/ml-config/databases/final-database.json`:

    "range-element-index": [
      {
        "scalar-type": "int",
        "namespace-uri": "",
        "localname": "NumberOfCitations",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "authorPreferredName",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "institutionPreferredName",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "topicPreferredName",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "date",
        "namespace-uri": "",
        "localname": "lastModifiedDate",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "dateTime",
        "namespace-uri": "",
        "localname": "systemDateTimeCreated",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "journalPreferredName",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "typeOfGene",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "chromosome",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "mapLocation",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "relatedDiseaseNames",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "activeSubstanceNames",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "drugName",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "genericMedicineName",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "family",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "subfamily",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "subsubfamily",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "int",
        "namespace-uri": "",
        "localname": "armCount",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "namespace-uri": "",
        "localname": "armType",
        "collation": "http://marklogic.com/collation/codepoint",
        "range-value-positions": false,
        "invalid-values": "reject"
      }
    ],
    "range-path-index": [
      {
        "scalar-type": "string",
        "collation": "http://marklogic.com/collation/",
        "path-expression": "/matchSummary/URIsToProcess",
        "range-value-positions": true,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "collation": "http://marklogic.com/collation/codepoint",
        "path-expression": "//topicName",
        "range-value-positions": false,
        "invalid-values": "reject"
      },
      {
        "scalar-type": "string",
        "collation": "http://marklogic.com/collation/codepoint",
        "path-expression": "//Protein/drug/name",
        "range-value-positions": false,
        "invalid-values": "reject"
      }
    ]

NOTE: Make sure to append into `range-element-index` and `range-path-index` properties if they already exist!

### 1. Deploy DHF

    ./gradlew mlDeploy

NOTE: After you do mlDeploy or mlRedeploy, Please make sure you do ./gradlew mlLoadModules as we determined some issue with SMT on Dave's local environment

Alternatively, download the DHF QuickStart and run start.sh

**Do not run any flows until at least one ontology has been deployed and processed**

### 2.1 Deploy vocab ontologies

Currently only the RxNorm ontology and a sample omopcdm ontology are included in the `data/ontologies` directory of this source code. If needed, links to the latest version may be found via the [wiki](https://wiki.marklogic.com/pages/viewpage.action?spaceKey=SAL&title=Open+Datasets)

Each ontology needs to be named and placed in a folder of the same name within the `data/ontologies` directory of this source code.

    ./gradlew rpaasDeployOntology -PontologyName=RxNorm

    ./gradlew rpaasDeployOntology -PontologyName=omopcdm

### 2.2 Load dev data

Run the rpaasDeployTestData job - this contains a set of documents and triples that will allow the dictionary job to work.

    ./gradlew rpaasDeployTestData

### 3 run the group tasks to ingest and harmonize Study Data

You have two options. Choose one:

#### 3.1 Test data for development

If you want a small set of data for development, run:

    ./gradlew loadStudiesDev

#### 3.2 Full dataset (huge)

If you want the entire study dataset, run:

    ./gradlew loadStudies

### 4 run the group tasks to ingest and harmonize Drug Data a) or b) depending on OS

    a) ./gradlew loadDrugs for linux/Unix
    b) ./gradlew loadWindowsDrugs for Windows

### 5 Run the group tasks to ingest and harmonize Gene Data

    ./gradlew ingestGeneData

### 6 Run the group tasks to ingest and harmonize Protein Data

    ./gradlew ingestProteinData

### 7 Run the group tasks to ingest and harmonize a sample Publications and Author

This will create some simple pubmed and author documents for you. It depends on the enirchment code for the final document for PubMed data:

    ./gradlew loadPubMedCentral

### 8 Run mastering:

    ./gradlew runSmartMaster

## UI Application (built with the Grove toolkit)

The UI is contained within `ui/`. The README in that directory has information on how to run it. All listed commands should be run from inside `ui/`.

## Running the Unit tests

To deploy the unit tests, run:

    ./gradlew hubDeployTestResources

this will create the HTTP server and database for the unit tests.

## Uninstall

### Manually remove references


Manually edit following files, or revert to a saved or original version:

- `ui/ui/src/entity/entityConfig.js`
- `ui/ui/src/concept/conceptConfig.js`
- `src\main\ml-config\databases\final-database.json`

And remove any reference to 'author', 'drug', 'gene', 'protein', 'publication', 'study`, and 'workspace'.

### Removing example files

Run the following command to get relevant example files removed

- `./gradlew examples:uninstall -Pexample=pharma-research`

### Build and deploy the changes

Use this sequence of commands to deploy all the changes and code to the backend:

- `./gradlew -i mlReloadSchemas`
- `./gradlew -i hubDeployUserArtifacts`
- `./gradlew -i hubDeployUserModules`

To compile and run in development, typically you'd run:

- `cd ui`
- `npm install`
- `npm start`
Note this will launch the app on port 3000, vs a full production build where the default is port 9003

To compile the frontend (necessary for production), you'd run:

- `cd ui`
- `npm run build`
- `cd ..`
