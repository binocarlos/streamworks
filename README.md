streamworks
===========

![streamworks logo](https://github.com/binocarlos/streamworks/raw/master/graphics/stream.jpg "streamworks Logo")

![Build status](https://api.travis-ci.org/binocarlos/streamworks.png)

Combine merge and pipe streams into stream architectures that can bend packets to your will.

## merge stream

![merge stream diagram](https://github.com/binocarlos/streamworks/raw/master/graphics/merge.png "merge stream diagram")

A merge stream will duplicate the input across all members and merge the output from all members (based on [combine-stream](https://github.com/deoxxa/combine-stream).

## pipe stream

![pipe stream diagram](https://github.com/binocarlos/streamworks/raw/master/graphics/pipe.png "pipe stream diagram")

A pipe stream will pass the output from each member as the input to the next (based on [stream-combiner](https://github.com/dominictarr/stream-combiner).

## combo streams

![combo stream diagram](https://github.com/binocarlos/streamworks/raw/master/graphics/combo.png "combo stream diagram")

Both types accepts streams as well as arguments - you can combine merge and pipes with each other!

## installation

```
$ npm install streamworks
```

## usage

There are 2 main methods:

 * merge
 * pipe

Create each type of stream by passing an array of either:

 * functions - these are turned into streams using [through2](https://github.com/rvagg/through2)
 * streams - these are used as is

## example

```js
var from = require('from');
var streamworks = require('streamworks');


// a merge is a stream that splits the input across each function and merges the output back into one stream
var mergestream = streamworks.merge([

	// order lots
	function(chunk, enc, callback){
		this.push(chunk + ':10')
		callback()
	},

	// order some
	function(chunk, enc, callback){
		this.push(chunk + ':2')
		callback()
	}
])


// a pipe is a stream that passes values through each function
var pipestream = streamworks.pipe([

	// filter anything that does not start with p
	function(chunk, enc, callback){
		if(chunk.toString().indexOf('p')!=0){
			this.push(chunk);
		}
		callback();
	},

	// uppercase to input
	function(chunk, enc, callback){

		this.push(chunk.toString().toUpperCase())
	}
])

// run some data through the merge stream (which will duplicate it) and then through the pipe stream (which will filter it)
from(['apple', 'pie', 'custard'])
	.pipe(mergestream)
	.pipe(pipestream)
	.pipe(process.stdout)
```

## nested streams

Because streamworks streams are, umm, streams - you can create complex nested stream-structures:

```js

var bigAssStream = streamworks.pipe([
  function(chunk, enc, callback){
    if(chunk!='world'){
      this.push(chunk);
    }
    callback();
  },

  streamworks.merge([
    function(chunk, enc, callback){
      this.push('A1:' + chunk);
      callback();
    },
    function(chunk, enc, callback){
      this.push('A2:' + chunk);
      callback();
    },
    function(chunk, enc, callback){
      this.push('A3:' + chunk);
      callback();
    }
  ]),

  streamworks.pipe([

    function(chunk, enc, callback){
      if(chunk.toString().indexOf('A2')!=0){
        this.push(chunk);
      }
      callback();
    },
    streamworks.merge([
      function(chunk, enc, callback){
        this.push('sub1:' + chunk);
        callback(); 
      },
      function(chunk, enc, callback){
        this.push('sub2:' + chunk);
        callback(); 
      }
    ]),
    function(chunk, enc, callback){
      if(chunk.toString().indexOf('sub2:A1:')!=0){
        this.push(chunk);
      }
      
      callback()
    },
  ])
])

var arr = [];

from(['hello','world','apple']).pipe(bigAssStream)
.on('data', function(chunk){
  arr.push(chunk.toString())
}).on('end', function(){
	console.dir(arr);
})

/*

sub1:A1:hello
sub1:A3:hello
sub2:A3:hello
sub1:A1:apple
sub1:A3:apple
sub2:A3:apple
	
*/

```

## object streams

If you pass true or:

```js
{
	objectMode:true
}
```

as the first argument to pipe or merge - the stream will be in object mode.

this means that the 'chunks' will be what you sent and not buffers/strings.

You can also use:

 * pipeObjects
 * mergeObjects

Which are shortcuts for:

 * pipe(true, [])
 * merge(true, [])

## api

#### `streamworks.pipe([objectMode], fns)`

create a new readable/writable stream that will pipe each value through the array of streams/functions

#### `streamworks.pipeObjects(fns)`

shorthand for pipe(true, [])

#### `streamworks.merge([objectMode], fns)`

create a new readable/writable stream that will duplicate each value into each of the streams/functions and merge the results back into the output

#### `streamworks.mergeObjects(fns)`

shorthand for merge(true, [])

## license

MIT
