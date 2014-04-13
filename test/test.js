var from = require('from');
var through2 = require('through2');
var streamworks = require('../src');

describe('streamworks', function(){

  describe('constructor', function(){
  
    it('should be a pipe and merge function', function(){
      streamworks.pipe.should.be.type('function');
      streamworks.merge.should.be.type('function');
    })

    it('should throw with no arguments to pipe', function(){
      (function(){
        streamworks.pipe();
      }).should.throw()
    })

    it('should throw with no arguments to merge', function(){
      (function(){
        streamworks.merge();        
      }).should.throw()
    })


  })

  describe('streams', function(){

    it('should run a buffer/string merge', function(done){

      var p = streamworks.merge([
        function(chunk, enc, callback){
          this.push('a' + chunk);
          callback();
        },
        function(chunk, enc, callback){
          this.push('b' + chunk);
          callback();
        },
        function(chunk, enc, callback){
          this.push('c' + chunk);
          callback();
        }
      ])

      var arr = [];

      from(['red','green','blue']).pipe(p)
      .on('data', function(chunk){
        arr.push(chunk.toString())
      })
      .on('end', function(){
        arr.length.should.equal(9);
        arr[3].should.equal('agreen');
        arr[8].should.equal('cblue');
        done();
      })
    })


    it('should run an object merge', function(done){

      var p = streamworks.mergeObjects([
        function(chunk, enc, callback){
          chunk.section = 'a';
          this.push(chunk);
          callback();
        },
        function(chunk, enc, callback){
          chunk.section = 'b';
          this.push(chunk);
          callback();
        },
        function(chunk, enc, callback){
          chunk.section = 'c';
          this.push(chunk);
          callback();
        }
      ])

      var map = {};

      from([{
        name:'a'
      },{
        name:'b'
      },{
        name:'c'
      }]).pipe(p)
      .on('data', function(chunk){
        map[chunk.name + chunk.section] = true;
      })
      .on('end', function(){
        map.aa.should.equal(true);
        map.ab.should.equal(true);
        map.ac.should.equal(true);
        map.ba.should.equal(true);
        map.bb.should.equal(true);
        map.bc.should.equal(true);
        map.ca.should.equal(true);
        map.cb.should.equal(true);
        map.cc.should.equal(true);
        done();
      })
    })

    it('should run a buffer/string pipe', function(done){
      var p = streamworks.pipe([
        function(chunk, enc, callback){
          this.push(chunk + 'a');
          callback();
        },
        function(chunk, enc, callback){
          this.push('b' + chunk);
          callback();
        },
        function(chunk, enc, callback){
          this.push('c' + chunk + 'c');
          callback();
        }
      ])

      var arr = [];

      from(['hello','world','apple']).pipe(p)
      .on('data', function(chunk){
        arr.push(chunk.toString())
      }).on('end', function(){
        arr.length.should.equal(3);
        arr[0].should.equal('cbhelloac');
        arr[1].should.equal('cbworldac');
        arr[2].should.equal('cbappleac');
        done();
      })
    })


    it('should run an object pipe', function(done){
      var p = streamworks.pipeObjects([

        // upercase name
        function(chunk, enc, callback){
          chunk.name = chunk.name.toUpperCase();
          this.push(chunk);
          callback();
        },
        // double price
        function(chunk, enc, callback){
          chunk.price *= 2;
          this.push(chunk);
          callback();
        },
        // filter price
        function(chunk, enc, callback){
          if(chunk.price<=24){
            this.push(chunk);
          }
          callback();
        }
      ])

      var arr = [];

      from([{
        name:'apples',
        price:10
      },{
        name:'pears',
        price:13
      },{
        name:'peaches',
        price:12
      }]).pipe(p)
      .on('data', function(chunk){
        arr.push(chunk)
      }).on('end', function(){
        arr.length.should.equal(2);
        arr[0].name.should.equal('APPLES');
        arr[0].price.should.equal(20);
        arr[1].name.should.equal('PEACHES');
        arr[1].price.should.equal(24);
        done();
      })
    })

  })

	
})

