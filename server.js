// The below code creates a simple HTTP server with the NodeJS `http` module,
// and makes it able to handle websockets. However, currently it does not
// actually have any websocket functionality - that part is your job!

var http = require('http');
var io = require('socket.io');

var requestListener = function (request, response) {
  response.writeHead(200);
  response.end('Hello, World!\n');
};

var server = http.createServer(requestListener);

server.listen(8080, function () {
  console.log('Server is running...');
});

var socketServer = io(server);

// This is the object that will keep track of all the current questions in the server.
// It can be considered to be the (in-memory) database of the application.
var questions = {};
var questionKey = 0;

// Your code goes here:
socketServer.on('connection', function (socket) {
  socket.emit('here_are_the_current_questions', questions);
  socket.on('add_new_question', function (data) {
    var questionData = {
      text: data.text,
      answer: '',
      author: socket.id,
      id: questionKey,
    };
    questions[questionKey] = questionData;
    console.log('id', questions[questionKey].id)
    socketServer.emit('new_question_added', questions[questionKey]);
    questionKey += 1;
  });
  socket.on('get_question_info', function (questionID) {
    if (questions[questionID]) {
      socket.emit('question_info', questions[questionID]);
    } else {
      return null;
    }
  });
  socket.on('add_answer', function (set) {
    console.log('set', set);
    var id = set.id;
    var text = set.answer;
    var keys = Object.keys(questions);
    var question = questions[id];
    console.log('questions', questions);
    console.log('question', question);
    question.answer = text;
    socket.broadcast.emit('answer_added', question);
  });
});
