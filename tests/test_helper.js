const Blog = require('../models/blog')

const initialBlogs = [
    {
      _id: "5a422b891b54a676234d17fa",
      title: "Secrets to being pretty",
      author: "Indi Cantik",
      url: "http://indicantik-iscantik.com",
      likes: 2939,
      __v: 0
    },
    {
      _id: "5a422b891b54a676235d17fb",
      title: "Secrets to being ugly",
      author: "Tity botak",
      url: "http://tityboti-isbald.com",
      likes: 277,
      __v: 0
    }
  ]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}