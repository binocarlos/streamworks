var Stream = require('stream');
var through2 = require('through2');
var Merge = require('combine-stream');
var Pipe = require('stream-combiner');

function mapstreams(options, arr){
	
	if(typeof(options)==='boolean'){
		options = {
			objectMode:options
		}
	}
	return arr.map(function(s){
		return s instanceof Stream ? s : through2(options, s)
	})
}
function checkstreams(arr){
	if(!arr || arr.length<=0){
		throw new Error('array needed for streamworks.pipe')
	}
}
var streamworks = module.exports = {
	pipe:function(options, arr){
		if(arguments.length<=1){
			arr = options;
			options = {};
		}
		checkstreams(arr);
		return Pipe.apply(null, mapstreams(options, arr));
	},
	merge:function(options, arr){
		if(arguments.length<=1){
			arr = options;
			options = {};
		}
		checkstreams(arr);
		return new Merge(mapstreams(options, arr));
	},
	pipeObjects:function(arr){
		return streamworks.pipe(true, arr);
	},
	mergeObjects:function(arr){
		return streamworks.merge(true, arr);
	}
}