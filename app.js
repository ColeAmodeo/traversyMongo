const express = require("express");
const exphbs = require("express-handlebars");
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
//Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev',{
  useNewUrlParser: true
})
.then(() => console.log('MongoDB Connected...'));

// Load idea model
require('./models/Idea');
const Idea = mongoose.model('ideas')

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars')
// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//methodOverride Middleware
app.use(methodOverride('_method'));

// Index route
app.get("/", (req, res) => {
  const title = 'Welcome'
  res.render('index');
});
// Idea Index Page
app.get('/ideas', (req, res) => {
  Idea.find({})
  .then(ideas => {
    res.render('ideas/index', {
      ideas:ideas
    })
  })
})
// Add idea Form
app.get("/ideas/add", (req, res) => {
  res.render('ideas/add');
});
// Edit idea Form
app.get("/ideas/edit/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render('ideas/edit', {
      idea:idea
    });

  })
});
// About route
app.get("/about", (req, res) => {
  res.render('about', {
    title: "About"
  })
})
// Process Video Idea form
app.post('/ideas', (req, res) => {
  let err = [];
  if(!req.body.title){
    err.push({text:'Please add a title'})
  }
  if(!req.body.details){
    err.push({text:'Please add the details'})
  }
  if(err.length > 0){
    res.render('ideas/add', {
      err: err,
      title: req.body.title,
      details: req.body.details
    })
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
    //  user: req.user.id
    }
    new Idea(newUser)
    .save()
    .then(idea => {
      res.redirect('/ideas')
    })
  }
})
// Edit Form Process
app.put('/ideas/:id', (req, res) =>{
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save().then(idea =>
    res.redirect('/ideas'))
  })
})
//Delete Idea
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({_id: req.params.id})
  .then(() => {
    res.redirect('/ideas')
  })
})
const port = 8000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})
