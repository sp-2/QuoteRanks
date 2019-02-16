
var express = require("express");

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

// Require path
var path = require('path');

var app = express();

mongoose.connect('mongodb://localhost/author_mongoose');

mongoose.Promise = global.Promise;

var AuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Name field cannot be empty!"],
        minlength: [3,"Name should have more than 2 characters!"]
    },
    quotes: [{quote: {
        type: String,
        minlength: [3,"Quote should have more than 2 characters!"]
    }, vote: Number}],

   }, {timestamps: true })

mongoose.model('Author', AuthorSchema);
var Author = mongoose.model('Author')

app.use(bodyParser.json());

app.use(express.static( __dirname + '/myAngularApp/dist' ));

// root route, Retrieve all authors
app.get('/authors', function (req, res){
    Author.find({},null,{sort: 'name'}, function(err, authors) {

        if(err){
            console.log("could not get authors", err);
            res.json({message: "Error", error: err})
         }
         else {
            res.json({message: "Success", data: authors})
         }
    })

});

//create a author, post route
app.post('/authors', function (req, res){

    var author = new Author(req.body);

    author.save(function(err, authors) {

        if(err) {
            console.log('something went wrong');
            res.json({message: "Error", error: err})
            console.log(err)
        } else {
            console.log('successfully added a author!');
            res.json({message: "Success", data: authors})
        }
    })
});

//edit author, add quote
app.post('/quotes/:author_id', function (request, res){
        id = request.params.author_id;
        Author.update({_id:id}, {$push: {quotes: request.body}},  { runValidators: true }, function(err, author) {

        if(err){
            console.log("could not update author in server", err);
            res.json({message: "Error in server", error: err})
        }
        else {
            console.log("ok",author)
            res.json({message: "Success in server", data: author})
        }
    })
});

app.post('/quotes/upvote/:author_id', function (request, res){
        id = request.params.author_id;

        Author.update({_id:id, 'quotes._id': request.body.quote_id}, {$inc: {'quotes.$.vote': 1}},  { runValidators: true }, function(err, author) {

        if(err){
            console.log("could not update author in server", err);
            res.json({message: "Error in server", error: err})
        }
        else {
            console.log("ok",author)
            res.json({message: "Success in server", data: author})
        }
    })
});

app.post('/quotes/downvote/:author_id', function (request, res){
        id = request.params.author_id;

        Author.update({_id:id, 'quotes._id': request.body.quote_id}, {$inc: {'quotes.$.vote': -1}},  { runValidators: true }, function(err, author) {
        //Model.update({ _id: doc._id }, { $inc: { age: 1 } }, function(error, rawResponse) {
        if(err){
            console.log("could not update author in server", err);
            res.json({message: "Error in server", error: err})
        }
        else {
            console.log("ok",author)
            res.json({message: "Success in server", data: author})
        }
    })
});

//delete quote
app.post('/quotes/destroy/:author_id', function (request, res){
    id = request.params.author_id;

    Author.update({_id:id}, {$pull: {quotes: {_id: request.body.quote_id}}},  { runValidators: true }, function(err, author) {

        if(err) {
            console.log('could not delete quote',err);
            res.json({message: "Error: Could not delete quote", error: err})
        } else {
            console.log('successfully deleted quote!');
            res.json({message: "Success", data: author})
        }
    })

});

//Retrieve a Author by ID
app.get('/authors/:id', function (request, res){
    id = request.params.id;

    Author.findOne({_id:id},null,{sort: 'name'}, function(err, authors) {
        if(err){
            console.log("could not get author", err);
            res.json({message: "Error: Could not get author", error: err})
        }
        else {
            res.json({message: "Success", data: authors})
        }
    })

});

//edit author: Update an Author by ID
app.put('/authors/:id', function (request, res){
        id = request.params.id;

        Author.findByIdAndUpdate(id, {$set:request.body},  { runValidators: true }, function(err, author) {

        if(err){
            console.log("could not update author", err);
            res.json({message: "Error", error: err})
        }
        else {
            console.log("ok")
            res.json({message: "Success", data: author})
        }
    })
});

//delete author by ID
app.delete('/authors/destroy/:id', function (request, res){
    id = request.params.id;

    Author.remove({_id: id}, function(err,author){
        if(err) {
            console.log('could not delete author',err);
            res.json({message: "Error: Could not delete author", error: err})
        } else {
            console.log('successfully deleted author!');
            res.json({message: "Success", data: author})
        }
   })

});

app.all("*", (req,res,next) => {
  res.sendFile(path.resolve("./myAngularApp/dist/index.html"))
});

app.listen(8000, function() {
  console.log("listening on port 8000");
})
