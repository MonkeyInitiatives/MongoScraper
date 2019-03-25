var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoscraper";
// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

app.get("/", function(req, res) {
  db.Article.find({ 'saved': false })
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      // res.json(dbArticle);
      // console.log(dbArticle);
      var hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.saved = false;
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.render("index");
  });
});

app.get("/saved", function(req, res) {
  db.Article.find({ 'saved': true })
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      // res.json(dbArticle);
      // console.log(dbArticle);
      var hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  
});

app.get("/clear", function(req, res) {
  // Grab every document in the Articles collection
  console.log("Clear all articles");
  db.Article.collection.drop();
  res.render("index");
});

app.get("/api/notes/:id", function(req, res) {
  // Grab every document in the Articles collection
  console.log("Open notes");
  db.Article.findById(req.params.id)
  .then(function (dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

app.put("/api/article/:id", function(req, res) {
  // Grab every document in the Articles collection
  console.log(req.params.id);
  // console.log(req.body.saved);
  db.Article.updateOne({ _id: req.params.id }, { $set: { saved: req.body.saved } })
  .then(function(dbArticle) {
    res.render("index");
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
