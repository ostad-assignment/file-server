const http = require("http")
const fs = require("fs")
const path = require("path")

const server = http.createServer((req, res) => {
  // Get the file path from the URL
  let filePath = path.join(__dirname, "public", req.url)

  // If the root URL is requested, serve the index.html file
  if (filePath === path.join(__dirname, "public")) {
    filePath = path.join(filePath, "index.html")
  }

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      // File not found, send a 404 response
      res.statusCode = 404
      res.end(`File ${req.url} not found!`)
      return
    }

    // Check if the requested path is a directory
    fs.stat(filePath, (err, stats) => {
      if (err) {
        // Error getting file stats, send a 500 response
        res.statusCode = 500
        res.end(`Error reading file ${req.url}: ${err}`)
        return
      }

      if (stats.isDirectory()) {
        // Requested path is a directory, send a directory listing
        fs.readdir(filePath, (err, files) => {
          if (err) {
            // Error reading directory, send a 500 response
            res.statusCode = 500
            res.end(`Error reading directory ${req.url}: ${err}`)
            return
          }

          // Send directory listing to client
          res.statusCode = 200
          res.setHeader("Content-Type", "text/html")
          res.write("<ul>")
          files.forEach(file => {
            res.write(`<li><a href="${path.join(req.url, file)}">${file}</a></li>`)
          })
          res.write("</ul>")
          res.end()
        })
      } else {
        // Requested path is a file, send file contents to client
        fs.readFile(filePath, (err, data) => {
          if (err) {
            // Error reading file, send a 500 response
            res.statusCode = 500
            res.end(`Error reading file ${req.url}: ${err}`)
            return
          }

          // Send the file contents back to the client
          res.statusCode = 200
          res.setHeader("Content-Type", getMimeType(filePath))
          res.end(data)
        })
      }
    })
  })
})

function getMimeType(filePath) {
  // Set the default mime type to plain text
  let mimeType = "text/plain"

  // Get the file extension
  const extname = path.extname(filePath)

  // Map file extensions to mime types
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript"
  }

  // Look up the mime type based on the file extension
  if (mimeTypes.hasOwnProperty(extname)) {
    mimeType = mimeTypes[extname]
  }

  return mimeType
}

server.listen(3000, () => {
  console.log("File server listening on port 3000!")
})
