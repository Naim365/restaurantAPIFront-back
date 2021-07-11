//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash"); 

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//Mongoose Connection with database

 mongoose.connect("mongodb://localhost:27017/smartresturentDB", {useNewUrlParser: true, useUnifiedTopology: true} );



//Create Model and schma

const categorySchma = {

    name : String
};

const Category = mongoose.model("Category", categorySchma);


const category1 = new Category({       //Mongoose Document
    name: "POPADOM & CHUTNEY"
  });
  
  const category2 = new Category({
    name : "STARTERS"
  });
  
  const category3 = new Category({
    name : "TANDOORI DISHES"
  });

  const category4 = new Category({
    name : "MAIN DISHES"
  });

  const category5 = new Category({
    name : "BRITISH ANGLO CLASSICS"
  });
  

  const defaultCategories = [category1, category2, category3, category4, category5];


  const customCategorySchema = {        //Creating custom Category for dynamic route
    name: String,
    categories: [categorySchma]
  };
  
  const Card = mongoose.model("Card", customCategorySchema);   

app.get("/", function(req, res){  
    Category.find(function(err, foundCategories){  //Database Read
     
     if (foundCategories.length === 0) {

        Category.insertMany(defaultCategories, function(err){

         if(!err) {
             res.send(foundCategories);
         } else {
             res.send(err);
         }
            
        });

        res.redirect("/");
        
     } else {
         res.render("card",  { categoryTitle: "Card", newCategoryNames: foundCategories })
     }
     
  
    });
    
  });

  app.get("/:customListName", function(req, res){            // Dynamic route parameter  Creating custom path

    const customCategoryName = _.capitalize(req.params.customCategoryName);   // custom path url automatic capitalised
  
    Card.findOne({name: customCategoryName}, function(err, foundCard){   // Mongoose findOne
      if (!err){
        if (!foundCard){
          //Create a new list
          const card = new Card({
            name: customCategoryName,
            categories: defaultCategories
          });
          card.save();
          res.redirect("/" + customCategoryName);   // Url findout kore auto redirect
        } else {
          //Show an existing list
  
          res.render("card", {categoryTitle: foundCard.name, newCategoryNames: foundCard.categories});
        }
      }
    });
  
  
  
  });
  

  app.post("/", function(req, res){

    const categoryName = req.body.newCategoryNames;
    const cardName = req.body.card;   

  const category = new Category({
    name: categoryName
  });

  if (cardName === "Card"){   // Default | Adding new item into dynamic route
    category.save();
    res.redirect("/");
  } else {
    Card.findOne({name: cardName}, function(err, foundCard){  
      foundCard.categories.push(category);   
      foundCard.save();
      res.redirect("/" + cardName);
    });
  }

  });

  app.post("/delete", function(req, res){     // category.ejs delete form route 
 
    const checkedItemId = req.body.checkbox;    //category.ejs checkbox and listname created
    const cardName = req.body.cardName;   // Dynamic route category delete first category.ejs input type hidden value listtitle
  
    if (cardName === "Card") {
  
      Category.findByIdAndRemove(checkedItemId, function(err){   //Mongoose findByIdAndREmove 
        if (!err) {
          console.log("Successfully deleted checked item.");
  
          res.redirect("/");   //delete kkore page refresh kore de
        }
      });
    } else {
      Card.findOneAndUpdate({name: cardName}, {$pull: {categories: {_id: checkedItemId}}}, function(err, foundCard){   // firstPart: condition, 2nd update, 3rd callback
        if (!err){
          res.redirect("/" + cardName);
        }
      });
    }
  
  
  });
  
  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
  