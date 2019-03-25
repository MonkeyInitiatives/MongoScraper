/* global bootbox */
$(document).ready(function() {
    // Setting a reference to the article-container div where all the dynamic content will go
    // Adding event listeners to any dynamically generated "save article"
    // and "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".scrape-new", handleArticleScrape);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(".clear").on("click", handleArticleClear);
  
    function handleArticleNotes(event) {
      // This function handles opening the notes modal and displaying our notes
      // We grab the id of the article to get notes for from the card element the delete button sits inside
      var currentArticle = $(this)
        .parents(".card")
        .data();
      // Grab any notes with this headline/article id
      $.get("/api/notes/" + currentArticle._id).then(function(data) {
        // Constructing our initial HTML to add to the notes modal
        console.log(data);
      });
    }

    function handleArticleSave() {
      // This function is triggered when the user wants to save an article
      // When we rendered the article initially, we attached a javascript object containing the headline id
      // to the element using the .data method. Here we retrieve that.
      var articleToSave = $(this)
        .parents(".card")
        .data();
  
      // Remove card from page
      $(this)
        .parents(".card")
        .remove();
  
      articleToSave.saved = true;
      // Using a patch method to be semantic since this is an update to an existing record in our collection
      $.ajax({
        method: "PUT",
        url: "/api/article/" + articleToSave._id,
        data: articleToSave
      }).then(function(data) {
        // If the data was saved successfully
        if (data.saved) {
          // Run the initPage function again. This will reload the entire list of articles
          window.location.href = "/";
        }
      });
    }

    function handleArticleDelete() {
      // This function is triggered when the user wants to save an article
      // When we rendered the article initially, we attached a javascript object containing the headline id
      // to the element using the .data method. Here we retrieve that.
      var articleToDelete = $(this)
        .parents(".card")
        .data();
  
      // Remove card from page
      $(this)
        .parents(".card")
        .remove();
  
        articleToDelete.saved = false;
      // Using a patch method to be semantic since this is an update to an existing record in our collection
      $.ajax({
        method: "PUT",
        url: "/api/article/" + articleToDelete._id,
        data: articleToDelete
      }).then(function(data) {
        // If the data was saved successfully
        if (!data.saved) {
          // Run the initPage function again. This will reload the entire list of articles
          window.location.href = "/saved";
        }
      });
    }
  
    function handleArticleScrape() {
      // This function handles the user clicking any "scrape new article" buttons
      $.get("/scrape").then(function(data) {
        console.log("Scraping...");
        window.location.href = "/";
      });
    }
  
    function handleArticleClear() {
      $.get("/clear").then(function() {
        console.log("Clearing...");
        window.location.href = "/";
      });
    }
  });
  