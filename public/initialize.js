function onLoad() {

  loadTextTab();
  loadHomeContent();

  $( window ).resize(function() {

    let selectedVisualization = $("#visualization-select").val();

    if ($("#seqplot").length > 0) {
      if (selectedVisualization == "text") {
        draw_text();
      }
      else if (selectedVisualization == "graph") {
        drawPlot();
      }
    }
  });
}
