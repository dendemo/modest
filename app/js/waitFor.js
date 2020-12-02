function waitFor({
  assets,
  callback
}) {
  let arrayOfAssets = [],
    flag;
  //Turn any arguments into an array (if it's not an array yet)
  if (!Array.isArray(assets)) assets = [assets];
  if (!Array.isArray(callback)) callback = [callback];
  //Turn all assets into single array
  assets.forEach(item => {
  	//Only DOM nodes are expected
    if (typeof item != 'object') return;

    let string = Object.prototype.toString.call(item);

    if (string === '[object NodeList]' || string === '[object HTMLCollection]') {
      arrayOfAssets = arrayOfAssets.concat(Array.from(item));
      return;
    }

    if (item.nodeType == 1) {
      arrayOfAssets.push(item);
      return;
    }
  });

  flag = arrayOfAssets.length;
  //There are no any assets passed to the function, so no need to procceed
  if (!flag) return;

  function checkLoaded() {
  	//Check if it's time to fire a callback
    if (--flag) return;
    //Invoke callback just after the last loaded asset
    callback.forEach(func => func())
  }

  arrayOfAssets.forEach(item => {
  	//If asset is loaded before script (cached or just fast connection)
    if (item.complete) {
      checkLoaded();
      return;
    }

    item.addEventListener('load', () => {
      checkLoaded();
    });

    item.addEventListener('error', () => {
      checkLoaded();
    });
  });
}

export { waitFor as default };