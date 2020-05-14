function loadTextTab() {

  $("#body-wrapper").addClass("view-text");
  $("#main-nav-settings").html("");

  var form = document.createElement("form");
  $(form).submit(function(event) {
    event.preventDefault();
  });
  $(form).addClass("container")
  $("#main-nav-settings").append(form);

  var fileText = generateFileInput({divClass: "custom-file-text", id: "file-text-input", placeholder: "Choose file ..."}, function(ev) {

    let file = ev.target.files[0];

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = function(e) {

      load_json(JSON.parse(reader.result));

    };

    reader.readAsText(file);
  });

  $(form).append(fileText);

}

function load_json(json) {

  $("#main-content").html("");
  $("#main-nav-settings > form div:not(:first)").remove();

  let probDiv = document.createElement("div");
  $(probDiv).addClass("probability-div");
  $("#main-content").append(probDiv);

  // text viewer for plot
  let textViewer = document.createElement("div");
  $(textViewer).attr("id","plot-text-viewer-wrapper").addClass("view-text-hide");
  $(textViewer).append("<div id='plot-text-viewer-marker'></div><div id='plot-text-viewer'></div>");
  $('#main-content').append(textViewer);

  let textOptions = document.createElement("div");
  $(textOptions).addClass("main-content-text-options");
  $("#main-content").append(textOptions);

  var textDiv = document.createElement("div");
  $(textDiv).attr("id","main-content-text-div")
  $("#main-content").append(textDiv);

  globals.variables.json = json;

  noFiles = json.length;

  if (noFiles > 1) {

    let formGroup = createSelect({text: "Select file to visualize:", id: "file-select", onChange: function(e) {load_file_from_json($(e.target).val());}});
    let select = $(formGroup).find("select");
    $("#main-nav-settings > form").append(formGroup);

    for (var i=0; i<noFiles; i++) {
      let activation_values = json[i].output_activations.map(x=>parseFloat(x.value))
      let maxActivationClass = json[i].output_activations[activation_values.indexOf(Math.max(...activation_values))].name;
      let name = json[i].name || "File "+i;
      if (i == 0)
      $(select).append("<option value='"+i+"' selected>"+name+" ("+maxActivationClass+")</option>");
      else {
        $(select).append("<option value='"+i+"'>"+name+" ("+maxActivationClass+")</option>");
      }
    }

    let formGroupUnderscript = document.createElement("small");
    $(formGroup).append(formGroupUnderscript)
    let formGroupUnderscriptA = document.createElement("a");
    $(formGroupUnderscriptA).attr("href","#");
    $(formGroupUnderscriptA).append("Browse files <i class='fas fa-search'></i>");
    $(formGroupUnderscriptA).click(function() {
      searchByContentModal();
    });
    $(formGroupUnderscript).append(formGroupUnderscriptA);
  }

  let formGroupVisualization = createSelect({
    text: "Select visualization:",
    id: "visualization-select",
    onChange: function(e) {
      let selectedVisualization = $(e.target).val();
      switchView(selectedVisualization);
      if (selectedVisualization == "graph") {
        drawPlot()
      }
      else if (selectedVisualization == "text") {
        draw_text();
      }
    }
  });
  $(formGroupVisualization).css("margin-bottom","10px");

  let selectVisualization = $(formGroupVisualization).find("select");

  $("#main-nav-settings > form").append(formGroupVisualization);

  $(selectVisualization).append("<option value='graph' selected>Aggregation of self-attention</option>");
  $(selectVisualization).append("<option value='text'>Visualization of self-attention</option>");

  let attVectorsLabelDiv = document.createElement("div");
  $("#main-nav-settings > form").append(attVectorsLabelDiv);

  $(attVectorsLabelDiv).append("<label class='view-graph-hide'>Attention vectors</label><label class='view-text-hide'>Plot options</label>");

  let optionsImage = document.createElement("span");
  $(optionsImage).css("float","right");
  $(optionsImage).append('<a href="#" class="actions-a" title="save image"><i class="fas fa-camera"></i></a>');
  $(optionsImage).append('<a id="download-canvas" href="#" download="sequence.png" style="display: none;"></a>	  ')
  $(optionsImage).click(function() {

    let selectedVisualization = $("#visualization-select").val();

    if (selectedVisualization == "graph") {
      // Get the d3js SVG element and save using saveSvgAsPng.js
      saveSvgAsPng($("#seqplot svg")[0], "plot.png", {scale: 2, backgroundColor: "#FFFFFF"});
    }
    else if (selectedVisualization == "text") {
      var x = $("#seqplot").width();
      $('#hidden_div').html("").append($("#seqplot").clone());
      document.getElementById('hidden_div').style.display = "block";

      $("#hidden_div").css('width', x + 'px');

      let download_started = false;

      try{
        html2canvas(document.getElementById('hidden_div'), {
          width: x,
          taintTest: false,
          onrendered: function(canvas) {
            if (!(download_started)) {
              $("#download-canvas").prop("href",canvas.toDataURL("image/png"));  // here is the most important part because if you dont replace you will get a DOM 18 exception.;
              document.getElementById('download-canvas').click();
              document.getElementById('hidden_div').style.display = "none";
              document.getElementById('hidden_div').innerHTML = "";
              download_started = true;
            }
          }
        });
      }
      catch(e) {console.log(e);}
    }
  })
  $(attVectorsLabelDiv).append(optionsImage);

  let aDownload = document.createElement("a");
  $(aDownload).append('<i class="fas fa-download"></i>');
  $(aDownload).attr("href","#").addClass("actions-a").css("float","right").attr("title","download current state as json");
  $(aDownload).click(function() {
    $("<a />", {
      "download": "data.json",
      "href" : "data:application/json," + encodeURIComponent(JSON.stringify(globals.variables.json))
    }).appendTo("body")
    .click(function() {
       $(this).remove()
    })[0].click()
  })
  $(attVectorsLabelDiv).append(aDownload);

  var vectors = document.createElement("div");
  $(vectors).attr("id","main-nav-att-vectors");
  $(vectors).addClass("view-graph-hide");
  $("#main-nav-settings > form").append(vectors);

  let graphOptions = document.createElement("div");
  $(graphOptions).attr("id","main-nav-graph-options");
  $(graphOptions).addClass("view-text-hide");
  $("#main-nav-settings > form").append(graphOptions);

  var seqview = document.createElement("div");
  $(seqview).attr("id","seqplot").attr("style","font-size: 19px; text-align: center;");
  $('#main-content-text-div').html("").append(seqview);

  let selectedVisualization = $("#visualization-select").val();
  switchView(selectedVisualization);
  load_file_from_json(0);
}

