const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { userExtractor } = require('../utils/middleware');


// const getTokenFrom = request => {
//  const authorization = request.get('Authorization')
//  if (authorization && authorization.startsWith('Bearer ')) {
    //return authorization.replace('Bearer ', '')
  //}
  //return null
//}

// get all blogs
blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// add new blog
blogRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body
  const user = await request.user

  // const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  //if (!decodedToken.id) {
    //return response.status(401).json({ error: 'token invalid' })
  //}
  const likes = body.likes === undefined ? 0 : body.likes;
  
  const blog = new Blog(
    {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: likes,
      user: user._id
    }
  )
  
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
  
})

// get blog by id
blogRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  } 
})

// delete blog by id
blogRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const user = await request.user
  const blog = await Blog.findById(request.params.id)

  await Blog.findById(request.params.id)

  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    respqnse.status(401).json({ error: 'unauthorized' })
  }
})

// update blog by id
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