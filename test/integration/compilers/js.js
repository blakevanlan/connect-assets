var expect = require("expect.js");
var mocha = require("mocha");
var fs = require("fs");
var http = require("http");
var connect = require("connect");
var request = require("request");

var connectAssets = require("../../../index");

describe("lib/compilers/js", function () {

  it("includes a js file with version token", function (done) {
    var req = { url: "/" };

    connectAssets({
      src: "test/integration/assets",
      tagWriter: "passthroughWriter",
      helperContext: this
    })(req, null, function (err) {
      if (err) throw err;

      var expected = "/js/no-dependencies.js?v=";
      var actual = this.js("no-dependencies");

      expect(actual).to.contain(expected);
      done();
    }.bind(this));
  });

  it("serves a js file with no minification when build=false", function (done) {
    var file = "test/integration/assets/js/no-dependencies.js";

    var middleware = connectAssets({
      build: false,
      src: "test/integration/assets",
      tagWriter: "passthroughWriter",
      helperContext: this
    });

    var server = http.createServer(connect().use(middleware));

    server.listen(3590, function () {
      request("http://localhost:3590", function (err) {
        if (err) throw err;

        fs.readFile(file, "utf-8", function (err, expected) {
          if (err) throw err;

          var url = this.js("no-dependencies");

          request("http://localhost:3590" + url, function (err, res, body) {
            if (err) throw err;

            expect(body).to.be(expected);

            server.close();
            done();
          });
        }.bind(this));
      }.bind(this));
    }.bind(this));
  });

  it("serves a js file with minification when build=true", function (done) {
    var file = "test/integration/builtAssets/js/no-dependencies.js";

    var middleware = connectAssets({
      build: true,
      src: "test/integration/assets",
      tagWriter: "passthroughWriter",
      helperContext: this
    });

    var server = http.createServer(connect().use(middleware));

    server.listen(3591, function () {
      request("http://localhost:3591", function (err) {
        if (err) throw err;

        fs.readFile(file, "utf-8", function (err, expected) {
          if (err) throw err;

          var url = this.js("no-dependencies");

          request("http://localhost:3591" + url, function (err, res, body) {
            if (err) throw err;

            expect(body).to.be(expected);

            server.close();
            done();
          });
        }.bind(this));
      }.bind(this));
    }.bind(this));
  });

  it("serves all dependencies with `//= require file` when build=false", function (done) {
    var file1 = "test/integration/assets/js/no-dependencies.js";
    var file2 = "test/integration/assets/js/dependencies.js";

    var middleware = connectAssets({
      build: false,
      src: "test/integration/assets",
      tagWriter: "passthroughWriter",
      helperContext: this
    });

    var server = http.createServer(connect().use(middleware));

    server.listen(3592, function () {
      request("http://localhost:3592", function (err) {
        if (err) throw err;

        fs.readFile(file1, "utf-8", function (err, expected) {
          if (err) throw err;

          var urls = this.js("dependencies").split("\n");

          expect(urls.length).to.be(2);

          request("http://localhost:3592" + urls[0], function (err, res, body) {
            if (err) throw err;

            expect(body).to.be(expected);

            fs.readFile(file2, "utf-8", function (err, expected) {
              if (err) throw err;

              request("http://localhost:3592" + urls[1], function (err, res, body) {
                if (err) throw err;

                expect(body).to.be(expected);

                server.close();
                done();
              });
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  });

  it("concatenates all dependencies with `//= require file` when build=false", function (done) {
    var file = "test/integration/builtAssets/js/dependencies.js";

    var middleware = connectAssets({
      build: true,
      src: "test/integration/assets",
      tagWriter: "passthroughWriter",
      helperContext: this
    });

    var server = http.createServer(connect().use(middleware));

    server.listen(3593, function () {
      request("http://localhost:3593", function (err) {
        if (err) throw err;

        fs.readFile(file, "utf-8", function (err, expected) {
          if (err) throw err;

          var urls = this.js("dependencies").split("\n");

          expect(urls.length).to.be(1);

          request("http://localhost:3593" + urls[0], function (err, res, body) {
            if (err) throw err;

            expect(body).to.be(expected);

            server.close();
            done();
          });
        }.bind(this));
      }.bind(this));
    }.bind(this));
  });
});