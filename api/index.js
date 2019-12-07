const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

router.post('/createProduct',(req, res) => {

    const newProduct = new Product({
        name: req.body.name,
    });

    newProduct.save().then(post => res.json({
        success: true,
        message: 'Product Created.',
        data:post
    })).catch(err => res.json({
        success: false,
        message: err
    }))

})

// @all post 

router.get('/allPosts', (req, res) => {
    Post.find()
        .sort({
            createdOn: -1
        })
        .populate({path:'user'})
        .then(posts => {
            if(posts.length == 0) return res,json({success:false,message:"No Post is created yet!"})
            res.json({
            success: true,
            data: posts
        })}
    )
        .catch(err => res.status(404).json({
            success: false,
            message: err
        }));
});


router.get('/:id', (req, res) => {
    if (!req.params.id) return res.json({
        success: false,
        message: 'Please Provide id'
    })
    Post.findById(req.params.id)
        .then(post => {
            if (!post) return res.json({
                success: false,
                message: post
            })
            res.json({
                success: true,
                message: post
            })
        })
        .catch(err =>
            res.status(404).json({
                success: false,
                message: 'No post found with that ID'
            })
        )
});

router.delete(
    '/:id',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        Profile.findOne({
            user: req.user._id
        }).then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (!post) return res.json({
                        success: false,
                        message: 'No post Found.'
                    })
                    if (post.user.toString() != req.user._id) {
                        return res
                            .status(401)
                            .json({
                                success: false,
                                message: 'User not authorized'
                            });
                    }

                    post.remove().then(() => res.json({ success: true }));
                   
                })
                .catch(err => res.status(404).json({
                    success: false,
                    message: 'No post found'
                }))
        });
    }
);


// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
    '/like/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user._id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user._id.toString())
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyliked: 'User already liked this post' });
            }
  
            // Add user id to likes array
            post.likes.unshift({ user: req.user._id.toString() });
  
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
    }
  );
  
  // @route   POST api/posts/unlike/:id
  // @desc    Unlike post
  // @access  Private
  router.post(
    '/unlike/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user._id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            

            if (post.likes.filter(like => like.user.toString() === req.user._id.toString())
            .length === 0) {
              return res
                .status(400)
                .json({ notliked: 'You have not yet liked this post' });
            }
  
            // Get remove index
            const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user._id);
  
            // Splice out of array
            post.likes.splice(removeIndex, 1);
  
            // Save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
    }
  );
  
  // @route   POST api/posts/comment/:id
  // @desc    Add comment to post
  // @access  Private
  router.post(
    '/comment/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const { errors, isValid } = postValidationInput(req.body);
  
      // Check Validation
      if (!isValid) {
        // If any errors, send 400 with errors object
        return res.status(400).json(errors);
      }
  
      Post.findById(req.params.id)
        .then(post => {
          const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user._id
          };
  
          // Add to comments array
          post.comments.unshift(newComment);
  
          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }
  );
  
  // @route   DELETE api/posts/comment/:id/:comment_id
  // @desc    Remove comment from post
  // @access  Private
  router.delete(
    '/comment/:id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Post.findById(req.params.id)
        .then(post => {
          // Check to see if comment exists
          if (
            post.comments.filter(
              comment => comment._id.toString() === req.params.comment_id
            ).length === 0
          ) {
            return res
              .status(404)
              .json({ commentnotexists: 'Comment does not exist' });
          }
  
          // Get remove index
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
  
          // Splice comment out of array
          post.comments.splice(removeIndex, 1);
  
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }
  );
  

module.exports = router;