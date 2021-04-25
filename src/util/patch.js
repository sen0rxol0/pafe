const mergePatch = (
  target,
  patch
) => {
  if (typeof patch === 'object') {
    if (typeof target !== 'object') {
      target = {};
    }
    for (const [key, value] of Object.entries(patch)) {
      if (!value && target.hasOwnProperty(key)){
        // remove the Name/Value pair from Target
        delete target[key];
      } else {
        // Target[Name] = MergePatch(Target[Name], Value)
        target[key] = mergePatch(target[key], value);
      }
    }
    return target;
  } else {
    return patch;
  }
}

// const generatePatchMerge = () => {}
exports.mergePatch = mergePatch;
