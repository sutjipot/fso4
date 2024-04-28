const Blog = require('../models/blog')
const User = require('../models/user')

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


const initialUsers = [
  {
    username: "wangywangy",
    name: "Wangy Wangy",
    password: "wangybanget"
  },
  {
    username: "similikiti",
    name: "Simi Likiti",
    password: "simibanget"
  }
]


const userCredentials = [
  {
    username: initialUsers[0].username,
    password: initialUsers[0].password
  },
  {
    username: initialUsers[1].username,
    password: initialUsers[1].password
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

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb, initialUsers, userCredentials
}