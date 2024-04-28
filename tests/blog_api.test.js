const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const { url } = require('node:inspector')
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

var testToken 
var invalidTestToken 


describe('when there is initially some blogs saved', () => {

  // BEFORE EACH TEST, DELETE ALL BLOGS AND INSERT INITIAL BLOGS
  beforeEach(async () => {

    await User.deleteMany({})

    await api
      .post('/api/users')
      .send(helper.initialUsers[0])

    await api
      .post('/api/login')
      .send(helper.userCredentials[0])
      .expect(res => { testToken = res.body.token })

    await Blog.deleteMany({})

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${testToken}`)
      .send(helper.initialBlogs[0])

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${testToken}`)
      .send(helper.initialBlogs[1])
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

      const processed = JSON.parse(JSON.stringify(blogToView))
      assert.deepStrictEqual(resultBlog.body, processed)
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
        .set('Authorization', `bearer ${testToken}`)
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
        .set('Authorization', `bearer ${testToken}`)
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
        .set('Authorization', `bearer ${testToken}`)
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
        .set('Authorization', `bearer ${testToken}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    // NO TOKEN = 401
    test('no token = 401', async () => {
      const newBlog = {
        title: "Why is coding so hard",
        author: "Indi Cantik",
        url: "http://indicantik-isstressed.com",
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

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
        .set('Authorization', `bearer ${testToken}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      const contents = blogsAtEnd.map(r => r.title)
      assert(!contents.includes(blogToDelete.title))
      
    })

    // INVALID TOKEN = 401
    test('invalid token = 401', async () => {
      await api
        .post('/api/users')
        .send(helper.initialUsers[1])

      await api
        .post('/api/login')
        .send(helper.userCredentials[1])
        .expect(res => { invalidTestToken = res.body.token })

      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `bearer ${invalidTestToken}`)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
      const titles = blogsAtEnd.map(r => r.title)
      assert(titles.includes(blogToDelete.title))
    })
  })


  // UPDATING BLOG
  describe('updating a blog', () => {
    
    // A BLOG CAN BE UPDATED
    test('a blog can be updated', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        likes: 2945,
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `bearer ${testToken}`)
        .send(updatedBlog)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      const likes = blogsAtEnd.map(r => r.likes)
      assert(likes.includes(2945))
      assert(!likes.includes(blogToUpdate.likes))
    })

    // INVALID TOKEN = 401
    test('invalid token = 401', async () => {
      await api
        .post('/api/users')
        .send(helper.initialUsers[1])

      await api
        .post('/api/login')
        .send(helper.userCredentials[1])
        .expect(res => { invalidTestToken = res.body.token })

      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        likes: 2945,
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `bearer ${invalidTestToken}`)
        .send(updatedBlog)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      const likes = blogsAtEnd.map(r => r.likes)
      assert(!likes.includes(2945))
      assert(likes.includes(blogToUpdate.likes))
      
    })
  })


  after(() => {
    mongoose.connection.close()
  })
})
