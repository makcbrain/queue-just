/**
 * Created by makcbrain on 05.02.15.
 */

var util = require('util'),
  events = require('events');

function Queue(options) {
  options = options || {};
  events.EventEmitter.call(this);
  this.queue = [];
  this.autostart = options.autostart ? options.autostart : false;
  this.timeout = options.timeout ? this.setTimeout(options.timeout) : 0;
  this.running = false;
  this.callback=function(){};
}

util.inherits(Queue, events.EventEmitter);

Queue.prototype.setTimeout = function (timeout) {
  if (typeof timeout !== 'number' || timeout < 0) throw new Error('parameter "timeout" in Queue.setTimeout must be a positive number');
  this.timeout = timeout;
};

Queue.prototype.add = function (task) {
  this.queue.push(task);
  this.emit('add', task);
  if (this.autostart && !this.running) this.start();
};

Queue.prototype.start = function (callback) {
  this.callback = callback || function () {
  };
  if (!this.running && this.queue.length){
    this.emit('start');
    this.startTask();
  }
};

Queue.prototype.startTask = function(){
  var self=this;
  if(this.queue.length){
    var task=this.queue.shift()
    function next(err){
      if(err) {
        self.emit('error', err);
      }else{
        self.emit('success', task, [].slice.call(arguments));
      }
      self.startTask();
    }
    task(next);
  }else{
    this.done();
  }
};

Queue.prototype.stop=function(){
  this.running=false;
  this.emit('stop');
};

Queue.prototype.done = function(){
  this.running=false;
  this.emit('done');
  this.callback();
};

module.exports = Queue;



