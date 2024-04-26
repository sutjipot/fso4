const blogRouter = require('express').Router();
const Blog = require('../models/blog');


blogRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body

  const likes = body.likes === undefined ? 0 : body.likes;
  
  const blog = new Blog(
    {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: likes,
    }
  )
  
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
  
})

blogRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  } 
})


blogRouter.delete('/:id', async (request, response, next) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()

})


blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updated = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updated)
  

})

module.exports = blogRouter;