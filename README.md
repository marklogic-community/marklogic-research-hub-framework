# Research Hub

## Overview
The Research Hub is an extendable application for loading entities and providing a UI for searching and viewing the data for them. It uses DataHub and Entity Services for ingesting and harmonizing, and Grove React for the front end.

## Resources
Home page on wiki: https://wiki.marklogic.com/display/SE/Research+Hub (overview, video, tutorial)

Slack channel: https://app.slack.com/client/TCL99750R/CTJHR7VQ9 #research-hub (questions, feedback)

Bitbucket Repo: https://project.marklogic.com/repo/projects/INT/repos/research-hub/browse (code, README files)

Bugs: https://project.marklogic.com/jira/projects/GRH/issues (submit bug, read open bugs)

## Getting Started
There are two main steps to use this application:
1. Install Research Hub
2. Install the domain you want to use (found in the examples directory or create your own)

## 1. Install Research Hub
#### Prerequites
1. MarkLogic 9.0-11 or 10.0-3
2. DataHub 5.1.0 (included)
3. Java 8+ (used for running QuickStart and gradle-wrapper)
4. Node 10 or 12
5. Optionally Docker Desktop if you want/need to run MarkLogic inside a container

#### 1.1 Prepare local environment

It is recommended to use the default ports, DB names, and App Server names defined in the **gradle.properties** file.  Use our pre-configured Docker setup if you have conflicts with your local MarkLogic instance.

See [**docker/DOCKER.md**](docker/DOCKER.md) for details.

#### 1.2 Deploy DHF

    ./gradlew mlDeploy

### 1.3 Install UI

    cd ui
    npm install

## 2. Install One of the Included Examples
Two examples are included in this code base. By copying these example files into the main code area, and modifying some core files, you will be installing a fully-functional Research Hub. These are included to provide sample code and patterns for building your own research hubs.

A gradle "install" task is included in each example sub-directory to automate much of this process. The manual steps are documented in the README.md in each example sub-directory.

These two example domains are pharma-research and person-position. They include different datasets, models, flows, and UI components.

To install one of the example domains, follow the README.md file in that example sub-directory, which are included in this codebase.

### Building your own entity
You can create your own entity by running a gradle command to scaffold the files you need.

run
./gradlew createEntity -PentityName=YourEntityName

The task will create the necessary files and print out their locations for you to go edit.

### Deleting a scaffolded entity
If for some reason you need to delete an entity that you scaffolded, simply run this command.
run

./gradlew deleteEntity -PentityName=YourEntityName

### Building your own concept
You can create your own concept by running a gradle command to scaffold the files you need.

run
./gradlew createConcept -PconceptName=YourConceptName

The task will create the necessary files and print out their locations for you to go edit.

### Deleting a scaffolded concept
If for some reason you need to delete a concept that you scaffolded, simply run this command.
run

./gradlew deleteConcept -PconceptName=YourConceptName

The task will create the necessary files and print out their locations for you to go edit.

## Running the UI
After installing Research Hub and a domain, you can start the ui using:

    cd ui
    npm start

## Running Tests
After installing Research Hub and a domain, you can run any tests that were created by going to http://localhost:8015/test/ (or http://localhost:8115/test/ if using our Docker setup), and using the UI there to run tests.