function load_file_from_json(index) {

  let file = globals.variables.json[index];
  let charToVectors = {};
  for (var i=0; i<file.text.length; i++) {
    charToVectors[i] = {};
  }

  globals.variables.data = {text: file.text, attentionVectors: {}, charToVectors: charToVectors, output_activations: file.output_activations, json_id_to_variables_id: []}

  $("#main-nav-att-vectors").html("");
  $("#main-nav-graph-options").html("");
  $(".probability-div").html("");
  $("#plot-text-viewer").html(file.text);
  drawClassProb();

  let formGroup = createSelect({
    text: "Select set:",
    id: "set-select",
    onChange: function(e) {
      drawPlot();
    }
  });
  let select = $(formGroup).find("select");

  for (var i=0; i<file.sets.length; i++) {

    let name = file.sets[i].name;
    if (name == undefined) {
      name = "Set "+i;
      globals.variables.json[index].sets[i].name = name;
    }
    globals.variables.data.json_id_to_variables_id.push(i);

    addNewToken(name,{file: index, id: i}); // for text settings

    // for graph options
    if (i == 0)
    $(select).append("<option value='"+i+"' selected>"+name+"</option>");
    else {
      $(select).append("<option value='"+i+"'>"+name+"</option>");
    }
  }

  if (file.sets.length > 1) {
    $("#main-nav-graph-options").append(formGroup);
  }

  let formGroupAggType = createSelect({
    text: "Aggregate to display:",
    id: "agg-select",
    onChange: function(e) {
      drawPlot();
    }
  });

  let selectAggType = $(formGroupAggType).find("select");

  for (let i=0; i<globals.constants.agg_fun.length; i++) {
    if (globals.constants.agg_fun[i].graphLine) {
      let name = globals.constants.agg_fun[i].text;
      if (i == 0) {
        $(selectAggType).append("<option value='"+i+"' selected>"+name+"</option>");
      }
      else {
        $(selectAggType).append("<option value='"+i+"'>"+name+"</option>");
      }
    }
  }
  $("#main-nav-graph-options").append(formGroupAggType);

  let formGroupScaleType = createSelect({
    text: "Choose scale for attention value axe: <i class='far fa-question-circle' title = 'On a linear scale, a change between two values is perceived on the basis of the difference between the values. On a logarithmic scale, a change between two values is perceived on the basis of the ratio of the two values (used when differences between values are small)'></i>",
    id: "scale-select",
    onChange: function(e) {
      drawPlot();
    }
  });

  let selectScaleType = $(formGroupScaleType).find("select");

  $(selectScaleType).append("<option value='log' selected>Logarithmic scale</option>");
  $(selectScaleType).append("<option value='lin'>Linear scale</option>");

  $("#main-nav-graph-options").append(formGroupScaleType);

  let selectedVisualization = $("#visualization-select").val();

  if (selectedVisualization == "graph") {
    drawPlot()
  }
  else if (selectedVisualization == "text") {
    draw_text();
  }

}

function addNewToken(name,token) {

  processTokenData(token)

  let id = token.id;
  let dom_id = "token-"+id;

  let aDiv = document.createElement("div");
  $(aDiv).addClass("token-item");
  $("#main-nav-att-vectors").append(aDiv);

  let a = document.createElement("a");
  $(a).addClass("list-item active");
  $(a).attr("data-toggle","collapse").attr("aria-expanded","true").attr("href","#"+dom_id);
  $(a).append("<i class='fas fa-chevron-down'></i>"+name);
  $(a).click(function() {
    $(this).toggleClass("active");
    $(this).find("i.fas").toggleClass('fa-chevron-right').toggleClass('fa-chevron-down');
  })
  $(aDiv).append(a);

  let aOptions = document.createElement("div");
  $(aOptions).addClass("list-item-options settings");
  $(aDiv).append(aOptions);

  let aOptionsAgg = document.createElement("span");
  $(aOptionsAgg).attr("data-toggle","popover");
  $(aOptionsAgg).append("<i class='fas fa-server'></i>");
  $(aOptionsAgg).popover({
    html: true,
    content: fillAggOptions(aOptionsAgg,token)
  });

  $(aOptions).append(aOptionsAgg);

  let aOptionsHide = document.createElement("span");
  if (globals.variables.data.attentionVectors[id].visible) {
    $(aOptionsHide).append('<i class="fas fa-eye"></i>');
  }
  else {
    $(aOptionsHide).append('<i class="fas fa-eye-slash"></i>');
  }
  $(aOptionsHide).click(function() {
    $(this).find("i").toggleClass("fa-eye").toggleClass("fa-eye-slash");
    globals.variables.data.attentionVectors[id].visible = !(globals.variables.data.attentionVectors[id].visible);

    let json_id = get_json_id({token_id: id});

    if (json_id.token > -1) {
      globals.variables.json[token.file].sets[json_id.token].visible = globals.variables.data.attentionVectors[id].visible;
    }

    $("#"+dom_id).toggleClass("unselected");
    draw_text();
  })
  $(aOptions).append(aOptionsHide);

  let aOptionsRemove = document.createElement("span");
  $(aOptionsRemove).append("<i class='fas fa-times'></i>");
  $(aOptionsRemove).click(function() {
    delete globals.variables.data.attentionVectors[id];

    for (var key in globals.variables.data.charToVectors) {
      delete globals.variables.data.charToVectors[key][id];
    }

    let json_id = get_json_id({token_id: id});

    if (json_id.token > -1) {
      globals.variables.json[token.file].sets.splice(json_id.token,1);
      globals.variables.data.json_id_to_variables_id.splice(json_id.token,1);
    }

    $(this).closest("div.token-item").remove();
    $("#"+dom_id).remove();
    draw_text();
  });
  $(aOptions).append(aOptionsRemove);

  let aContent = document.createElement("div");
  $(aContent).addClass("list-item-content collapse show");
  if (globals.variables.data.attentionVectors[id].visible == false) {
    $(aContent).addClass("unselected");
  }
  $(aContent).attr("id",dom_id);
  $("#main-nav-att-vectors").append(aContent);

  let table = document.createElement("table");
  $(aContent).append(table);

  let tbody = document.createElement("tbody");
  $(tbody).addClass("ui-sortable att-vectors-tbody");
  $(table).append(tbody)

  if (globals.variables.json[token.file].hilight) {
    let ids = globals.variables.json[token.file].hilight;
    let block_id = globals.variables.data.json_id_to_variables_id[ids.block];
    let vector_id = globals.variables.data.attentionVectors[block_id].json_id_to_variables_id[ids.vectors];
    globals.variables.settings.hilight = {block: block_id, vectors: vector_id};
  }

  for (let att_vector_id in globals.variables.data.attentionVectors[id].vectors) {
    processAttentionVectors(tbody,att_vector_id,id,token);
  }

  let selectedVisualization = $("#visualization-select").val();
  if (selectedVisualization == "text") {
    draw_text();
  }
}

