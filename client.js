// This file contains client (aka browser) side code. Please don't modify the below line;
// it is a flag for our linter.
/* global $, io */

$(document).ready(function () {
  // This code connects to your server via websocket;
  // please don't modify it.
  window.socketURL = 'http://localhost:8080';

  window.socket = io(window.socketURL);

  window.socket.on('connect', function () {
    // console.log('Connected to server!');
  });

  // global var for currently viewed question
  var currentQuestion = undefined;

  // The below two functions are helper functions you can use to
  // create html from a question object.
  // DO NOT MODIFY these functions - they're meant to help you. :)
  window.makeQuestion = function (question) {
    var html = '<div data-question-id="' + question.id + '" class="question"><h1>Question ' + '<span class="qid">' + question.id + '</span>' + '</h1><p class="the-question">' +
      question.text + '</p><br><p>Asked by Socket user ID: <span class="socket-user">' +
      question.author + '</p></div><div class="answer"><h1>Answer</h1><p>' +
      '<div class="form-group"><textarea class="form-control" rows="5" id="answer">' +
      question.answer + '</textarea></div></p><button class="btn btn-default" id="update-answer">Add Answer</button></div>';
    return html;
  };

  window.makeQuestionPreview = function (question) {
    var html = [
      '<li data-question-id="' + question.id + '" class="question-preview"><h1><span class="preview-content">' +
      question.text + '</span></h1><p><em>Author: ' + question.author + '</em></p>'
    ];
    html.join('');
    return html;
  };

  // handler to hide the add question modal when the 'close' button is clicked.
  $('#closeModal').on('click', function () {
    $('#questionModal').modal('hide');
  });

  // You will now need to implement both socket handlers,
  // as well as click handlers.

  $('#submitQuestion').on('click', function () {
    var text = $('#question-text').val();
    if (text != '') {
      window.socket.emit('add_new_question', {text: text});
    }
    $('#question-text').val('');
  });

  window.socket.on('here_are_the_current_questions', function (questions) {
    var questionArr = Object.keys(questions);
    for (var i = 0; i < questionArr.length; i++) {
      var htmlObj = window.makeQuestionPreview(questions[questionArr[i]]);
      $('.question-list').prepend(htmlObj);
    }
  });

  window.socket.on('new_question_added', function (question) {
    var htmlObj = window.makeQuestionPreview(question);
    $('.question-list').prepend(htmlObj);
  });

  $(document).on('click', '.question-preview', function () {
    var questionID = $(this).data('questionId');
    var data = $(this).data();
    window.socket.emit('get_question_info', questionID);
    currentQuestion = questionID;
  });

  window.socket.on('question_info', function (question) {
    if (question) {
      $('.question-view').empty();
      var $htmlObj = $(window.makeQuestion(question));
      $('.question-view').append($htmlObj);
    } else {
      return;
    }
  });

  $(document).on('click', '#update-answer', function () {
    var questionID = currentQuestion;
    var text = $('#answer').val();
    window.socket.emit('add_answer', {id: questionID, answer: text});
  });

  window.socket.on('answer_added', function (question) {
    if (currentQuestion === question.id) {
      var answer = question.answer;
      console.log('answer', answer);
      $('#answer').val(question.answer);
    }
  });
});
