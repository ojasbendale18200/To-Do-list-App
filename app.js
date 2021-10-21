//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Ojas:Ojas12345@cluster0.qym3y.mongodb.net/todolistDB", {
  useNewUrlParser: true,
}); //connect to the mongoose server

const itemsSchema = {
  //create a new schema only for string
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to My Todolist",
});

const item2 = new Item({
  name: "Hit + Button to Add New List",
});

const item3 = new Item({
  name: "<-- Hit this To Delete This Item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  //creating new schema
  name: String,
  items: [itemsSchema]             //all items in list is saved into itemsSchema array
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    //this is for nodemon method to run same with mongoose

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect("/"); //added items shown in home route
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  //creating the custom routes what user enter after /
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
      name: customListName,
    },
    function(err, foundList) {
      if (!err) {
        if (!foundList) {
          //create New List
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          //Show An existing List

          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items,
          });
        }
      }
    }
  );
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();

    res.redirect("/");
  } else {
    List.findOne({
        name: listName,
      },
      function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    );
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully Deleted the Checked Item"); //delete items on ly shown in console log
        res.redirect("/"); //deleted item shown in home route
      }
    });
  } else {
    List.findOneAndUpdate({
        name: listName,
      }, {
        $pull: {
          items: {
            _id: checkedItemId,
          },
        },
      },
      function(err, founList) {
        if (!err) {
          res.redirect("/" + listName);
        }

      }
    );
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server Has Started Successfully");
});
