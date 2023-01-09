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

Add to /gradle.properties a line to merge pharma-research indexes with the base final database configuration:

  `mlConfigPaths=src/main/ml-config,examples/pharma-research/src/main/ml-config`

This line will include the indexes defined in the `examples\pharma-research\src\main\ml-config\databases\final-database.json` file to the base version of the final database defined in `src\main\ml-config\databases\final-database.json`.

### 1. Deploy DHF

  `./gradlew mlDeploy`

NOTE: After you do mlDeploy or mlRedeploy, Please make sure you do ./gradlew mlLoadModules as we determined some issue with SMT on Dave's local environment

Alternatively, download the DHF QuickStart and run start.sh

**Do not run any flows until at least one ontology has been deployed and processed**

### 2.1 Deploy vocab ontologies

Currently only the RxNorm ontology and a sample omopcdm ontology are included in the `data/ontologies` directory of this source code. If needed, links to the latest version may be found via the [wiki](https://wiki.marklogic.com/pages/viewpage.action?spaceKey=SAL&title=Open+Datasets)

Each ontology needs to be named and placed in a folder of the same name within the `data/ontologies` directory of this source code.

  `./gradlew rpaasDeployOntology -PontologyName=RxNorm`

  `./gradlew rpaasDeployOntology -PontologyName=omopcdm`

### 2.2 Load dev data

**NOTE FOR WINDOWS USERS**
Embedded MLCP is required for many of the following steps. One piece that is required is the winutils.exe tool and an environment variable set so that it can be located by MLCP. It will be necessary to download this tool and place it in a 'bin' directory. Then, set HADOOP_HOME to the parent of the bin directory. For instance, if the tool is located in C:\Projects\mlcp\bin, set HADOOP_HOME to C:\Projects\mlcp with:

`set HADOOP_HOME=C:\Projects\mlcp`

For more information, see [this](https://stackoverflow.com/questions/35652665/java-io-ioexception-could-not-locate-executable-null-bin-winutils-exe-in-the-ha) discussion on stackoverflow.

Run the rpaasDeployTestData job - this contains a set of documents and triples that will allow the dictionary job to work.

  `./gradlew rpaasDeployTestData`

### 3 run the group tasks to ingest and harmonize Study Data

If you want the entire study dataset, run:

  `./gradlew loadStudies`

if you want a subset, override inputPathStudies in properties files to configure which study data set used.

### 4 run the group tasks to ingest and harmonize Drug Data

First, it is necessary to download the full drug label data from the [DailyMed](https://dailymed.nlm.nih.gov/dailymed/spl-resources-all-drug-labels.cfm) website. Unzip the files to $/pharma/data/pharma-research/drugZip

  `./gradlew loadDrugs`

### 5 Run the group tasks to ingest and harmonize Gene Data

  `./gradlew ingestGeneData`

### 6 Run the group tasks to ingest and harmonize Protein Data

  `./gradlew ingestProteinData`

### 7 Run the group tasks to ingest and harmonize a sample Publications and Author

First, download the pubmed xml files from [https://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_bulk/](https://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_bulk/) to $/pharma/data/pharma-research/comm_use_Daily_Med (or another location and update inputPathPubMedCentral variable in your gradle properties file to the correct location).

This will create some simple pubmed and author documents for you. It depends on the enrichment code for the final document for PubMed data:

  `./gradlew loadPubMedCentral`

### 8 Run mastering:

  `./gradlew runSmartMaster`

## UI Application (built with the Grove toolkit)

The UI is contained within `ui/`. The README in that directory has information on how to run it. All listed commands should be run from inside `ui/`.

## Running the Unit tests

To deploy the unit tests, run:

  `./gradlew hubDeployTestResources`

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
