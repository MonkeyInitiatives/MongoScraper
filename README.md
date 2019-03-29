# MongoScraper

## Overview

This full-stack web app, hosted on Heroku, utilizes axios and cheerio to scrape the new york times front page, stores articles in a Mongo database, and render the results via the template engine Express-Handlebars. Once articles are scraped and displayed, a user is able to then save the articles to a saved database, and add a note. The most recent note is saved to the article and displayed. A user then has the option of clearing the database and resetting everything to its starting condition. 

### Technologies

MongoScraper uses the following technologies:

    axios
    cheerio
    express
    express-handlebars
    mongoose
    morgan

### Limitations

Only the first note is saved to an article, and any additional notes overwrite the previous existing note. Moreover, due to how the New York Times renders its homepage, only the first 10 articles are returned when scraped. 