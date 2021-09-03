const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
   const { username } = request.headers;

   const foundUser = users.find((user) => user.username === username);

   if(!foundUser) {
   	return response.status(404).json({ error: "User not found!" });
   }

   request.user = foundUser;

   next()
}

app.post('/users', (request, response) => {
   const { name, username } = request.body;

   const foundUser = users.find(user => user.username === username);

   if(foundUser) {
   	return response.status(400).json({ error : "Ja existe um usuario com o username desejado"});
   }

   const newUser = {
   	id: uuidv4(),
   	name: name,
   	username: username,
   	todos: []
   }

   users.push(newUser);

   return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	const user = request.user;

  	return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const todo = {
  	id: uuidv4(),
  	title,
  	done: false,
  	deadline: new Date(deadline),
  	created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
 
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const { title, deadline } = request.body;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) { 
  	return response.status(404).json({ error : "To do not found!" });
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.status(200).json(foundTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
  	return response.status(404).json({ error: "To do not found!" });
  }

  foundTodo.done = true;

  return response.status(200).json(foundTodo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const foundIndex = user.todos.findIndex((todo) => todo.id === id);

  if (foundIndex < 0) {
  	return response.status(404).json({ error: "To do not found" });
  }

  user.todos.splice(foundIndex, 1);

  return response.status(204).send();

});

module.exports = app;