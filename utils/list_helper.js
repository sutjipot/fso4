const lodash = require('lodash')



// dummy function
const dummy = (blogs) => {
    return 1
  }
  
// total likes = sum of likes of all blogs
const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
  }     

// favorite blog = blog with most likes
const favoriteBlog = (blogs) => {
    const blog =  blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog, blogs[0])
    return {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
    }
}

// most blogs = author with most blogs
const mostBlogs = (blogs) => {
    const grouping = lodash.groupBy(blogs, 'author')
    const author = lodash.maxBy(Object.keys(grouping), key => grouping[key].length)
    return {
        author: author,
        blogs: grouping[author].length
    }
}


// most likes = author with most likes
const mostLikes = (blogs) => {
    const grouping = lodash.groupBy(blogs, 'author')
    const likes = lodash.mapValues(grouping, blogs => lodash.sumBy(blogs, 'likes'))
    const author = lodash.maxBy(Object.keys(likes), key => likes[key])
    return {
        author: author,
        likes: likes[author]
    }
}



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
    }


