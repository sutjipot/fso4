const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
      type: String,
      minlength: 3,
      maxlength: 100,
      required: true},
    author: {
      type: String,
      minlength: 3,
      maxlength: 50,
      required: false},
    url: {
      type: String,
      minlength: 3,
      maxlength: 300,
      required: true},
    likes: {
      type: Number,
      minlength: 1,
      maxlength: 10,
      required: true},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  })

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)