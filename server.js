var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var Saved = require("./models/Saved.js");

var request = require("request");
var cheerio = require("cheerio");

var path = require("path");

mongoose.Promise = Promise;

var port = process.env.port || 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static("public"));

var port = process.env.PORT || 3000;

var databaseUri = "mongodb://localhost/espn";

if(process.env.MONGODB_URI) {
    mongoose.connect('mongodb://heroku_94g9tx5c:5pg2cb3chu81223cjhd4qgqde5@ds163294.mlab.com:63294/heroku_94g9tx5c')
} else {
    mongoose.connect(databaseUri);
}

var db = mongoose.connection; 

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

app.post("/saved:id", function(req, res) {
    var newSaved = new Saved(req.body);

    newSaved.save(function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            Article.findOneAndUpdate({
                "_id": req.params.id
            }, {"saved": true})

            .exec(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("saved the article, you're welcome.");
                    res.send(doc);
                }
            });
        }
    });
});

app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("http://www.espn.com", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $("ul.headlineStack__list").each(function(i, element) {

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).text();
            result.link = $(this).find("a").attr("href");
            result.saved = true;

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Now, save that entry to the db
            entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err // Or log the doc
                    );
                } else {

                    console.log(doc);

                }
            });

        });

        res.send("test");
    });
});



// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error // Or send the doc to the browser as a json object
            );
        } else {
            res.json(doc);
        }
    });
});

//Grab all saved articles
app.get("/saved", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({"saved": true}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error // Or send the doc to the browser as a json object
            );
        } else {
            res.json(doc);
        }
    });
});
app.get("/savedArticles", function(req,res){
    res.sendFile(path.join(__dirname, "./public/savedArticles.html"));

// Grab an article by it's ObjectId
app.get("/savedArticles/:id", function(req, res) {
     // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
app.post("/savedArticles/:id", function(req, res) {
 // Create a new note and pass the req.body to the entry
 var newNote = new Note(req.body);
 
   // And save the new note the db
   newNote.save(function(error, doc) {
     // Log any errors
     if (error) {
       console.log(error);
     }
     // Otherwise
     else {
       // Use the article id to find and update it's note
       Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
       // Execute the above query
       .exec(function(err, doc) {
         // Log any errors
         if (err) {
           console.log(err);
         }
         else {
           // Or send the document to the browser
           res.send(doc);
         }
       });
     }
   });
 });

});


// Listen on port 3000
app.listen(port, function() {
    console.log("App running on port 3000 !");
});