function processTokenData(token) {

  let tokenInfo = globals.variables.json[token.file].sets[token.id];
  let token_id = token.id;
  let token_name = tokenInfo.name || token_id;
  let token_visible = !(tokenInfo.visible == false);

  globals.variables.data.charToVectors = {};
  globals.variables.data.attentionVectors[token_id] = {name: token_name, vectors: {}, visible: token_visible, json_id_to_variables_id: []};

  let tokens = tokenInfo.tokens;

  let text = globals.variables.data.text;
  let startIndex = 0;
  let temp_tokens = [];

  for (var j=0; j<tokens.length; j++) {

    let index = text.indexOf(tokens[j]);
    temp_tokens.push({
      text: tokens[j],
      length: tokens[j].length,
      start: startIndex+index
    })
    for (var c=0; c<tokens[j].length; c++) {
      if (!(globals.variables.data.charToVectors.hasOwnProperty(startIndex+index+c))) {
        globals.variables.data.charToVectors[startIndex+index+c] = {};
      }
      globals.variables.data.charToVectors[startIndex+index+c][token_id] = j;
    }
    text = text.substring(index+tokens[j].length)
    startIndex = startIndex+index+tokens[j].length;
  }


  for (var j=0; j<tokenInfo.attention_vectors.length; j++) {

    let att_vector_id = token_id+"_"+j;

    let suggestedColor = tokenInfo.attention_vectors[j].color;

    if (suggestedColor == undefined) {
      suggestedColor = generateColor();
      globals.variables.json[token.file].sets[token_id].attention_vectors[j].color = suggestedColor;
    }

    let name = tokenInfo.attention_vectors[j].name;

    if (name == undefined) {
      name = "attention_vectors_"+j;
      globals.variables.json[token.file].sets[token_id].attention_vectors[j].name = name;
    }

    globals.variables.data.attentionVectors[token_id].json_id_to_variables_id.push(att_vector_id);

    let attVectors = tokenInfo.attention_vectors[j].vectors;

    let isNumeric = !attVectors.every(isNaN);
    let noVectors = attVectors.length;

    let errNote;
    if (noVectors != tokens.length) {
      errNote = "Vector length not consistent with number of tokens."
    }
    else if (!(isNumeric)) {
      errNote = "Vector contains non-numeric values."
    }

    if (noVectors == tokens.length && isNumeric) {

      let vectors = [];
      for (let k=0; k<temp_tokens.length; k++) {
        let token = temp_tokens[k];
        token.value = parseFloat(attVectors[k]);
        vectors.push(token)
      }

      globals.variables.data.attentionVectors[token_id].vectors[att_vector_id] = {
        vectors: attVectors.map(function(x,idx) {
          let token = {};
          for (key in temp_tokens[idx]) {
            token[key] = temp_tokens[idx][key];
          };
          token.value = parseFloat(x);
          return token;
        }),
        color: tokenInfo.attention_vectors[j].color || suggestedColor,
        name: name,
        visible: !(tokenInfo.attention_vectors[j].visible == false)
      }
    }
  }
}

function load_example() {
  $.getJSON("example.json", function(json) {
    load_json(json); // this will show the info it in firebug console
  });
}

// vsak attention vector ima: name, color, edit, remove in hide/see


