const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const {username} = request.headers;
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return response.status(400).json({error: 'não existe um usuário com o username informado.'});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {

  const {name, username} = request.body;

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({error: 'Já existe um usuário com o username informado.'});
  }

  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  
  users.push(user);

  return response.status(201).json(user);
});

app.get('/users', (request, response) => {

  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const user = request.user;
  
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const {title, deadline} = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const user = request.user;
  const {title, deadline} = request.body;
  const {id} = request.params;

  // retorna a referência do todo
  const todo = user.todos.find( todo => todo.id === id );

  if (!todo) {
    return response.status(404).json({error: 'não existe um todo com o id passado na url.'});
  } 

  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const user = request.user;
  const {id} = request.params;
  
  const todo = user.todos.find( todo => todo.id === id );
  
  if (!todo) {
    return response.status(404).send({error: 'id informado não corresponde a um todo existente.'});
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const user = request.user;
  const {id} = request.params;

  // retornando a posição no array do objeto buscado
  const todoIndex = user.todos.findIndex( todo => todo.id === id );

  if (todoIndex === -1) {
    return response.status(404).send({error: 'id informado não corresponde a um todo existente.'});
  }

  user.todos.splice(todoIndex, 1);
  
  return response.status(204).send();
});

module.exports = app;