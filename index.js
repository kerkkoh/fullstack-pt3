const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

morgan.token('log-data', (req) => JSON.stringify(req.body))

app.use(morgan(':method :url :status - :response-time ms :log-data'))

let persons = [
  { 
    name: 'Arto Hellas', 
    number: '040-123456',
    id: 1
  },
  { 
    name: 'Ada Lovelace', 
    number: '39-44-5323523',
    id: 2
  },
  { 
    name: 'Dan Abramov', 
    number: '12-43-234345',
    id: 3
  },
  { 
    name: 'Mary Poppendieck', 
    number: '39-23-6423122',
    id: 4
  }
]

app.get('/info', (req, res) => {
  res.send(`Phonebook has info for ${persons.length} people<br/>${new Date()}`)
})

const ID_MAX = 2147483647
const generateId = () => Math.floor(Math.random() * Math.floor(ID_MAX))

app.post('/api/persons', (req, res) => {
  //console.log(req.body)
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
  if (persons.find(p => p.name === req.body.name) !== undefined) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: req.body.name,
    number: req.body.number,
    id: generateId()
  }

  persons = persons.concat(person)

  res.json(person)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})