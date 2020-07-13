package com.marklogic.grh

import org.gradle.api.tasks.TaskAction
import org.gradle.api.DefaultTask
import groovy.io.FileType

class CreateEntityTask extends DefaultTask {

  @TaskAction
  void createEntity() {
    def propName = "entityName"
    def entityName = project.hasProperty(propName) ? project.property(propName) : null
    if (entityName == null) {
      throw new Exception("Entity name is required")
    }
    def entityDir = new File("${project.projectDir}/buildSrc/src/main/resources/stubs")
    def absEntityDir = entityDir.getAbsolutePath()
    def targetDir = project.projectDir.getAbsolutePath()

    println("Creating files:")
    entityDir.traverse(type: FileType.FILES, maxDepth: -1) {
      if (!it.name.equals(".DS_Store") && !it.getAbsolutePath().contains("concept")) {

        def dest = it.getAbsolutePath().replace(absEntityDir, targetDir).replace("stub", entityName.toLowerCase()).replace("Stub", entityName)
        def contents = it.text
        contents = contents.replace("stub", entityName.toLowerCase()).replace("Stub", entityName)
        def destFile = new File(dest)
        new File(destFile.getParent()).mkdirs()
        destFile.write(contents)
        println(dest);
      }
    };

  }
}
