const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const { url } = require('node:inspector')


describe('when there is initially some blogs saved', () => {

  // BEFORE EACH TEST, DELETE ALL BLOGS AND INSERT INITIAL BLOGS
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  // BLOGS ARE RETURNED AS JSON
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  // ID AS IDENTIFIER
  test('id is defined', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      assert(blog.id)})
  })


  // ALL BLOGS ARE RETURNED
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  // A SPECIFIC BLOG IS WITHIN THE RETURNED BLOGS
  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    assert(titles.includes('Secrets to being pretty'))
  })



  // VIEWING SPECIFIC BLOG
  describe('viewing a specific blog', () => {

    // HAS A VALID ID
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToView = blogsAtStart[0]
      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert.deepStrictEqual(resultBlog.body, blogToView)
    })


    // FAILS WITH STATUS CODE 400 IF ID IS INVALID (OPTIONAL)
    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  // ADDING NEW BLOG
  describe('addition of a new blog', () => {

    //SUCCEED WITH VALID DATA
    test('succeeds with valid data', async () => {
      const newBlog = {
        title: "Why is coding so hard",
        author: "Indi Cantik",
        url: "http://indicantik-isstressed.com",
      }
    
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    
      const titles = blogsAtEnd.map(r => r.title)
      assert(titles.includes('Why is coding so hard'))
    })

    // NO LIKES DEFAULT 0
    test('no likes = 0', async () => {
      const newBlog = {
        title: "Why is coding so hard",
        author: "Indi Cantik",
        url: "http://indicantik-isstressed.com",
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      
      const likes = blogsAtEnd.map(r => r.likes)
      assert.strictEqual(likes.includes(0), true);

    })

    // NO TITLE = 400
    test('blog without title is not added', async () => {
      const newBlog = {
        author: "Indi Cantik",
        url: "http://indicantik-isstressed.com",
        likes: 247,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    // NO URL = 400
    test('blog without URL is not added', async () => {
      const newBlog = {
        author: "Indi Cantik",
        title: "Why is coding so hard",
        likes: 247,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  // DELETING BLOG
  describe('deletion of a blog', () => {

    // SUCCEEDS WITH STATUS CODE 204 IF ID IS VALID
    test('a blog can be deleted', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      const contents = blogsAtEnd.map(r => r.title)
      assert(!contents.includes(blogToDelete.title))
      
    })
  })


  // UPDATING BLOG
  describe('updating a blog', () => {
    
    // A BLOG CAN BE UPDATED
    test('a blog can be updated', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        title: "Secrets to being pretty",
        author: "Indi Cantik",
        url: "http://indicantik-iscantik.com",
        likes: 2945,
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      const likes = blogsAtEnd.map(r => r.likes)
      assert(likes.includes(2945))
      assert(!likes.includes(blogToUpdate.likes))
    })
  })


  after(() => {
    mongoose.connection.close()
  })
})
