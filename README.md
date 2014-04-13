streamworks
===========

Run a nested collection of streams in pipe or merge configurations

![Build status](https://api.travis-ci.org/streamworks/len.png)


## installation

```
$ npm install streamworks
```

## usage

There are 2 main methods:

### merge
 
[combine-stream](https://github.com/deoxxa/combine-stream)

split the input stream across each function and merge the results back into the output

### pipe

[stream-combiner](https://github.com/dominictarr/stream-combiner)

run the input into the first function and pipe through the rest

## constructor

You create each type of stream by passing an array of either:

 * functions - these are turned into streams using [through2](https://github.com/rvagg/through2)
 * streams - these are piped through

You can pass streamworks merge or pipe streams to other streamworks merge or pipe streams - stream inception!

Each method takes some options:

 * objectMode - true to indicate to the auto constructed streams they should work in object mode

## example

```js
var from = require('from');
var streamworks = require('streamworks');

// a pipe is a stream that passes values through each function
var filterstream = streamworks.pipe([

	function(value){
		this.queue(parseFloat(value) + 5)
	},

	function(value){
		this.queue(parseFloat(value) / 2)
	}
])

// a merge is a stream that splits the input across each function and merges the output back into one stream
var duplicatestream = streamworks.merge([

	function(value){
		this.queue('A: ' + value)
	},

	function(value){
		this.queue('B: ' + (parseFloat(value)+10))
	}
])

// we can now create our final stream by piping numbers through the filter (pipe) and then duplicator (merge)
from([10, 11, 12])
	.pipe(filterstream)
	.pipe(duplicatestream)
	.pipe(process.stdout)

// A: 7.5
// B: 17.5
// A: 8
// B: 18
// A: 8.5
// B: 18.5
```

## nested streams

You can create a tree of dependent streams:

```js
var master = streamworks.merge([

	// pipe A
	streamworks.pipe([

		// initial filter
		function(val){
			val = parseFloat(val);
			if(val>10){
				this.queue(val);	
			}
			
		},

		// merge collection of async resources
		streamworks.merge([

			function(val){
				fetchAsyncResourceA(val, function(error, answer){
					this.queue(answer)
				})
			},

			function(val){
				fetchAsyncResourceB(val, function(error, answer){
					this.queue(answer)
				})
			}

		]),

		// final filter
		function(val){
			val = parseFloat(val);
			if(val>100){
				this.queue(val);	
			}
		},

	]),

	// pipe B
	streamworks.pipe([
		function(val){
			return parseFloat(val * 1000);
		}
	])
])

```

## nested streams

You can create a tree of dependent streams:

The results would be an un-sorted collection of pipe A results and pipe B results (because the top level stream is a merge).

## api

#### `streamworks.pipe(fns)`

create a new readable/writable stream that will pass each value through the array of streams/functions

#### `streamworks.merge(fns)`

create a new readable/writable stream that will duplicate each value into each of the streams/functions and merge the results back into the output

## license

MIT
