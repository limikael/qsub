qsub = require("../qsub");

describe("qsub", function() {

	it("can run a command", function(done) {
		qsub("ls").run().then(function() {
			done();
		});
	});

	it("detects errors", function(done) {
		qsub("does_not_exist").run().then(
			function() {},
			function() {
				done();
			}
		);
	});

	it("can expect a return code", function(done) {
		qsub("ls").expect(1).run().then(
			function() {},
			function(e) {
				done();
			}
		);
	});

	it("can show its output", function(done) {
		qsub("ls").show().run().then(function() {
			done();
		});
	});

	it("can get output", function(done) {
		var job = qsub("ls");
		job.arg("README.md");

		job.run().then(
			function() {
				expect(job.getOutput()).toBe("README.md\n");
				done();
			},
			function(e) {
				console.log("Error: "+e);
				throw new Error("Error: "+e);
			}
		);
	});

	it("can get check output", function(done) {
		var job = qsub("ls");
		job.arg("README.md");
		job.expectOutput("README.md\n");

		job.run().then(function() {
			done();
		});
	});

	it("can get check output", function(done) {
		var job = qsub("echo");
		job.arg("-n").arg("hello");
		job.expectOutput("hello2");

		job.run().then(function() {}, function() {
			done();
		});
	});

	it("can set working direcory",function(done) {
		var job = qsub("ls");
		job.cwd("test");
		job.expectOutput("qsub.spec.js\n");

		job.run().then(function() {
			done();
		});
	});
});