//jshint esversion:9

const express = require('express');
const app = express();
const http = require('http');
const path = require("path");
const bodyParser = require('body-parser');
const server = http.createServer(app);
const mongoose = require('mongoose');
const ItemModel = require("./schema/ItemSchema").ItemModel;
const ListModel = require("./schema/ListSchema");
const _ = require('lodash');
const port = process.env.PORT || 3000;

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');

const date = new Date();
const options = {
    week: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};
const today = date.toLocaleDateString("en-US", options);

const localURI = "mongodb://localhost:27017/toDoListDB";
const uri = "mongodb+srv://JasonLi:771011@telemetryinterface1.zsqxn.mongodb.net/toDoList?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const defaultItem = new ItemModel({
    name: "Make Breakfast"
});

const defaultItem2 = new ItemModel({
    name: "Brush Teeth"
});

const defaultItem3 = new ItemModel({
    name: "Go to school"
});

const defaultItems = [defaultItem, defaultItem2, defaultItem3];

app.get("/", (req, res) => {
    ItemModel.find({}, (err, items) => {
        if (err) {
            console.log("Error finding items!!!");
        } else {
            // render items already in the DB
            if (items.length === 0) {
                ItemModel.insertMany(defaultItems, (err) => {
                    if (err) console.log("Error Inserting Default Items!!!");
                    else console.log("Default Items are saved to the DB successfully!");
                });
                res.render('list', {
                    title: today,
                    newItemList: defaultItems
                }); // passing value of 'day' to list.ejs
            } else {
                res.render('list', {
                    title: today,
                    newItemList: items
                }); // passing value of 'day' to list.ejs
            }

        }
    });
});

app.post("/", (req, res) => {
    let listName = req.body.listName; // "listName is referenced by 'name' attribute to access the 'value' attribute"
    // since our form only make post request to home route
    // we need to have logic to handle situation where we want add new item in /work route
    let newItemName = req.body.newItem;
    let newItem = new ItemModel({
        name: newItemName
    });
    if (listName === today) {
        newItem.save((err) => {
            if (err) console.log("Error saving new item!!!");
            else console.log('New item saved to the DB successfully!!');
        });
        res.redirect('/');
    } else {
        ListModel.findOne({
            name: listName
        }, (err, foundList) => {
            if (err) console.log("Error finding list!!!");
            else {
                if (foundList) {
                    foundList.list.push(newItem);
                    foundList.save();
                }
                res.redirect('/' + listName); // redirect to home route
            }
        });
    }
});

app.post("/delete", (req, res) => {
    const targetItemID = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === today) {
        ItemModel.findByIdAndRemove(targetItemID, (err) => {
            if (err) console.log("Error deleting item!!!");
            else {
                console.log("Item deleted successfully!!!");
                res.redirect('/');
            }
        });
    } else {
        ListModel.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                list: {
                    _id: targetItemID
                }
            }
        }, (err) => {
            if (err) console.log("Error deleting item!!!");
            else {
                console.log("Item deleted successfully!!!");
                res.redirect('/' + listName);
            }
        });
    }

});

app.get("/:customListName", (req, res) => {
    let customListName = _.capitalize(req.params.customListName);
    // let customList;
    ListModel.findOne({
        name: customListName
    }, (err, foundList) => {
        if (err) console.log("Error finding list!!!");
        else {
            if (foundList) {
                res.render("list", {
                    title: foundList.name,
                    newItemList: foundList.list
                });
            } else {
                // create a new list
                let customList = new ListModel({
                    name: customListName,
                    list: defaultItems
                });
                customList.save();
                res.redirect("/" + customListName);
            }
        }
    });
});

app.listen(port, () => {
    console.log("Server is running on port 3000!");
});