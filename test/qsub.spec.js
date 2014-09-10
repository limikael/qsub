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
		var job = qsub("echo");
		job.arg("-n").arg("hello");

		job.run().then(function() {
			expect(job.getOutput()).toBe("hello");
			done();
		});
	})
});