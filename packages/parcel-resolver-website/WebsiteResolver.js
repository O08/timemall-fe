const { Resolver } = require('@parcel/plugin')
const path = require('path')
const fs = require('fs')
const {fileURLToPath, pathToFileURL} = require('url');


module.exports = new Resolver({
  async resolve({ specifier, dependency, options: { projectRoot }, logger }) {

    if(specifier.search(projectRoot) != -1){
      return {
        filePath: specifier
      };
    }
    if (specifier.startsWith('/')) {
      // if specifier conctain query string , ignore it
      
      return {
        filePath: path.join(projectRoot, 'public', specifier.split("?")[0]),
        isExcluded: !!specifier.split("?")[1]
      };
    }

    return null
  }
})
