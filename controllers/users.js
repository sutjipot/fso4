const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


// CREATE NEW USER
usersRouter.post('/', async (request, response) => {
    const {username, name, password} = request.body

    if (!username || username.length < 3) {
        return response.status(400).json({error: 'username must be at least 3 characters long'})
    }

    if (!password || password.length < 3) {
        return response.status(400).json({error: 'password must be at least 3 characters long'})
    }

    if (!name) {
        return response.status(400).json({error: 'name is required'})
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return response.status(400).json({ error: 'expected `username` must be unique' });
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

// GET ALL USERS
usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs')
    response.json(users)
})

module.exports = usersRouter
