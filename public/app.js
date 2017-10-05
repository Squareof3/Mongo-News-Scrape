$(document).ready(function() {

    $(".button-collapse").sideNav();

    $(document).on("click", ".scrapButton", function() {

        $.ajax({
            method: "GET",
            url: "/scape",
        }).done(function() {
            console.log("hello");
            window.location.href = "/";
        });
    });

    $('modal').modal();
});

$.getJSON("/articles", function(data) {
    if (data.length !== 0) {

        for (var i = 0; i < data.length; i++) {

            $("#articles").append("<div class = 'col s9'>" + 
        "<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>" + "</div>" + "<div class = 'col s3'>" + "<button class='save waves-effect waves-light btn red' id ='" + data[i]._id + "'>Save Article</button>" + "</div>");
        }
    }
});

$.getJSON("/saved", function(data) {
    if (data.length !== 0) {
        for (var i = 0; i < data.length; i++) {
            $("#savedArticles").append("<div class = 'col s9'>" +
            "<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>" +
            "</div>" +
            "<div class = 'col s3'>" + "<a data-id='" + data[i]._id + "' class='note waves-effect waves-light btn modal-trigger center blue' id='" + data[i]._id + "' href='#modal" + data[i]._id + "'>Add a Note</a>" + "<div id='modal" + data[i]._id + "' class='modal'>" +
            "<div class='modal-content'>" + "<h4>Notes For Article: " + data[i].title + "<h4>" + "<div class='row'>" + "<form class='col s12'>" + "<div class='row'>" + "<div class='input-field col s12'>" + "<textarea id='title" + data[i]._id + "' name='title' class='materialize-textarea'></textarea>" + "<label for='titleInput'>Title</label>" + "</div>" + "<div class='input-field col s12'>" + "<textarea id='body" + data[i]._id + "' name='body' class='materialize-textarea'></textarea>" + "<label for='bodyInput'>Enter Note</label>" + "</div>" + "</div>" +
            "</form>" + "</div>" + "</div>" + "<div class='modal-footer'>" + "<a data-id='" + data[i]._id + "' href='#!' id='savenote' class='modal-action modal-close waves-effect waves-green btn-flat'>Save Note</a>" + "</div>" + "</div>");
        }
    } else {
        var noArticles = $("#savedArticles").append("<h3>UH OH! No reading for you!</h3>");
    }
});

$(document).on("click", ".save", function() {
    var thisID = $(this).attr("id");
    $.ajax({
        mehtod: "POST",
        url: "/saved" + thisId
    }).done(function(data) {
        $("#modalSaved").modal("open");
    });
});

$(document).on("click", ".note", function() {
    
     
      var thisId = $(this).attr("id");
      console.log("id = " + thisId);
    
    
     
      $.ajax({
        method: "GET",
        url: "/savedArticles/" + thisId
      })
     
        .done(function(data) {
        
    
        
        if (data.note) {
          console.log("Title: " + data.note.title);
          console.log("Body: " + data.note.body);
         
          $("#title" + thisId).text(data.note.title);
          
          $("#body" + thisId).text(data.note.body);
        }
      });
    });
    
    
    $(document).on("click", "#savenote", function() {
      
      var thisId = $(this).attr("data-id");
      console.log("Data-Id: " + thisId);
      console.log("Data: " + $("#title" + thisId).val());
      console.log("Data: " + $("#body" + thisId).val());
    
     
      $.ajax({
        method: "POST",
        url: "/savedArticles/" + thisId,
        data: {
          
          title: $("#title" + thisId).val(),
         
          body: $("#body" + thisId).val()
        }
      })
     
        .done(function(data) {
        
        console.log("DATA: " + data);
        
        $("#notes").empty();
      });
    
    });
    
    $(document).on("click", ".savedArticlesButton", function() {
    
      $.ajax({
        method: "GET",
        url: "/savedArticles",
        success: function(data) {
          window.location.href = "/savedArticles";
        }
      });
    });