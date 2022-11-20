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
    name: name,
    username: username,
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
  
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const {username} = request.headers;
  const {title, deadline} = request.body;
  const {id} = request.params;

  console.log(title);
  console.log(deadline);
  console.log(id);

  const user = request.user;
  const todo = user.todos.filter( (todo) => todo.id === id );

  if (todo.length > 0 ) {

    todo[0].title = title;
    todo[0].deadline = deadline;

    return response.status(200).json(todo[0]);
  }
  
  return response.status(404).json({error: 'não existe um todo com o id passado na url.'});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const {id} = request.params;
  const user = request.user;
  
  const todo = user.todos.filter( (todo) => todo.id === id );

  if(todo.length > 0) {
    todo[0].done = true;
    return response.status(200).json(todo[0]);
  }

  return response.status(404).send({error: 'id informado não corresponde a um todo existente.'});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;