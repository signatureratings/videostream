const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  console.log("some one's calling")
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/video', async (req, res) => {
  const range = req.headers.range
  const path = 'public/legacies.mp4' //replace with your video file
  const stat = fs.statSync(path)
  const fileSize = stat.size
  console.log(range)
  if (range && fileSize) {
    const CHUNK_SIZE = 10 ** 6 //1MB
    const parts = range.replace(/bytes=/, '').split('-')
    const start = Number(parts[0])
    //const end = Number(parts[1])
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1) //set end value min  of 1MB or files size
    const contentlength = end - start + 1
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentlength,
      'content-Type': 'video/mp4',
    }
    res.writeHead(206, headers)
    const videostream = fs.createReadStream(path, { start, end })
    videostream.pipe(res)
  } else {
    return res.status(401).json('Requires Range in headers')
  }
})

app.listen(3000, () => console.log('running'))
