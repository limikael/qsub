var child_process = require("child_process");
var Q = require("q");

/**
 * Constructor.
 */
function qsub(command) {
	if (!(this instanceof qsub))
		return new qsub(command);

	this.cmd = command;
	this.cmdArgs = [];
	this.returnCode = null;
	this.output = "";
	this.showOutput = false;
	this.deferred = Q.defer();
}

/**
 * Add arguments.
 * @method args
 * @chainable
 */
qsub.prototype.arg = function() {
	var i;

	for (i = 0; i < arguments.length; i++)
		this.cmdArgs = this.cmdArgs.concat(arguments[i]);

	return this;
}

/**
 * Show output or not.
 * @method show
 * @chainable
 */
qsub.prototype.show = function() {
	this.showOutput = true;

	return this;
}

/**
 * Set expected return code.
 * @method expect
 * @chainable
 */
qsub.prototype.expect = function(returnCode) {
	this.expectedReturnCode = returnCode;

	return this;
}

/**
 * Run the command.
 * @method run
 */
qsub.prototype.run = function() {
	this.previousPath = process.cwd();

	if (this.workingPath)
		process.chdir(this.workingPath);

	this.childProcess = child_process.spawn(this.cmd, this.cmdArgs);

	this.childProcess.stdout.on("data", this.onChildProcessOutput.bind(this));
	this.childProcess.stderr.on("data", this.onChildProcessOutput.bind(this));
	this.childProcess.on("error", this.onChildProcessError.bind(this));
	this.childProcess.on("close", this.onChildProcessClose.bind(this));

	if (this.workingPath)
		process.chdir(this.previousPath);

	return this.deferred.promise;
}

/**
 * Child process output.
 * @method onChildProcessOutput
 * @private
 */
qsub.prototype.onChildProcessOutput = function(data) {
	this.output += data;

	if (this.showOutput) {
		process.stdout.write(data);
	}
}

/**
 * Get full command for display.
 * @method getFullCommand
 */
qsub.prototype.getFullCommand=function() {
	return this.cmd+" "+this.cmdArgs.join(" ");
}

/**
 * Child process is complete.
 * @method onChildProcessClose
 * @private
 */
qsub.prototype.onChildProcessClose = function(res) {
	this.returnCode = res;

	if (this.expectedReturnCode != undefined) {
		if (this.returnCode != this.expectedReturnCode) {
			var msg="Expected "+this.getFullCommand()+" to return "+this.expectedReturnCode+" but got "+this.returnCode+"\n";

			this.deferred.reject(msg);
			return;
		}
	}

	this.deferred.resolve(this.returnCode);
}

/**
 * Child process error.
 * @method onChildProcessError
 * @private
 */
qsub.prototype.onChildProcessError = function(e) {
	this.deferred.reject(e);
}

/**
 * Resolve command path.
 * @method resolveCmd
 * @private
 */
qsub.resolveCmd = function(cmd) {
	if (fs.existsSync(path.resolve(cmd)) && !fs.lstatSync(path.resolve(cmd)).isDirectory())
		cmd = path.resolve(cmd);

	if (process.platform == "win32" && fs.existsSync(cmd + ".cmd"))
		cmd = cmd + ".cmd";

	return cmd;
}

module.exports = qsub;