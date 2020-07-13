package com.marklogic.grh

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction
import groovy.io.FileType

class DoctorTask extends DefaultTask {
    def getUIEntities() {
        def dir = new File("${project.projectDir}/ui/ui/src/entity")
        def entities = []
        dir.traverse(type: FileType.DIRECTORIES, maxDepth: 0) { entities.add(it.name) };
        return entities.collect { it.toLowerCase() }
    }

    def getSearchOptions() {
        def dir = new File("${project.projectDir}/src/main/ml-modules/options")
        def options = []
        dir.traverse(type: FileType.FILES, maxDepth: 0) { options.add(it.name) };
        return options.collect { it.replace(".xml", "").toLowerCase() }
    }

    def getEntityNames() {
        def dir = new File("${project.projectDir}/entities")
        def entityNames = []
        dir.traverse(type: FileType.FILES, maxDepth: 0) { if (it.name.endsWith(".json")) { entityNames.add(it.name) } };
        return entityNames.collect { it.replace(".entity.json", "").toLowerCase() }
    }

    @TaskAction
    def taskAction() {
        def hubEntities = getEntityNames()
        def uiEntities = getUIEntities()
        def searchOptions = getSearchOptions()

        println("\n")
        println("**************************************************************")
        println("* GRH DOCTOR: 👩‍⚕️ The doctor is checking your GRH Health....  *")
        println("**************************************************************")

        def missingSearchOptions = hubEntities.minus(searchOptions)
        if (missingSearchOptions.size() > 0) {
            println("\n")
            println("**************************************************************")
            println("* WARNING: The following entities are missing Search options *")
            println("**************************************************************")
            missingSearchOptions.forEach { println("\t${it}") }
            println("\nTo fix this issue, create the following files:")
            missingSearchOptions.forEach { println("\t${project.projectDir}/src/main/ml-modules/options/${it}.xml") }
            println("\n")
        }

        def missingUiEntities = hubEntities.minus(uiEntities)
        if (missingUiEntities.size() > 0) {
            println("\n")
            println("**************************************************************")
            println("* WARNING: The following entities are missing UI Components  *")
            println("**************************************************************")
            missingUiEntities.forEach { println("\t${it}") }
            println("\n")
        }

        if (missingSearchOptions.size() == 0 && missingUiEntities.size() == 0) {
            println("\nNo issues found! 🍎")
        }
    }
}