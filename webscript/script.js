// Array to store our Snowflake objects
var snowflakes = [];

// Global variables to store our browser's window size
var browserWidth;
var browserHeight;

// Specify the number of snowflakes you want visible
var numberOfSnowflakes = 50;

// Flag to reset the position of the snowflakes
var resetPosition = false;

// Handle accessibility
var enableAnimations = false;
var reduceMotionQuery = matchMedia("(prefers-reduced-motion)");

// Handle animation accessibility preferences
function setAccessibilityState() {
	if (reduceMotionQuery.matches) {
		enableAnimations = false;
	} else {
		enableAnimations = true;
	}
}
setAccessibilityState();

reduceMotionQuery.addListener(setAccessibilityState);

//
// It all starts here...
//
function setup() {
	if (enableAnimations) {
		window.addEventListener("DOMContentLoaded", generateSnowflakes, false);
		window.addEventListener("resize", setResetFlag, false);
	}
}
setup();

//
// Constructor for our Snowflake object
//
function Snowflake(element, speed, xPos, yPos) {
	// set initial snowflake properties
	this.element = element;
	this.speed = speed;
	this.xPos = xPos;
	this.yPos = yPos;
	this.scale = 1;

	// declare variables used for snowflake's motion
	this.counter = 0;
	this.sign = Math.random() < 0.5 ? 1 : -1;

	// setting an initial opacity and size for our snowflake
	this.element.style.opacity = (.1 + Math.random()) / 3;
}

//
// The function responsible for actually moving our snowflake
//
Snowflake.prototype.update = function () {
	// using some trigonometry to determine our x and y position
	this.counter += this.speed / 5000;
	this.xPos += this.sign * this.speed * Math.cos(this.counter) / 40;
	this.yPos += Math.sin(this.counter) / 40 + this.speed / 30;
	this.scale = .5 + Math.abs(10 * Math.cos(this.counter) / 20);

	// setting our snowflake's position
	setTransform(Math.round(this.xPos), Math.round(this.yPos), this.scale, this.element);

	// if snowflake goes below the browser window, move it back to the top
	if (this.yPos > browserHeight) {
		this.yPos = -50;
	}
}

