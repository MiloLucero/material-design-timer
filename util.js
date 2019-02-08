/**
 * Show or hide element(s). Can be used with one or multiple elements, either single nodes or nodeLists.
 * @param {node || nodeList}  nodeList
 */
const show = (...nodeList) => {
  nodeList.forEach((component) => {
    if (component.length) { // If nodeList
      for (let node of component) {
        node.style.display = '';
      }    
    } else { // If single node
      component.style.display = '';
    }
  })
}
const hide = (...nodeList) => {
  nodeList.forEach((component) => {
    if (component.length) { // If nodeList
      for (let node of component) {
        node.style.display = 'none';
      }    
    } else { // If single node
      component.style.display = 'none';
    }
  });
}

/**
 * Adds or removes 'disable' attribute from one or multiple elements.
 * @param  {element || elements}  elements
 */
const disable = (...elements) => {
  for (let element of elements) {
    element.disabled = true;
  }
}
const enable = (...elements) => {
  for (let element of elements) {
    element.disabled = false;
  }
}