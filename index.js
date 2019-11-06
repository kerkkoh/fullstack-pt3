require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const Person = require('./models/person')
const cors = require('cors')

const errorHandler = (error, request, response, next) => {
  console.log('------------- ERROR -------------')
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())
morgan.token('log-data', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status - :response-time ms :log-data'))

app.get('/info', (req, res) => {
  Person.find({}).then(ps => {
    res.send(`Phonebook has info for ${ps.length} people<br/>${new Date()}`)
  })
})

app.post('/api/persons', (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({
      error: 'name missing from body'
    })
  }
  if (!req.body.number) {
    return res.status(400).json({
      error: 'number missing from body'
    })
  }
  Person.exists({ name: req.body.name })
  .then(bool => {
    if (bool) {
      return res.status(400).json({
        error: 'name must be unique'
      })
    } else {
      const person = new Person({
        name: req.body.name,
        number: req.body.number,
      })
      person.save().then(data => res.json(data.toJSON()))
    }
  })
  .catch(e => next(e))
})

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(ps => {
    res.json(ps.map(person => person.toJSON()))
  })
  .catch(e => next(e))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) res.json(person.toJSON())
    else res.status(404).end()
  })
  .catch(e => next(e))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(person => {
    res.status(204).end()
  })
  .catch(e => next(e))
})

app.put('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndUpdate(req.params.id, req.body).then(person => {
    if (person) res.json(req.body)
    else res.status(404).end()
  })
  .catch(e => next(e))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(errorHandler)
app.use(unknownEndpoint)