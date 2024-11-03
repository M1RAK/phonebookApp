import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

const app = express()

let persons = [
	{
		id: '1',
		name: 'Arto Hellas',
		number: '040-123456'
	},
	{
		id: '2',
		name: 'Ada Lovelace',
		number: '39-44-5323523'
	},
	{
		id: '3',
		name: 'Dan Abramov',
		number: '12-43-234345'
	},
	{
		id: '4',
		name: 'Mary Poppendieck',
		number: '39-23-6423122'
	}
]

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))

const PORT = process.env.PORT || 3001

const generateId = () => {
	return String(Math.floor(Math.random() * 255))
}

const validatePerson = (name, number) => {
	let response = { isValid: true, message: '' }

	if (!name || !number) {
		response = {
			isValid: false,
			message: 'Please fill in the required information...'
		}
	}

	persons.find((person) => {
		if (person.name === name) {
			response = { isValid: false, message: 'name must be unique' }
		} else if (person.number === number) {
			response = { isValid: false, message: 'number must be unique' }
		}
	})

	return response
}

const requestLogger = (request, response, next) => {
	console.log('Method:', request.method)
	console.log('Path:', request.path)
	console.log('Body:', request.body)
	console.log('---')
	next()
}
app.use(requestLogger)

app.get('/', (req, res) => {
	res.send('<h1>Welcome to the Phonebook...</h1>')
})

app.get('/info', (req, res) => {
	res.send(`
    <p>Phonebook has info for ${persons.length}
    ${persons.length > 1 ? 'persons' : 'person'}<br />${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
	res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find((person) => person.id === id)

	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

app.post('/api/persons', (request, response) => {
	const { name, number } = request.body

	const { isValid, message } = validatePerson(name, number)

	if (!isValid) {
		return response.json({ error: message })
	}

	const Person = {
		name,
		number,
		id: generateId()
	}

	persons = persons.concat(Person)
	response.json(Person)
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter((person) => person.id !== id)

	response.status(204).end()
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}
	next(error)
}
app.use(errorHandler)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