function draw_text(){

  let seqview = $("#seqplot");
  $(seqview).html("");

  var conteinerWidth = $("#main-content-text-div").width();
  //var letterPerRow = (Math.floor(((parseInt(conteinerWidth))/12)));
  var letterPerRow = (Math.floor(((parseInt(conteinerWidth-30))/11-2)/10))*10;

  var attentionBlocks = globals.variables.data.attentionVectors;
  var words = globals.variables.data.text.split(/ /g);
  var charToVectors = globals.variables.data.charToVectors;
  //var surf = globals.data.snps.sequence_surf;
  //var start_color = globals.constants.colorScheme.others.start_color;
  //var end_color = globals.constants.colorScheme.others.end_color;

  var numBreaks = 0;
  var lineCounter = 1;
  var legendseq = "";
  var rcount = 0;
  var maxdelay = 0;
  var ccount = 1; // position of char in row
  var index = 0; // index of char in text

  var hilighted = globals.variables.settings.hilight;

  var p = document.createElement("p");
  $(p).addClass("song show-chords");
  $(seqview).append(p);

  for (let block in attentionBlocks) {
    if (attentionBlocks[block].visible) {
      for (let attVector in attentionBlocks[block].vectors) {
        if (attentionBlocks[block].vectors[attVector].visible) {
          numBreaks++;
          let span = document.createElement("span");
          $(span).attr("style","font-weight: bold; position: relative; bottom: -"+((((lineCounter-1)*1.35+0.9)*19)+19*0.7)+"px; display:inline-block; max-width: 0px; overflow-x:visible; font-size: 12px;");
          $(span).append("<div class='side-label'><span>"+attentionBlocks[block].vectors[attVector].name+"</span></div>");
          $(p).append(span)
          lineCounter++;
        }
      }
    }
  }


  numBreaks = Math.floor(numBreaks/1.5);

  $(p).append("<span style='font-size: 12px; padding-right: 30px; font-weight: bold;'>Text:</span>");

  // iterate through obtained PDB entry, map SNPs according to increment, surface is supposed to be OK.

  //NEW CODE
  for (let i=0; i<words.length; i++) {

    var word = words[i];

    //break lines
    if (Math.floor((ccount+word.length)/letterPerRow) > Math.floor((ccount-1)/letterPerRow) && index > 0) { // if new line

      ccount = 0;

      $(p).append("<br><br><br>");
      lineCounter = 1;

      for (let block in attentionBlocks) {

        if (attentionBlocks[block].visible) {
          for (let attVector in attentionBlocks[block].vectors) {
            if (attentionBlocks[block].vectors[attVector].visible) {
              $(p).append("<span style='font-weight: bold; position: relative; bottom: -"+((((lineCounter-1)*1.35+0.9)*19)+19*0.7)+"px; display:inline-block; width: 0; overflow:visible; font-size: 12px;'><div class='side-label'><span>"+attentionBlocks[block].vectors[attVector].name+"</span></div></span>");
              lineCounter++;
            }
          }
        }
      }

      $(p).append("<span style='font-size: 12px; padding-right: 30px; font-weight: bold;'>Text:</span>");

    }

    for (let j=0; j<word.length; j++) {

      let char = word[j];
      let charToVectors_j = charToVectors[index];

      var annotationText = "";

      var value = char;
      var rgba = "";
      var lineCSS = "";
      var lineCounter = 0;

      let charDiv = document.createElement("div");
      $(charDiv).addClass("char-div");
      $(p).append(charDiv);

      let insertTo = p;
      let initSpan = document.createElement("span");

      if (hilighted && hilighted.block != undefined && charToVectors_j[hilighted.block] >= 0) {
        let vectors = attentionBlocks[hilighted.block].vectors[hilighted.vectors].vectors[charToVectors_j[hilighted.block]];
        if (vectors) {
          let rgbaSurface = hexAToRGBA(attentionBlocks[hilighted.block].vectors[hilighted.vectors].color);
          let rgbaHilight = "rgba("+rgbaSurface.r+","+rgbaSurface.g+","+rgbaSurface.b+","+(7*(vectors.value.toFixed(3))/8+0.125)+")";
          $(initSpan).attr("style","background-color: "+rgbaHilight);
        }
      }

      $(initSpan).hover(function() {
        console.log("letter hover")
      })
      $(initSpan).append(value);
      $(charDiv).append(initSpan);

      for (let block in attentionBlocks) {

        if (attentionBlocks[block].visible) {
          for (let attVector in attentionBlocks[block].vectors) {
            if (attentionBlocks[block].vectors[attVector].visible) {

              let span = document.createElement("span");

              if (charToVectors_j != undefined && charToVectors_j[block] != undefined) {

                let vectors = attentionBlocks[block].vectors[attVector].vectors[charToVectors_j[block]];
                var lineheight = (lineCounter)+1;
                var padding = lineCounter*1.35+0.9;
                var percentage = Math.floor(26/(2+padding));
                var rgbaSurface = hexAToRGBA(attentionBlocks[block].vectors[attVector].color);
                let opacityVal = 7*(vectors.value.toFixed(3))/8+0.125;
                rgbaSurface = "rgba("+rgbaSurface.r+","+rgbaSurface.g+","+rgbaSurface.b+","+opacityVal+")";
                $(span).attr("title",attentionBlocks[block].name+"\n"+attentionBlocks[block].vectors[attVector].name+": "+round_decimals(vectors.value));
              }
              else {
                rgbaSurface = "rgba(0,0,0,0)";
              }

              lineCSS = "padding-bottom: "+(lineCounter == 0 ? 0.9*19-4 : (1.35)*19-4)+"px; border-bottom: 4px solid "+rgbaSurface+";";
              $(span).attr("value",attVector).attr("style","font-family:monospace; font-size: 19px; "+rgba+" "+lineCSS+"' data-toggle='tooltip");
              $(charDiv).append(span);
              insertTo = span;

              lineCounter++;
            }
          }
        }
      }

      ccount++;
      index++;
    }

    $(p).append(" ");
    ccount++;
    index++;

  }
}

function textMouseHover(action,index) {

  console.log($(this));
  return;
  console.log(action,key)

  $(".text-index").removeClass("hovered start end");

  var vectors = globals.variables.data.attentionVectors[key].vectors[index];

  var selectString = [];

  for (var i=vectors.start; i<vectors.start+vectors.length; i++) {
    selectString.push(".text-index-"+i);
  }

  var selectedSpans = $(selectString.join(","));

  if (action == "hover") {
    selectedSpans.addClass("hovered");
    $(".text-index-"+vectors.start).addClass("start");
    $(".text-index-"+(vectors.start+vectors.length-1)).addClass("end");
  }
}

