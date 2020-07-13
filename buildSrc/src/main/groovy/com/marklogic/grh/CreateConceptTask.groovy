package com.marklogic.grh

import org.gradle.api.tasks.TaskAction
import org.gradle.api.DefaultTask
import groovy.io.FileType

class CreateConceptTask extends DefaultTask {

  @TaskAction
  void createConcept() {
    def propName = "conceptName"
    def conceptName = project.hasProperty(propName) ? project.property(propName) : null
    if (conceptName == null) {
      throw new Exception("Concept name is required")
    }
    def entityDir = new File("${project.projectDir}/buildSrc/src/main/resources/stubs")
    def absEntityDir = entityDir.getAbsolutePath()
    def targetDir = project.projectDir.getAbsolutePath()

    println("Creating files:")
    entityDir.traverse(type: FileType.FILES, maxDepth: -1) {
      if (!it.name.equals(".DS_Store") && !it.getAbsolutePath().contains("entit") && !it.getAbsolutePath().contains("options")) {

        def dest = it.getAbsolutePath().replace(absEntityDir, targetDir).replace("stub", conceptName.toLowerCase()).replace("Stub", conceptName)
        def contents = it.text
        contents = contents.replace("stub", conceptName.toLowerCase()).replace("Stub", conceptName)
        def destFile = new File(dest)
        new File(destFile.getParent()).mkdirs()
        destFile.write(contents)
        println(dest);
      }
    };

  }
}
