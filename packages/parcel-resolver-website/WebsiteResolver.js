const { Resolver } = require('@parcel/plugin')
const path = require('path')
const fs = require('fs')

module.exports = new Resolver({
  async resolve({ specifier, options: { projectRoot } }) {

    if(specifier.search(projectRoot) != -1){
      return {
        filePath: specifier
      };
    }
    if (specifier.startsWith('/')) {
      // if specifier conctain query string , replace empty
      specifier = specifier.split("?")[0];
      return {
        filePath: path.join(projectRoot, 'public', specifier)
      };
    }

    return null
  }
})
