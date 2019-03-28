var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoscraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

app.get("/", function(req, res) {
  db.Article.find({ 'saved': false })
    .then(function(dbArticle) {
      var hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
  
});

app.get("/scrape", function(req, res) {
  axios.get("https://www.nytimes.com").then(function(response) {
    var $ = cheerio.load(response.data);
    $("article").each(function(i, element) {
      var result = {};
      result.title = $(element).children().find("p").text();
      result.link = $(element).find("a").attr("href");
      if(result.link.indexOf("https://www.nytimes.com/") === -1){
        result.link = "https://www.nytimes.com"+result.link;
      }
      result.summary = $(element).children().text();
      result.saved = false;
      if(result.title!==""&&result.summary!==""&&result.link!==""){
        db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
      }
    });
    res.render("index");
  });
});

app.get("/saved", function(req, res) {
  db.Article.find({ 'saved': true })
    .then(function(dbArticle) {
      var hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
  
});

app.get("/clear", function(req, res) {
  console.log("Clear all articles");
  db.Article.collection.drop();
  db.Note.collection.drop();
  res.render("index");
});

app.get("/api/notes/:id", function(req, res) {
  console.log("Open notes");
  db.Article.findOne({ _id: req.params.id }).populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.put("/api/article/:id", function(req, res) {
  console.log(req.params.id);
  db.Article.updateOne({ _id: req.params.id }, { $set: { saved: req.body.saved } })
  .then(function(dbArticle) {
    res.render("index");
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});