function fillAggOptions(popper,token) {

  let div = document.createElement("div");

  let aggOptions = globals.constants.agg_fun;

  for (var i=0; i<aggOptions.length; i++) {
    let subdiv = document.createElement("div");
    $(subdiv).append(aggOptions[i].text);
    $(subdiv).click((function(type) {
      return function() {
        addAggVector(token,type);
        draw_text();
        $(popper).popover("hide");
      }
    })(aggOptions[i].type))
    $(div).append(subdiv);
  }

  // all options
  let subdiv = document.createElement("div");
  $(subdiv).append("All aggregates");
  $(subdiv).click(function() {
    addAggVector(token,"all");
    draw_text();
    $(popper).popover("hide");
  })
  $(div).append(subdiv);

  return div;
}

function addAggVector(token,type) {

  if (type == "all") {
    for (var i=0; i< globals.constants.agg_fun.length; i++) {
      addAggVector(token,globals.constants.agg_fun[i].type)
    }
    return;
  }

  let v = token.id+"_"+type+String(new Date().getMilliseconds());

  let aggVector = calcAggVector(token,type);
  globals.variables.data.attentionVectors[token.id].vectors[v] = aggVector;

  addVectorToJson(token,token.id+"_"+type,aggVector.vectors);
  globals.variables.data.attentionVectors[token.id].json_id_to_variables_id.push(v);
  processAttentionVectors($("#token-"+token.id).find("tbody"),v,token.id,token);
}

function addVectorToJson(token,name,vectors) {
  vectors = vectors.map(x=>x.value);
  globals.variables.json[token.file].sets[token.id].attention_vectors.push({"name": name, "vectors": vectors})
}

function calcAggVector(token,type) {

  let attVectors = globals.variables.data.attentionVectors[token.id].vectors;
  let name = globals.variables.data.attentionVectors[token.id].name

  let aggVector = {};
  aggVector.color = "#"+((1<<24)*Math.random()|0).toString(16);
  aggVector.name = name+"_"+type;
  aggVector.vectors = [];
  aggVector.visible = true;

  for (let vectors in attVectors) {
    if (aggVector.vectors.length == 0) {
      for (let i=0; i<attVectors[vectors].vectors.length; i++) {
        let tempVectorEl = {};

        for (let key in attVectors[vectors].vectors[i]) {
          tempVectorEl[key] = attVectors[vectors].vectors[i][key];
        }

        tempVectorEl.value = [tempVectorEl.value];
        aggVector.vectors.push(tempVectorEl);
      }
    }
    else {
      for (let i=0; i<attVectors[vectors].vectors.length; i++) {
        aggVector.vectors[i].value.push(attVectors[vectors].vectors[i].value);
      }
    }
  }

  for (let i=0; i<aggVector.vectors.length; i++) {
    let newValue;
    if (type == "mean") {
      newValue = aggVector.vectors[i].value.reduce((a,b) => a + b, 0)/aggVector.vectors[i].value.length;
    }
    else if (type == "std") {
      newValue = standardDeviation(aggVector.vectors[i].value);
    }
    else if (type == "min") {
      newValue = Math.min(...aggVector.vectors[i].value);
    }
    else if (type == "max") {
      newValue = Math.max(...aggVector.vectors[i].value);
    }
    else if (type == "max_min") {
      newValue = Math.max(...aggVector.vectors[i].value) - Math.min(...aggVector.vectors[i].value);
    }
    else if (type == "entropy") {
      let occ = count_occurances(aggVector.vectors[i].value);
      let H = 0;
      for (let key in occ.occ) {
        let P = occ.occ[key]/occ.total;
        H += P*Math.log(P);
      }
      newValue = -H/Object.keys(occ.occ).length;
    }
    aggVector.vectors[i].value = newValue;
  }

  return aggVector;

  function count_occurances(arr) {
    let occ = {};
    let total = 0;
    for (var i=0; i<arr.length; i++) {
      let val = Math.floor(arr[i]* 100) / 100
      if (occ[val]) {
        occ[val]++;
      }
      else {
        occ[val] = 1;
      }
      total++;
    }

    return {occ: occ, total: total};
  }
}

function processAttentionVectors(tbody,v,id,token) {

  let json_id = get_json_id({token_id: id, vector_id: v});

  let hilighted = globals.variables.settings.hilight;
  let isHilighted = hilighted.block == id && hilighted.vectors == v;

  addAttVectorsToList(tbody, {
    name: {
      name: globals.variables.data.attentionVectors[id].vectors[v].name,
      enterConfirm: true,
      keyup: function(e,newName) {
        globals.variables.data.attentionVectors[id].vectors[v].name = newName;

        globals.variables.json[token.file].sets[json_id.token].attention_vectors[json_id.vector].name = newName;

        draw_text();
      }
    },
    hilight: {
      id: v,
      hilight: isHilighted,
      click: function() {
        let active = $(this).hasClass("active");
        $("#main-nav-att-vectors .fa-highlighter").parent("span").removeClass("active");
        if (!(active)) {
          $(this).addClass("active");
          globals.variables.settings.hilight = {block: id, vectors: v};
          globals.variables.json[token.file].hilight = {block: json_id.token, vectors: json_id.vector};
        }
        else {
          globals.variables.settings.hilight = undefined;
          globals.variables.json[token.file].hilight = undefined;
        }

        draw_text();
      }
    },
    visible: {
      id: v,
      visible: globals.variables.data.attentionVectors[id].vectors[v].visible,
      click: function() {
        $(this).toggleClass("visible");
        globals.variables.data.attentionVectors[id].vectors[v].visible = !(globals.variables.data.attentionVectors[id].vectors[v].visible)
        globals.variables.json[token.file].sets[json_id.token].attention_vectors[json_id.vector].visible = globals.variables.data.attentionVectors[id].vectors[v].visible;
        draw_text();
      }
    },
    color: {
      color: globals.variables.data.attentionVectors[id].vectors[v].color,
      change: function(newColor) {
        globals.variables.data.attentionVectors[id].vectors[v].color = newColor;
        globals.variables.json[token.file].sets[json_id.token].attention_vectors[json_id.vector].color = newColor;
        draw_text();
      }
    },
    remove: {
      click: function() {
        $(this).closest("tr").remove();

        for (let i in globals.variables.data.charToVectors) {
          delete globals.variables.data.charToVectors[i][v];
        }

        delete globals.variables.data.attentionVectors[id].vectors[v];

        if (json_id.vector > -1) {
          globals.variables.json[token.file].sets[json_id.token].attention_vectors.splice(json_id.vector, 1);
          globals.variables.data.attentionVectors[id].json_id_to_variables_id.splice(json_id.vector, 1);
        }

        draw_text();
      }
    }
  })

}

