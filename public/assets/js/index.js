// when document is ready...
$(document).ready(function() {
    
  $(document).on("click", ".btn.save", saveArticle);
  $(document).on("click", ".btn.delete", deleteArticle);
  $(document).on("click", ".scrape-new", scrapeArticles);
  $(".clear").on("click", clearArticles);
  $(document).on("click", ".btn.notes", handleArticleNotes);

  function handleArticleNotes(event) {
    var currentArticle = $(this).parents(".card").data();
    $.get("/api/notes/" + currentArticle._id).then(function(data) {
      console.log(data);
    });
  }

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
});