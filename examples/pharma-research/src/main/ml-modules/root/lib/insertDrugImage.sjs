
declareUpdate()

  let finalImageURL = fn.concat((fn.substringBefore(fn.head(id), ".")), "." , "/",zipIndex , "/","jpeg")
  let imageUri = zipFileDetail[zipIndex]
  let zipGet = imageUri.path
  let zipImage = xdmp.zipGet(rawContent, zipGet)
  xdmp.documentInsert(
         finalImageURL, zipImage,{
              permissions : xdmp.defaultPermissions(),
              collections : ["DrugImage"]})
  finalImageURL