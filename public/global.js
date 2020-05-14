var globals = {
  constants: {
    agg_fun: [
      {
        text: "Elementwise mean",
        type: "mean",
        short_text: "mean",
        graphLine: true
      },
      {
        text: "Elementwise std",
        type: "std",
        short_text: "std",
        graphLine: true
      },
      {
        text: "Elementwise max",
        type: "max"
      },
      {
        text: "Elementwise min",
        type: "min"
      },
      {
        text: "Elementwise max-min",
        type: "max_min",
        short_text: "max-min",
        graphLine: true
      },
      {
        text: "Entropy",
        type: "entropy",
        short_text: "entropy",
        graphLine: true
      }
    ],
    colors: [
      "#F9822C",
      "#008b8b",
      "#e33e1a",
      "#bdb76b",
      "#8b008b",
      "#556b2f",
      "#ff8c00",
      "#9932cc",
      "#8b0000",
      "#e9967a",
      "#9400d3",
      "#ff00ff",
      "#ffd700",
      "#008000",
      "#4b0082",
      "#f0e68c",
      "#add8e6",
      "#e0ffff",
      "#90ee90",
      "#d3d3d3",
      "#ffb6c1",
      "#ffffe0",
      "#00ff00",
      "#ff00ff",
      "#800000",
      "#000080",
      "#808000",
      "#ffa500",
      "#ffc0cb",
      "#800080",
      "#800080",
      "#ff0000",
      "#c0c0c0",
      "#ffffff",
      "#ffff00"
    ]
  },
  variables: {
    data: {},
    settings: {
      hilight: {}
    },
    hovered: {
      vectors: {},
      element: null
    },
    svg: {
      axes: {
        x: 0,
        y: 0
      }
    }
  },
  temp: {

  }
}

function switchTabs(el,type) {

  if (!($(el).hasClass("selected"))) {
    $(el).siblings().removeClass("selected");
    $(el).addClass("selected");

    if (type == "text") {
      openTextTab();
    }
    else if (type == "tabular") {
      openTabularTab();
    }
  }
}

function generateFileInput(options, f) {

  var fileDiv = document.createElement("div");
  $(fileDiv).addClass("custom-file "+options.divClass);

  var fileInput = document.createElement("input");
  $(fileInput).addClass("custom-file-input").attr("type","file").attr("id",options.id);
  $(fileDiv).append(fileInput);

  if (options.multiple) {
    $(fileInput).attr("multiple",true);
  }

  $(fileInput).on('change',function(ev) {
    //write file name to window
    var fileName = $(ev.target).val().replace('C:\\fakepath\\', " ");
    $(ev.target).next('.custom-file-label').html(fileName);
    if (f) {
      f(ev);
    }
  });

  var fileLabel = document.createElement("label");
  $(fileLabel).addClass("custom-file-label").attr("for",options.id);
  $(fileLabel).append(options.placeholder);
  $(fileDiv).append(fileLabel);

  return fileDiv;
}

function hexAToRGBA(h) {
  /*let r = 0, g = 0, b = 0, a = 1;

  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return {r: r/255*255, g: g/255*255, b: b/255*255};*/

  h = h.replace('#','');
    r = parseInt(h.substring(0,2), 16);
    g = parseInt(h.substring(2,4), 16);
    b = parseInt(h.substring(4,6), 16);

    result = {r: r, g: g, b: b};
    return result;
}

function readAsText(file,funcs) {
  let reader = new FileReader();
  reader.readAsText(file);
  reader.error = funcs.err;
  reader.onload = function() {
    funcs.onload(reader.result,file.name);
  }
}

function standardDeviation(values){
  var avg = values.reduce((a,b) => a + b, 0)/values.length;

  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = squareDiffs.reduce((a,b) => a + b, 0)/squareDiffs.length;

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function generateColor() {

  var letters = "0123456789ABCDEF";

    // html color code starts with #
    var color = '#';

    // generating 6 times as HTML color code consist
    // of 6 letter or digits
    for (var i = 0; i < 6; i++)
       color += letters[(Math.floor(Math.random() * 16))];
	return color;

};

function switchView(type) {
  $("#main-nav-settings").removeClass("view-graph view-text");
  $("#main-nav-settings").addClass("view-"+type);
  $("#main-content-div").removeClass("view-graph view-text");
  $("#main-content-div").addClass("view-"+type);
}

function createSelect(options) {
  let formGroup = document.createElement("div");
  $(formGroup).addClass("form-group").css("margin-top","10px").css("margin-bottom","0px");
  $(formGroup).append("<label>"+options.text+"</label>");

  let select = document.createElement("select");
  $(select).attr("id",options.id);
  $(select).addClass("form-control");
  $(select).on('change', function(e){
    options.onChange(e);
  });
  $(formGroup).append(select);

  return formGroup;
}
