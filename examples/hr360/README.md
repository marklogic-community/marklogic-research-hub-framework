# Reference Implementation: Person - Position matching

This Reference Implementation serves the purpose of providing an example of how to configure new Entities and Flows to load non-Pharma related data into Research Hub, and also shows what minimal changes are required to visualize that data inside the Research Hub UI.

Installation will require a few manual steps, mostly to put necessary files in place, and to hook them up into the Research Hub code base.

## Installation

### Enabling example tasks in Gradle

No action required. The example comes with a build.gradle file of its own, which is included into the main research-hub gradle project automatically. You can verify if it is indeed recognized using:

- `./gradlew projects`

That should print something like:

    Root project 'research-hub'
    \--- Project ':examples'
        \--- Project ':examples:hr360'


### Putting the files in place

You can use gradle tasks to pull all files in place:

- `./gradlew examples:install -Pexample=hr360`

### Wiring entities into Research Hub

Edit the following frontend file:

- `ui/ui/src/entity/entityConfig.js`

And add imports for `person`, and `position`, and include them in the `export` section, so it looks like this:

  import department from './department';
  import employee from './employee';
  import jobopening from './jobopening';
  import jobreview from './jobreview';
  import resume from './resume';

  const entityConfig = {
    department,
    employee,
    jobopening,
    jobreview,
    resume
  };

  export default entityConfig;

The export order is important, as it determines the order of the "uber-facets" on the GUI.

As last, edit the following frontend file:

- `ui/ui/src/conceptConfig.js`

And add an import for `Skill`, and include it in the `export` section so it looks like this:

  import {default as skill} from './skill';
  import {default as workspace} from './workspace';

  export default {
    skill,
    workspace
  }

### Adding necessary indexes

Append the following indexes to `src\main\ml-config\databases\final-database.json`:

    "range-element-index": [
          {
            "scalar-type": "string",
            "namespace-uri": "",
            "localname": "requiredCompetency",
            "collation": "http://marklogic.com/collation/codepoint",
            "range-value-positions": false,
            "invalid-values": "reject"
          },
          {
            "scalar-type": "string",
            "namespace-uri": "",
            "localname": "departmentName",
            "collation": "http://marklogic.com/collation/codepoint",
            "range-value-positions": false,
            "invalid-values": "reject"
          },
          {
            "scalar-type": "string",
            "namespace-uri": "",
            "localname": "location",
            "collation": "http://marklogic.com/collation/codepoint",
            "range-value-positions": false,
            "invalid-values": "reject"
          },
          {
            "scalar-type": "string",
            "namespace-uri": "",
            "localname": "reasonType",
            "collation": "http://marklogic.com/collation/codepoint",
            "range-value-positions": false,
            "invalid-values": "reject"
          },
          {
            "scalar-type": "string",
            "namespace-uri": "",
            "localname": "category",
            "collation": "http://marklogic.com/collation/codepoint",
            "range-value-positions": false,
            "invalid-values": "reject"
          },
          {
            "scalar-type": "string",
            "namespace-uri": "",
            "localname": "languageSkills",
            "collation": "http://marklogic.com/collation/codepoint",
            "range-value-positions": false,
            "invalid-values": "reject"
          },
          {
            "scalar-type": "string",
            "namespace-uri": "",
            "localname": "toolSkills",
            "collation": "http://marklogic.com/collation/codepoint",
            "range-value-positions": false,
            "invalid-values": "reject"
          }
        ]

NOTE: Make sure to append into the `range-element-index` property if it already exists!

### Build and deploy the changes

Use this commands to deploy all the changes and code to the backend:

- `./gradlew -i mlDeploy`

To compile the frontend (necessary for production), you'd run:

- `cd ui`
- `npm run build`
- `cd ..`

### Running data flows

Execute the following task to run the datahub flows for this example:

- `./gradlew -i examples:hr360:runAll`

## Uninstall

### Manually remove references

Manually edit following files, or revert to a saved or original version:

- `ui/ui/src/entity/entityConfig.js`
- `ui/ui/src/concept/conceptConfig.js`
- `src\main\ml-config\databases\final-database.json`

And remove any reference to `person`, `position`, and `skill`.

### Removing example files

Run the following command to get relevant example files removed

- `./gradlew examples:uninstall -Pexample=hr360`

### Build and deploy the changes

Use this sequence of commands to deploy all the changes and code to the backend:

- `./gradlew -i mlUndeploy -Pconfirm=true`

Followed by:

- `./gradlew -i examples:hr360:runAndDeployAll`

To start over from scratch.

To compile and run in development, typically you'd run:

- `cd ui`
- `npm install`
- `npm start`
Note this will launch the app on port 3000, vs a full production build where the default is port 9003

To compile the frontend (necessary for production), you'd run:

- `cd ui`
- `npm run build`
- `cd ..`
