function loadHomeContent() {

  var wrapper = document.createElement("div");
  $(wrapper).attr("id","home-wrapper");
  $("#main-content").html("").append(wrapper);

  let divBordered = document.createElement("div");
  $(divBordered).addClass("home-wrapper-border container");
  $(wrapper).append(divBordered);

  $(divBordered).append("<div class='welcome-sign'><span>AttViz</span><img src='icon.png'></div>")

  var welcomeText = document.createElement("div");
  $(welcomeText).css("text-align","center");
  $(welcomeText).append("<div style='border-top: 2px solid #f3f3f3; border-bottom: 2px solid #f3f3f3; padding-top: 20px; padding-bottom: 20px;'>AttViz is an online toolkit for analysis of neural attention heads. It is fully compatible with the PyTorch-Transformers library.. <br>To prepare inputs which are simply uploaded to AttViz, please visit <a target='_blank' href='https://github.com/SkBlaz/embviz' style='font-size: 1.3rem;'><i class='fab fa-github'></i> GitHub</a>.</div>");
  $(welcomeText).append("<div class='buttons'>To begin working with AttViz try <a href='#' style='font-size: 1.3rem; margin-left:5px; margin-right: 5px;' onclick='load_example(1);'>news classification example</a> or <a href='#' style='font-size: 1.3rem; margin-left:5px; margin-right: 5px;' onclick='load_example(2);'>insults example</a>, or <a href='#' style='font-size: 1.3rem; margin-left:5px; margin-right: 5px;' onclick=\"$('#file-text-input').click();\">choose a file to load</a> .</div>")

  let rowOne = document.createElement("div");
  $(rowOne).addClass("row");
  $(welcomeText).append(rowOne);

  let rowOneCol1 = document.createElement("div");
  $(rowOneCol1).addClass("col-12 example-text");
  $(rowOneCol1).append("Aggregation of self-attention")
  $(rowOne).append(rowOneCol1);

  let rowOneCol2 = document.createElement("div");
  $(rowOneCol2).addClass("col-12 example-image");
  $(rowOneCol2).append(createZoomableImage('images/plot-example.png'));
  $(rowOne).append(rowOneCol2);

  let rowTwo = document.createElement("div");
  $(rowTwo).addClass("row");
  $(welcomeText).append(rowTwo);

  let rowTwoCol1 = document.createElement("div");
  $(rowTwoCol1).addClass("col-12 example-text");
  $(rowTwoCol1).append("Visualization of self-attention");
  $(rowTwo).append(rowTwoCol1);

  let rowTwoCol2 = document.createElement("div");
  $(rowTwoCol2).addClass("col-12 example-image");
  $(rowTwoCol2).append(createZoomableImage('images/text-example.png'));
  $(rowTwo).append(rowTwoCol2);


  $(divBordered).append(welcomeText);
}

function createZoomableImage(image) {
  let imgDivWrapper = document.createElement("div");
  $(imgDivWrapper).addClass("example-step-image");

  let imgDiv = document.createElement("div");
  $(imgDiv).append("<div class ='photo' style=\"background-image: url('"+image+"');\"></div>");
  $(imgDiv)
      // tile mouse actions
      .on('mouseover', function(){
        $(this).children('.photo').css({'transform': 'scale(5)'});
      })
      .on('mouseout', function(){
        $(this).children('.photo').css({'transform': 'scale(1)'});
      })
      .on('mousemove', function(e){
        $(this).children('.photo').css({'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 +'%'});
      })
  $(imgDivWrapper).append(imgDiv);

  return imgDivWrapper;
}