function addAttVectorsToList(list,options) {

  var tr = document.createElement("tr");
  $(list).append(tr);

  if (options.name) {
    var nameTd = document.createElement("td");
    $(nameTd).addClass("settings-name");
    $(tr).append(nameTd);

    var nameInput = document.createElement("input");
    $(nameInput).attr("type","text").attr("value",options.name.name).attr("data-default-value",options.name.name);

    if (options.name.keyup) {
      $(nameInput).on('keyup', function (e) {

        let condition = options.name.enterConfirm ? (e.keyCode == 13) : true;

        if (condition) {
          $(this).attr("data-default-value",$(this).val());
          options.name.keyup(e,$(this).val());
        }
      });
    }

    $(nameInput).blur(function() {
      if ($(this).val() != $(this).attr("data-default-value")) {
        $(this).val($(this).attr("data-default-value"));
      }
    });

    $(nameTd).append(nameInput);
  }

  var settingsTd = document.createElement("td");
  $(settingsTd).addClass("settings")
  $(tr).append(settingsTd);

  if (options.hilight) {
    var settingsHilight = document.createElement("span");
    $(settingsHilight).attr("value",options.hilight.id);
    $(settingsHilight).append("<i class='fas fa-highlighter'></i>");
    if (options.hilight.hilight) {
      $(settingsHilight).addClass("active");
    }
    $(settingsHilight).click(options.hilight.click)
    $(settingsTd).append(settingsHilight);
  }

  if (options.visible) {
    var settingVisible = document.createElement("span");
    if (options.visible.visible) {
      $(settingVisible).addClass("visible");
    }
    $(settingVisible).attr("value",options.visible.id);
    $(settingVisible).append('<i class="fas fa-underline"></i>');
    $(settingVisible).click(options.visible.click);
    $(settingsTd).append(settingVisible);
  }

  if (options.errNote) {
    var errSpan = document.createElement("span");
    $(errSpan).append('<i class="fas fa-exclamation-triangle" title="'+options.errNote.note+'"></i>');
    $(settingsTd).append(errSpan);
  }

  if (options.color) {
    var colorPickerWrapper = document.createElement("div");
    $(colorPickerWrapper).addClass("color-picker-wrapper")
    $(settingsTd).append(colorPickerWrapper);

    var colorPicker = document.createElement("input");
    $(colorPicker).attr("type","color").attr("name","favcolor").attr("value",options.color.color);
    $(colorPicker).change(function() {
      $(colorPickerWrapper).css("background-color", $(colorPicker).val());

      if (options.color.change) {
        options.color.change($(colorPicker).val());
      }

    })
    $(colorPickerWrapper).append(colorPicker);
    $(colorPickerWrapper).css("background-color",options.color.color);
  }

  if (options.remove) {
    var settingsRemove = document.createElement("span");
    $(settingsRemove).append('<i class="fas fa-times"></i>');
    $(settingsRemove).click(options.remove.click)
    $(settingsTd).append(settingsRemove);
  }
}

function showClassProbabilities() {
  let classes = globals.variables.data.output_activations;

  let classProb = [];
  let perc = 0;
  let colors = globals.constants.colors;
  let bestClass;
  let bestValue = 0;

  let tabelData = [];

  for (let i=0; i<classes.length; i++) {
    let value = Math.round(parseFloat(classes[i].value)*100*100)/100;
    let name = classes[i].name;
    if (name == undefined) {
      name = "Class "+i;
    }
    let color = colors[i];
    classProb.push(color+" "+perc+"%, "+color+" "+(perc+value)+"%");
    perc = perc+value;
    tabelData.push({name: name, value: value, color: color})
  }

  $("#modal .modal-title").html("Probability of classes -- details");
  $("#modal .modal-body").html("").append("<div style='width: 100%; height: 40px; border-radius: 7px; background: linear-gradient(90deg, "+classProb.join(",")+");'></div>");

  let tableWrapper = document.createElement("div");
  $(tableWrapper).css("width","100%").css("margin-top","20px").css("margin-bottom","20px");
  $("#modal .modal-body").append(tableWrapper);

  let table = document.createElement("table");
  $(table).addClass("table table-striped dataTable").css("width","100%");
  $(table).attr("width","100%");
  $(tableWrapper).append(table);

  $(table).DataTable({
    data: tabelData,
    order: [[ 1, "desc" ]],
    columns: [
      {
        title: "Class name",
        data: "name",
        fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
          $(nTd).html("<i class='fas fa-square' style='color: "+oData.color+";'></i> "+sData)
        }
      },
      {
        title: "Probability (%)",
        data: "value"
      }
    ]
  })

  $("#modal").modal("show");
}

function get_json_id(query) {

  let results = {};
  results.token = globals.variables.data.json_id_to_variables_id.indexOf(query.token_id);
  if (query.vector_id) {
    results.vector = globals.variables.data.attentionVectors[query.token_id].json_id_to_variables_id.indexOf(query.vector_id);
  }

  return results;
}

