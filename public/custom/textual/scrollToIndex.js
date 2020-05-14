function goToIndexInText(index,length) {
  // remove old bookmark
  var bookmark = document.getElementById("bookmark-pointer");
    if (bookmark) {
    bookmark.remove();
  }

  // Loop through all the text nodes and sum up their lengths, once the sum is bigger than the index, get that node
  let textNode = Array.prototype.find.call($("#plot-text-viewer")[0].childNodes, function(node) {
    if (node.nodeType !== 3) return false;
    if (index >= node.textContent.length) return index -= node.textContent.length, false;
    return true;
  });

  if (!textNode) throw Error("Index out of bounds");

  bookmark = document.createElement("div");
  bookmark.id = "bookmark-pointer";

  // Split the node based on the remaining index and add the bookmark in the middle
  var nextNode = textNode.nextSibling;
  insertBefore(textNode.parentElement, document.createTextNode(textNode.textContent.substring(0, index)), nextNode);
  insertBefore(textNode.parentElement, bookmark, textNode);
  insertBefore(textNode.parentElement, document.createTextNode(textNode.textContent.substring(index)), nextNode);
  textNode.remove();

  // Wait for the changes to be rendered and then scroll to the bookmark
  setTimeout(function() {
    let viewerWidth = $("#plot-text-viewer").width();
    let textWidth = $("#plot-text-viewer")[0].scrollWidth;
    let offset = 0;// = bookmark.offsetLeft-$("#plot-text-viewer")[0].offsetLeft;
    let markerLeft = bookmark.offsetLeft-$("#plot-text-viewer")[0].offsetLeft;
    if (markerLeft+viewerWidth > textWidth) {
      offset = markerLeft;
      markerLeft = offset+viewerWidth-textWidth;
    }
    else if (markerLeft < viewerWidth/2) {
      offset = 0;
    }
    else {
      offset = markerLeft-viewerWidth/2;
      markerLeft = viewerWidth/2;
    }
    $("#plot-text-viewer")[0].scrollTo(offset,0);

    $("#plot-text-viewer-marker").css("left",markerLeft+"px").css("width",length*0.7+"rem");
  }, 0);
}

function insertBefore(parentElement, newNode, referenceNode) {
  if (referenceNode) parentElement.insertBefore(newNode, referenceNode);
  else parentElement.appendChild(newNode);
}
