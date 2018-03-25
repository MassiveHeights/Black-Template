// Thanks to https://stackoverflow.com/questions/46092308/no-exported-symbols-with-es6-modules-library-compiled-by-closure-compiler/46362739
function unobfuscateSymbol(publicPath, object, objectToExportTo = window) {
  // Same code can be used compiled and not compiled so unobfuscation only in case of obfuscation
  if (unobfuscateSymbol.name !== 'unobfuscateSymbol') {
      const /** Array<string> */ parts = publicPath.split('.');
      let /** Object */ objToExportTo = objectToExportTo;
      let /** string */ part;
      const /** number */ nbOfParts = parts.length;
      for (let /** number */ i = 0; i < nbOfParts; i += 1) {
          part = parts[i];
          if ((i === (nbOfParts - 1)) && object) {
              objToExportTo[part] = object;
          } else if (objectToExportTo[part] && objectToExportTo[part] !== Object.prototype[part]) {
              objToExportTo = objectToExportTo[part];
          } else {
              objToExportTo[part] = {};
              objToExportTo = objToExportTo[part];
          }
      }
  }
}