//
// A performant way to set your snowflake's position and size
//
function setTransform(xPos, yPos, scale, el) {
	el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) scale(${scale}, ${scale})`;
}

//
// The function responsible for creating the snowflake
//
function generateSnowflakes() {

	// get our snowflake element from the DOM and store it
	var originalSnowflake = document.querySelector(".snowflake");

	// access our snowflake element's parent container
	var snowflakeContainer = originalSnowflake.parentNode;
	snowflakeContainer.style.display = "block";

	// get our browser's size
	browserWidth = document.documentElement.clientWidth;
	browserHeight = document.documentElement.clientHeight;

	// create each individual snowflake
	for (var i = 0; i < numberOfSnowflakes; i++) {

		// clone our original snowflake and add it to snowflakeContainer
		var snowflakeClone = originalSnowflake.cloneNode(true);
		snowflakeContainer.appendChild(snowflakeClone);

		// set our snowflake's initial position and related properties
		var initialXPos = getPosition(50, browserWidth);
		var initialYPos = getPosition(50, browserHeight);
		var speed = 5 + Math.random() * 40;

		// create our Snowflake object
		var snowflakeObject = new Snowflake(snowflakeClone,
			speed,
			initialXPos,
			initialYPos);
		snowflakes.push(snowflakeObject);
	}

	// remove the original snowflake because we no longer need it visible
	snowflakeContainer.removeChild(originalSnowflake);

	moveSnowflakes();
}

//
// Responsible for moving each snowflake by calling its update function
//
function moveSnowflakes() {

	if (enableAnimations) {
		for (var i = 0; i < snowflakes.length; i++) {
			var snowflake = snowflakes[i];
			snowflake.update();
		}
	}

	// Reset the position of all the snowflakes to a new value
	if (resetPosition) {
		browserWidth = document.documentElement.clientWidth;
		browserHeight = document.documentElement.clientHeight;

		for (var i = 0; i < snowflakes.length; i++) {
			var snowflake = snowflakes[i];

			snowflake.xPos = getPosition(50, browserWidth);
			snowflake.yPos = getPosition(50, browserHeight);
		}

		resetPosition = false;
	}

	requestAnimationFrame(moveSnowflakes);
}

//
// This function returns a number between (maximum - offset) and (maximum + offset)
//
function getPosition(offset, size) {
	return Math.round(-1 * offset + Math.random() * (size + 2 * offset));
}

//
// Trigger a reset of all the snowflakes' positions
//
function setResetFlag(e) {
	resetPosition = true;
}

var confetti = {
	maxCount: 150,		//set max confetti count
	speed: 2,			//set the particle animation speed
	frameInterval: 15,	//the confetti animation frame interval in milliseconds
	alpha: 1.0,			//the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
	gradient: false,	//whether to use gradients for the confetti particles
	start: null,		//call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
	stop: null,			//call to stop adding confetti
	toggle: null,		//call to start or stop the confetti animation depending on whether it's already running
	pause: null,		//call to freeze confetti animation
	resume: null,		//call to unfreeze confetti animation
	togglePause: null,	//call to toggle whether the confetti animation is paused
	remove: null,		//call to stop the confetti animation and remove all confetti immediately
	isPaused: null,		//call and returns true or false depending on whether the confetti animation is paused
	isRunning: null		//call and returns true or false depending on whether the animation is running
};

(function() {
	confetti.start = startConfetti;
	confetti.stop = stopConfetti;
	confetti.toggle = toggleConfetti;
	confetti.pause = pauseConfetti;
	confetti.resume = resumeConfetti;
	confetti.togglePause = toggleConfettiPause;
	confetti.isPaused = isConfettiPaused;
	confetti.remove = removeConfetti;
	confetti.isRunning = isConfettiRunning;
	var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	var colors = ["rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"];
	var streamingConfetti = false;
	var animationTimer = null;
	var pause = false;
	var lastFrameTime = Date.now();
	var particles = [];
	var waveAngle = 0;
	var context = null;

	function resetParticle(particle, width, height) {
		particle.color = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.color2 = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = Math.random() * Math.PI;
		return particle;
	}

	function toggleConfettiPause() {
		if (pause)
			resumeConfetti();
		else
			pauseConfetti();
	}

	function isConfettiPaused() {
		return pause;
	}

	function pauseConfetti() {
		pause = true;
	}

	function resumeConfetti() {
		pause = false;
		runAnimation();
	}

	function runAnimation() {
		if (pause)
			return;
		else if (particles.length === 0) {
			context.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
			animationTimer = null;
		} else {
			var now = Date.now();
			var delta = now - lastFrameTime;
			if (!supportsAnimationFrame || delta > confetti.frameInterval) {
				context.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
				updateParticles();
				drawParticles(context);
				lastFrameTime = now - (delta % confetti.frameInterval);
			}
			animationTimer = requestAnimationFrame(runAnimation);
		}
	}

	function startConfetti(timeout, min, max) {
		var width = document.documentElement.clientWidth;
		var height = document.documentElement.clientHeight;
		window.requestAnimationFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback) {
					return window.setTimeout(callback, confetti.frameInterval);
				};
		})();
		var canvas = document.getElementById("confetti-canvas");
		if (canvas === null) {
			canvas = document.createElement("canvas");
			canvas.setAttribute("id", "confetti-canvas");
			canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
			document.body.prepend(canvas);
			canvas.width = width;
			canvas.height = height;
			window.addEventListener("resize", function() {
				canvas.width = document.documentElement.clientWidth;
				canvas.height = document.documentElement.clientHeight;
			}, true);
			context = canvas.getContext("2d");
		} else if (context === null)
			context = canvas.getContext("2d");
		var count = confetti.maxCount;
		if (min) {
			if (max) {
				if (min == max)
					count = particles.length + max;
				else {
					if (min > max) {
						var temp = min;
						min = max;
						max = temp;
					}
					count = particles.length + ((Math.random() * (max - min) + min) | 0);
				}
			} else
				count = particles.length + min;
		} else if (max)
			count = particles.length + max;
		while (particles.length < count)
			particles.push(resetParticle({}, width, height));
		streamingConfetti = true;
		pause = false;
		runAnimation();
		if (timeout) {
			window.setTimeout(stopConfetti, timeout);
		}
	}

	function stopConfetti() {
		streamingConfetti = false;
	}

	function removeConfetti() {
		stop();
		pause = false;
		particles = [];
	}

	function toggleConfetti() {
		if (streamingConfetti)
			stopConfetti();
		else
			startConfetti();
	}

	function isConfettiRunning() {
		return streamingConfetti;
	}

	function drawParticles(context) {
		var particle;
		var x, y, x2, y2;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			x2 = particle.x + particle.tilt;
			x = x2 + particle.diameter / 2;
			y2 = particle.y + particle.tilt + particle.diameter / 2;
			if (confetti.gradient) {
				var gradient = context.createLinearGradient(x, particle.y, x2, y2);
				gradient.addColorStop("0", particle.color);
				gradient.addColorStop("1.0", particle.color2);
				context.strokeStyle = gradient;
			} else
				context.strokeStyle = particle.color;
			context.moveTo(x, particle.y);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}

	function updateParticles() {
		var width = document.documentElement.clientWidth;
		var height = document.documentElement.clientHeight;
		var particle;
		waveAngle += 0.01;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			if (!streamingConfetti && particle.y < -15)
				particle.y = height + 100;
			else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(waveAngle) - 0.5;
				particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if (streamingConfetti && particles.length <= confetti.maxCount)
					resetParticle(particle, width, height);
				else {
					particles.splice(i, 1);
					i--;
				}
			}
		}
	}
})();

var d = new Date();
  // var targetDate = new Date('Feb 03, 2020 00:00:00');
	if (d.getMonth() == new Date('Dec 03, 2020 00:00:00').getMonth()) {
	  $( "span.snowflake" ).show();
	} else {
	  $( "span.snowflake" ).hide();
	}															//June 28																											//June 28
	if (d.getMonth() == new Date('June 28, 2020 00:000:00').getMonth() && d.getDay() == new Date('June 28, 2020 00:00:00').getDay()) {
		confetti.toggle();
		startConfetti();
	} else {

	}
	if (d.getMonth() == new Date('Dec 21, 2020 00:00:00').getMonth() && d.getDay() == new Date('Dec 21, 2020 00:00:00').getDay()) {
		confetti.toggle();
		startConfetti();
	} else {

	}
	if (d.getMonth() == new Date('Oct 31, 2020 00:00:00').getMonth() && d.getDay() == new Date('Oct 31, 2020 00:00:00').getDay()) {
		$( 'span.spooky' ).show();
	} else {
		$( 'span.spooky' ).hide();
	}
