var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;

var Page = require('../models/page');

/* GET admin page. */
router.get('/', isAdmin, function(req, res) {
  Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    res.render('admin/pages', {
      pages: pages
    });
  });
});

/* GET add page. */
router.get('/add-page', isAdmin,  function(req, res, next) {
  var title = "";
  var slug = "";
  var content = "";
  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content
  });

});

/* GET edit page. */
router.get('/edit-page/:id', isAdmin,   function(req, res, next) {
  Page.findById(req.params.id, function(err, page) {
    if (err) 
      return console.log(err);
  res.render('admin/edit_page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });

});


/* POST add page. */
router.post("/add-page", [
        check('title', 'Title must have a value.').notEmpty(),
        check('content', 'Content must have a value.').notEmpty()
    ],
function(req, res, next) {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;

  const errors = validationResult(req).errors;

  if (errors.length != 0) {
    res.render('admin/add_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  }
  else {
    Page.findOne({ slug: slug }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another.');
        res.render('admin/add_page', { title, slug, content });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });
        page.save(function (err) {
          if (err) {
            return console.log(err);
          }
          Page.find({}).exec(function(err,pages) {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.pages = pages;
            }
          });
          req.flash('Success', 'Page added!');
          res.redirect('/admin/pages');
        });
      }
    });
  }
});


/* POST Edit page. */
router.post('/edit-page/:id', [
        check('title', 'Title must have a value.').notEmpty(),
        check('content', 'Content must have a value.').notEmpty()
    ],
function(req, res, next) {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.params.id;

  const errors = validationResult(req).errors;

  if (errors.length != 0) {
    res.render('admin/edit_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  }
  else {
    Page.findOne({ slug: slug, _id:{'$ne}':id}}, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another.');
        res.render('admin/edit_page', { 
            title: title, 
            slug: slug, 
            content: content,
            id: id
          });
      } else {

          Page.findById(id, function(err, page){
            if (err)
              return console.log(err);
            
            page.title = title;
            page.slug = slug;
            page.content = content;

            page.save(function (err) {
              if (err) {
                return console.log(err);
              }
              Page.find({}).exec(function(err,pages) {
                if (err) {
                  console.log(err);
                } else {
                  req.app.locals.pages = pages;
                }
              });  
              req.flash('Success', 'Page edit!');
              res.redirect('/admin/pages');
            });
          });
      }
    });
  }
});

/* GET delete page. */
router.get('/delete-page/:id', isAdmin, function(req, res, next) {
  Page.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      return console.log(err)
    }
    Page.find({}).exec(function(err,pages) {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.pages = pages;
      }
    });  
    req.flash('Success', 'Page deleted!');
    res.redirect('/admin/pages/');
  });
}); 


module.exports = router;
