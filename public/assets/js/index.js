// when document is ready...
$(document).ready(function() {
    
  //create on click events
  $(document).on("click", ".btn.save", saveArticle);
  $(document).on("click", ".btn.delete", deleteArticle);
  $(document).on("click", ".scrape-new", scrapeArticles);
  $(".clear").on("click", clearArticles);
  $(document).on("click", ".btn.notes", showNote);

  function saveArticle() {
    var articleToSave = $(this).parents(".card").data();
    $(this).parents(".card").remove();
    articleToSave.saved = true;
    $.ajax({
      method: "PUT",
      url: "/api/article/" + articleToSave._id,
      data: articleToSave
    }).then(function(data) {
      if (data.saved) {
        window.location.href = "/";
      }
    });
  }

  function deleteArticle() {
    var articleToDelete = $(this).parents(".card").data();
    $(this).parents(".card").remove();
    articleToDelete.saved = false;
    $.ajax({
      method: "PUT",
      url: "/api/article/" + articleToDelete._id,
      data: articleToDelete
    }).then(function(data) {
      if (!data.saved) {
        window.location.href = "/saved";
      }
    });
  }

  function scrapeArticles() {
    $.get("/scrape").then(function(data) {
      console.log("Articles Scraped!");
      window.location.href = "/";
    });
  }

  function clearArticles() {
    $.get("/clear").then(function() {
      console.log("Articles Cleared!");
      window.location.href = "/";
    });
  }

  function showNote(event) {
    $("#noteModalTitle").text("Note for article id: "+$(this).parents(".card").data()._id);
    var thisId = $(this).parents(".card").data()._id;
    console.log(thisId);

    $.ajax({
      method: "GET",
      url: "/api/notes/" + thisId,
    }).then(function(data) {
      // Log the response
      console.log(data.note);
      $("#previous-title").text(data.note.title);
      $("#previous-body").text(data.note.body);
    });

    $(".modal-body").attr("data-id", thisId);
    $(document).on("click", ".saveNote",function(event){
      console.log($(".modal-body").attr("data-id"));
      console.log($("#modal-note-title").val());
      console.log($("#modal-note-body").val());
      $.ajax({
          method: "POST",
          url: "/articles/" + thisId,
          data: {
            // Value taken from title input
            title: $("#modal-note-title").val(),
            // Value taken from note textarea
            body: $("#modal-note-body").val()
          }
        }).then(function(data) {
          // Log the response
          console.log(data);
          // Empty the notes section
          $("#modal-note-title").val("");
          $("#modal-note-body").val("");
        });
    });
  }

});