function drawPlot() {

  let data = []
  let data_other = []

  let tokens = globals.variables.data.attentionVectors;
  let file_index = $("select#file-select").val();
  let token_index = ($("select#set-select").length > 0) ? $("select#set-select").val() : 0;
  let aggMethod = globals.constants.agg_fun[$("select#agg-select").val()];
  let scaleType = $("select#scale-select").val();
  token_index = token_index || Object.keys(tokens)[0];

  let mean = calcAggVector({file: file_index, id: token_index},aggMethod.type);
  let min = calcAggVector({file: file_index, id: token_index},"min");
  let max = calcAggVector({file: file_index, id: token_index},"max");

  let N = mean.vectors.length;

  for (let i=0; i<N; i++) {
    data.push({x: i, index: mean.vectors[i].start, length: mean.vectors[i].length, text: mean.vectors[i].text, min: min.vectors[i].value, max: max.vectors[i].value, mean: mean.vectors[i].value})
  }

  let vectors = tokens[token_index].vectors;

  for (let vector_name in vectors) {
    let vector = vectors[vector_name].vectors;
    for (let i=0; i<vector.length; i++) {
      data_other.push({x: i, y: vector[i].value})
    }
  }

  let plotDiv = document.createElement("div");
  $(plotDiv).css("width","100%");
  $("#seqplot").html("").append(plotDiv);

  let w = $(plotDiv).width();
  let h = Math.round(2/3*w);

  $(plotDiv).css("width",w).css("height",h);

  let margin = {top: 20, right: 20, bottom: 30, left: 50};

  let x = d3.scaleLinear()
  .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)]).nice()
  .range([margin.left, w - margin.right])

  let y;
  if (scaleType == "log") {
    y = d3.scaleLog()
    .domain([d3.min(data, d => d.min), 1]).nice()
    .range([h - margin.bottom, margin.top])
  }
  else if (scaleType == "lin") {
    y = d3.scaleLinear()
    .domain([0, 1]).nice()
    .range([h - margin.bottom, margin.top])
  }

  let xAxis = g => g
  .attr("transform", `translate(0,${h - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(w / 80).tickSizeOuter(0))

  let yAxis = g => g
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y))
  .call(g => g.select(".domain").remove())
  .call(g => g.select(".tick:last-of-type text").clone()
  .attr("x", 3)
  .attr("text-anchor", "start")
  .attr("font-weight", "bold")
  .text(data.y))

  let line = d3.line()
  .x(function(d) {return x(d.x)})
  .y(function(d) {return y(d.mean)})

  let hover = function(svg, path) {
    svg
    .style("position", "relative");

    if ("ontouchstart" in document) svg
    .style("-webkit-tap-highlight-color", "transparent")
    .on("touchmove", moved)
    .on("touchstart", entered)
    .on("touchend", left)
    else svg
    .on("mousemove", moved)
    .on("mouseenter", entered)
    .on("mouseleave", left);

    const dot = svg.append("g")
    .attr("display", "none");

    dot.append("rect")
    .attr("fill","white")
    .attr("stroke","gray")

    dot.append("circle")
    .attr("r", 2.5);

    dot.append("text")
    .style("font", "16px sans-serif")
    .style("font-weight", "bold")
    .attr("y",5)
    //.attr("text-anchor", "middle")

    function moved() {

      let xx = d3.map(data, function(d){return(d.x)}).keys();
      d3.event.preventDefault();
      const ym = y.invert(d3.event.layerY);
      const xm = x.invert(d3.event.layerX);
      const i1 = d3.bisectLeft(xx, xm, 1);
      const i0 = i1 - 1;
      const i = xm - xx[i0] > xx[i1] - xm ? i1 : i0;
      const s = data[i];
      if (i > xx.length/2) {
        dot.select("text").attr("text-anchor", "end");
      }
      else {
        dot.select("text").attr("text-anchor", "start");
      }
      //console.log(s)
      goToIndexInText(s.index,s.length)

      //path.attr("stroke", d => d === s ? d.color : "#ddd").filter(d => d === s).raise();
      dot.attr("transform", `translate(${x(s.x)},${y(s.mean)})`);
      dot.select("text").html("<tspan x='0' dy='1.2em'></tspan><tspan x='0' dy='1.2em'>Text: "+s.text+"</tspan><tspan x='0' dy='1.2em'>"+aggMethod.short_text+": "+round_decimals(s.mean)+"</tspan><tspan x='0' dy='1.2em'>min: "+round_decimals(s.min)+"</tspan><tspan x='0' dy='1.2em'>max: "+round_decimals(s.max)+"</tspan>");
      let bbox = dot.select("text").node().getBBox();
      dot.select("rect").attr("width",bbox.width+10).attr("height",bbox.height+10).attr("x",bbox.x-5).attr("y",bbox.y-5)
    }

    function entered() {
      //path.style("mix-blend-mode", null).attr("stroke", "#ddd");
      dot.attr("display", null);
    }

    function left() {
      //path.style("mix-blend-mode", "multiply").attr("stroke", "blue");
      dot.attr("display", "none");
    }
  }

  globals.variables.svg.addPlotMarker = function(info) {
    let aa = parseInt(info[0].slice(3));

    let lineMarker = svg.append("g");
    lineMarker.append("line")
    .attr("x1",x(aa))
    .attr("x2",x(aa))
    .attr("y1",y.range()[0])
    .attr("y2",y.range()[1])
    .attr("stroke","gray")
    .attr("stroke-width",2);
    $(lineMarker.node()).addClass("plot-marker");

    for (let j=0; j<globals.constants.columns.length; j++) {
      let column = globals.constants.columns[j];
      if (column.plot) {
        let marker = svg.append("g");
        $(marker.node()).addClass("plot-marker");
        marker.append("circle")
        .attr("r",3.5)
        marker.append("text")
        .style("font", "12px sans-serif")
        .style("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("y", -8)
        marker.select("text").text(column.name+" for "+info[0]+" is "+info[j]);
        marker.attr("transform", `translate(${x(aa)},${y(info[j])})`);
      }
    }
  }

  const svg = d3.create("svg")
  .attr("viewBox", [0, 0, w, h+5]);

  svg.append("g")
  .call(xAxis);

  svg.append("text")
    .attr("transform",
    "translate(" + (w/2) + " ," +
    (h+5) + ")")
    .style("text-anchor", "middle")
    .text("Token index");

  svg.append("g")
  .call(yAxis);

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 )
      .attr("x",0 - (h / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(((scaleType == "log") ? "log of" : "")+"attention value");

  const scatter_other = svg.append("g")
      .selectAll("dot")
      .data(data_other)
      .enter()
      .append("circle")
      .attr("class", function(d) {return "dot dot_other"})
      .attr("cx", function (d) { return x(d.x); } )
      .attr("cy", function (d) { return y(d.y); } )
      .attr("r", 1.5)
      .style("fill", d => "gray")
      .style("opacity",0.5)

  const path = svg.append("path")
  .attr("fill", "none")
//  .selectAll("path")
  .attr("stroke-width", 2)
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
//  .join("path")
  //.style("mix-blend-mode", "multiply")
  .attr("d", line(data))
  .attr("stroke", "#F9822C")

  const scatter_min = svg.append("g")
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", function(d) {return "dot dot_"+d.counter})
  .attr("cx", function (d) { return x(d.x); } )
  .attr("cy", function (d) { return y(d.min); } )
  .attr("r", 2)
  .style("fill", d => "red")

  const scatter_max = svg.append("g")
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", function(d) {return "dot dot_"+d.counter})
  .attr("cx", function (d) { return x(d.x); } )
  .attr("cy", function (d) { return y(d.max); } )
  .attr("r", 2)
  .style("fill", d => "red")

  const legend = svg.append("g").attr("width","100").attr("transform","translate("+(w-100)+","+(h-100)+")")

  legend.append("rect").attr("fill", "white").attr("width","100").attr("x",0).attr("y",0)

  legend.append("rect").attr("fill", "#F9822C").attr("width","12").attr("height",4).attr("x",0).attr("y",0)
  legend.append("circle").attr("cx",6).attr("cy",20).attr("r", 4).style("fill", "red")
  legend.append("circle").attr("cx",6).attr("cy",40).attr("r", 3).style("fill", "gray").style("opacity",0.5)
  legend.append("text").attr("x", 26).attr("y", 7).text(aggMethod.short_text).style("font-size", "15px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 26).attr("y", 25).text("extreme").style("font-size", "15px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 26).attr("y", 45).text("other").style("font-size", "15px").attr("alignment-baseline","middle")

  svg.call(hover, path);

  $(plotDiv).append(svg.node());
}

function drawClassProb() {

  let classProbDiv = $(".probability-div");

  let classProb = [];
  let perc = 0;
  let classes = globals.variables.data.output_activations
  let colors = globals.constants.colors;
  let bestClass;
  let bestValue = 0;
  let bestColor;
  for (let i=0; i<classes.length; i++) {
    let value = Math.round(parseFloat(classes[i].value)*100*100)/100;
    let name = classes[i].name;

    if (name == undefined) {
      name = "Class "+i;
    }
    if (value > bestValue) {
      bestClass = name;
      bestValue = value;
      bestColor = colors[i];
    }
    classProb.push(colors[i]+" "+perc+"%, "+colors[i]+" "+(perc+value)+"%");
    perc = perc+value;
  }

  $(classProbDiv).append("<div style='width: 100%; height: 40px; border-radius: 7px; background: linear-gradient(90deg, "+classProb.join(",")+");'></div>")
  $(classProbDiv).append("<div style='font-size: initial;'>Class with the highest probability of <span class='bold-text'>"+bestValue+"%</span> is <span class='bold-text'><i class='fas fa-square' style='color: "+bestColor+"'></i> "+bestClass+"</span>.<a href='#' style='float: right;' onclick='showClassProbabilities();'>Details</a></div>")
}

function round_decimals(n,d) {
  d = d || 3
  return Math.round(parseFloat(n)*Math.pow(10,d))/(Math.pow(10,d))
}

function searchByContentModal() {

  let json = globals.variables.json;
  let data = [];

  for (let i=0; i<json.length; i++) {
    let activation_values = json[i].output_activations.map(x=>parseFloat(x.value))
    let maxActivationClass = json[i].output_activations[activation_values.indexOf(Math.max(...activation_values))].name;
    let name = json[i].name || "File "+i;
    data.push({name: name, text: json[i].text, class: maxActivationClass, index: i})
  }

  let table = document.createElement("table");
  $(table).addClass("table table-striped dataTable").css("width","100%");
  $(table).attr("width","100%");
  $("#modal .modal-body").html("").append(table);

  let dataTable = $(table).DataTable({
    data: data,
    //order: [[ 1, "desc" ]],
    columns: [
      {
        title: "File name",
        data: "name",
        type: "html-num",
        fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
          let aSelect = document.createElement("a");
          $(aSelect).attr("href","#");
          $(aSelect).append("Select this file");
          $(aSelect).click(function() {
            $("#file-select").val(oData.index)
            load_file_from_json(oData.index);
            $("#modal").modal("hide");
          })
          $(nTd).html(sData+"<br>").append(aSelect);
        }
      },
      {
        title: "Highest probability class",
        data: "class"
      },
      {
        title: "Content",
        data: "text",
        fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
          $(nTd).html("<div style='max-height: 100px; overflow-y: auto;'>"+sData+"</div>")
        }
      }
    ]
  });

  dataTable.on( 'draw', function () {
    var body = $( dataTable.table().body() );

    body.unhighlight();
    body.highlight( dataTable.search() );
  } );

  $("#modal .modal-title").html("Browse files");
  $("#modal").modal("show");

}
