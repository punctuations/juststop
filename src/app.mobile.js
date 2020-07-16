// screen detection

if (window.screen.width > 828) {
  window.location.replace("../");
}

window.onresize = () => {
  if (window.screen.width > 828) {
    window.location.replace("../");
  }
};

// particles --

var confetti = {
  maxCount: 150, //set max confetti count
  speed: 2, //set the particle animation speed
  frameInterval: 15, //the confetti animation frame interval in milliseconds
  alpha: 1.0, //the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
  gradient: false, //whether to use gradients for the confetti particles
  start: null, //call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
  stop: null, //call to stop adding confetti
  toggle: null, //call to start or stop the confetti animation depending on whether it's already running
  pause: null, //call to freeze confetti animation
  resume: null, //call to unfreeze confetti animation
  togglePause: null, //call to toggle whether the confetti animation is paused
  remove: null, //call to stop the confetti animation and remove all confetti immediately
  isPaused: null, //call and returns true or false depending on whether the confetti animation is paused
  isRunning: null, //call and returns true or false depending on whether the animation is running
};

(function () {
  confetti.start = startConfetti;
  confetti.stop = stopConfetti;
  confetti.toggle = toggleConfetti;
  confetti.pause = pauseConfetti;
  confetti.resume = resumeConfetti;
  confetti.togglePause = toggleConfettiPause;
  confetti.isPaused = isConfettiPaused;
  confetti.remove = removeConfetti;
  confetti.isRunning = isConfettiRunning;
  var supportsAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;
  var colors = [
    "rgba(30,144,255,",
    "rgba(107,142,35,",
    "rgba(255,215,0,",
    "rgba(255,192,203,",
    "rgba(106,90,205,",
    "rgba(173,216,230,",
    "rgba(238,130,238,",
    "rgba(152,251,152,",
    "rgba(70,130,180,",
    "rgba(244,164,96,",
    "rgba(210,105,30,",
    "rgba(220,20,60,",
  ];
  var streamingConfetti = false;
  var animationTimer = null;
  var pause = false;
  var lastFrameTime = Date.now();
  var particles = [];
  var waveAngle = 0;
  var context = null;

  function resetParticle(particle, width, height) {
    particle.color =
      colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
    particle.color2 =
      colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
    particle.x = Math.random() * width;
    particle.y = Math.random() * height - height;
    particle.diameter = Math.random() * 10 + 5;
    particle.tilt = Math.random() * 10 - 10;
    particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
    particle.tiltAngle = Math.random() * Math.PI;
    return particle;
  }

  function toggleConfettiPause() {
    if (pause) resumeConfetti();
    else pauseConfetti();
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
    if (pause) return;
    else if (particles.length === 0) {
      context.clearRect(
        0,
        0,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      );
      animationTimer = null;
    } else {
      var now = Date.now();
      var delta = now - lastFrameTime;
      if (!supportsAnimationFrame || delta > confetti.frameInterval) {
        context.clearRect(
          0,
          0,
          document.documentElement.clientWidth,
          document.documentElement.clientHeight
        );
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
    window.requestAnimationFrame = (function () {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          return window.setTimeout(callback, confetti.frameInterval);
        }
      );
    })();
    var canvas = document.getElementById("confetti-canvas");
    if (canvas === null) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("id", "confetti-canvas");
      canvas.setAttribute(
        "style",
        "display:block;z-index:999999;pointer-events:none;position:fixed;top:0"
      );
      document.body.prepend(canvas);
      canvas.width = width;
      canvas.height = height;
      window.addEventListener(
        "resize",
        function () {
          canvas.width = document.documentElement.clientWidth;
          canvas.height = document.documentElement.clientHeight;
        },
        true
      );
      context = canvas.getContext("2d");
    } else if (context === null) context = canvas.getContext("2d");
    var count = confetti.maxCount;
    if (min) {
      if (max) {
        if (min == max) count = particles.length + max;
        else {
          if (min > max) {
            var temp = min;
            min = max;
            max = temp;
          }
          count = particles.length + ((Math.random() * (max - min) + min) | 0);
        }
      } else count = particles.length + min;
    } else if (max) count = particles.length + max;
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
    if (streamingConfetti) stopConfetti();
    else startConfetti();
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
      } else context.strokeStyle = particle.color;
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
      if (!streamingConfetti && particle.y < -15) particle.y = height + 100;
      else {
        particle.tiltAngle += particle.tiltAngleIncrement;
        particle.x += Math.sin(waveAngle) - 0.5;
        particle.y +=
          (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
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

(function () {
  var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  window.requestAnimationFrame = requestAnimationFrame;
})();

var flakes = [],
  canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  flakeCount = 400,
  mX = -100,
  mY = -100;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function snow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < flakeCount; i++) {
    var flake = flakes[i],
      x = mX,
      y = mY,
      minDist = 150,
      x2 = flake.x,
      y2 = flake.y;

    var dist = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y)),
      dx = x2 - x,
      dy = y2 - y;

    if (dist < minDist) {
      var force = minDist / (dist * dist),
        xcomp = (x - x2) / dist,
        ycomp = (y - y2) / dist,
        deltaV = force / 2;

      flake.velX -= deltaV * xcomp;
      flake.velY -= deltaV * ycomp;
    } else {
      flake.velX *= 0.98;
      if (flake.velY <= flake.speed) {
        flake.velY = flake.speed;
      }
      flake.velX += Math.cos((flake.step += 0.05)) * flake.stepSize;
    }

    ctx.fillStyle = "rgba(255,255,255," + flake.opacity + ")";
    flake.y += flake.velY;
    flake.x += flake.velX;

    if (flake.y >= canvas.height || flake.y <= 0) {
      reset(flake);
    }

    if (flake.x >= canvas.width || flake.x <= 0) {
      reset(flake);
    }

    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(snow);
}

function reset(flake) {
  flake.x = Math.floor(Math.random() * canvas.width);
  flake.y = 0;
  flake.size = Math.random() * 3 + 2;
  flake.speed = Math.random() * 1 + 0.5;
  flake.velY = flake.speed;
  flake.velX = 0;
  flake.opacity = Math.random() * 0.5 + 0.3;
}

function init() {
  for (var i = 0; i < flakeCount; i++) {
    var x = Math.floor(Math.random() * canvas.width),
      y = Math.floor(Math.random() * canvas.height),
      size = Math.random() * 3 + 2,
      speed = Math.random() * 1 + 0.5,
      opacity = Math.random() * 0.5 + 0.3;

    flakes.push({
      speed: speed,
      velY: speed,
      velX: 0,
      x: x,
      y: y,
      size: size,
      stepSize: Math.random() / 30,
      step: 0,
      opacity: opacity,
    });
  }

  snow();
}

canvas.addEventListener("mousemove", function (e) {
  (mX = e.clientX), (mY = e.clientY);
});

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const d = new Date();
let e = 0;

if (
  d.getMonth() == new Date("Dec 21, 2020 00:00:00").getMonth() &&
  d.getDate() == new Date("Dec 21, 2020 00:00:00").getDate()
) {
  if (e !== 1) {
    e = 1;
    confetti.toggle();
  }
}
// var targetDate = new Date('Feb 03, 2020 00:00:00'); | old code.
if (d.getMonth() == new Date("Dec 03, 2020 00:00:00").getMonth()) {
  if (e !== 1) {
    e = 1;
    init();
  }
} else {
} //June 28																										  	//June 28
if (
  d.getMonth() == new Date("June 28, 2020 00:000:00").getMonth() &&
  d.getDate() == new Date("June 28, 2020 00:00:00").getDate()
) {
  if (e !== 1) {
    e = 1;
    confetti.toggle();
  }
} else {
}

// card switching

const landCard = document.getElementById("mobile-1");
const langCard = document.getElementById("mobile-2");
const projectCard = document.getElementById("mobile-3");
const contactCard = document.getElementById("mobile-4");

function mobileLang() {
  landCard.classList =
    "container h-screen w-screen text-center relative z-50 rounded-lg hidden";
  langCard.classList =
    "container h-screen w-screen text-center relative z-40 rounded-lg mobile-fadeIn";
}

function mobileProjects() {
  landCard.classList =
    "container h-screen w-screen text-center relative z-50 rounded-lg hidden";
  projectCard.classList =
    "container h-screen w-screen text-center relative z-30 rounded-lg mobile-fadeIn";
}

function mobileContact() {
  landCard.classList =
    "container h-screen w-screen text-center relative z-50 rounded-lg hidden";
  contactCard.classList =
    "container h-screen w-screen text-center relative z-40 rounded-lg mobile-fadeIn";
}

// back function

function back() {
  landCard.classList =
    "container h-screen w-screen text-center relative z-50 rounded-lg mobile-fadeIn";
  langCard.classList =
    "container h-screen w-screen text-center relative z-40 rounded-lg hidden";
  projectCard.classList =
    "container h-screen w-screen text-center relative z-30 rounded-lg hidden";
  contactCard.classList =
    "container h-screen w-screen text-center relative z-40 rounded-lg hidden";
}

// extra info

const bottomInfo = document.getElementsByClassName("bottom-info");
const py = document.querySelector(".py");
const html = document.querySelector(".html");
const css = document.querySelector(".css");
const js = document.querySelector(".js");
const lua = document.querySelector(".lua");
const node = document.querySelector(".node");
const sql = document.querySelector(".sql");
const vue = document.querySelector(".vue");
const utile = document.querySelector(".utile");
const miscord = document.querySelector(".miscord");
const githubProj = document.querySelector(".github-projects");

py.onclick = () => {
  bottomInfo[0].innerHTML =
    "Using <a class='info-link' href='https://docs.python.org/3/' target='_blank'>python</a> I have made tons of projects, an example would be <a class='info-link' href='https://github.com/utilefordiscord' target='https://github.com/utilefordiscord'>Utile</a> the discord bot, and a few others you can see <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
};

html.onclick = () => {
  bottomInfo[0].innerHTML =
    "Using <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/HTML' target='_blank'>HTML</a> I was able to basically layout what I'd call the framework of the website with all the text and things. An example of things I've done with this would be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
};

css.onclick = () => {
  bottomInfo[0].innerHTML =
    "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is like the fancy wallpaper added to a building where html is the blank wall and framework, <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is what makes it look fancy and nice. To see some of my work with <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> it'd be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
};

js.onclick = () => {
  bottomInfo[0].innerHTML =
    "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language with tons of libraries and capabilities to utilize, I used a lot of <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> in this project, overall <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language to see some of it in action go <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
};

lua.onclick = () => {
  bottomInfo[0].innerHTML =
    "<a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> is a language that I used quite a bit, it is a great language, however I have not personally used <a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> in a long time.";
};

node.onclick = () => {
  bottomInfo[0].innerHTML =
    "<a class='info-link' href='https://nodejs.org' target='_blank'>Node.js</a> is a JavaScript runtime environment that executes JavaScript code outside of a web browser. I use it a lot in combination with  <a class='info-link' href='https://dev.mysql.com/doc/' target='_blank'>MySQL</a>.";
};

sql.onclick = () => {
  bottomInfo[0].innerHTML =
    "<a class='info-link' href='https://dev.mysql.com/doc/' target='_blank'>MySQL</a> is the language I choose to program databases.";
};

vue.onclick = () => {
  bottomInfo[0].innerHTML =
    "<a class='info-link' href='https://vuejs.org/' target='_blank'>Vue</a> is a wonderful Javascript framework, it is extremely versatile and I could just keep going on and on, I love it.";
};

utile.onclick = () => {
  bottomInfo[1].innerHTML =
    "The Utile project is a discord bot made by <a class='info-link' href='https://github.com/tilda/' target='_blank'>tilda</a>, <a class='info-link' href='https://github.com/iAlex11/' target='_blank'>alex</a>, and <a class='info-link' href='https://github.com/punctuations/' target='_blank'>me</a>.";
};

miscord.onclick = () => {
  bottomInfo[1].innerHTML =
    'The Miscord Project is a project that was developed during discord\'s <a class="info-link" href="https://blog.discord.com/discord-community-hack-week-category-winners-bd0364360f92" target=\'_blank\'>Hack Week</a>, which is the reason we made this other discord bot, Miscord has lots of features which you can see <a class="info-link" href="https://miscord.utile.cf/" target=\'_blank\'>here</a>. Miscord was made by <a class="info-link" href="https://github.com/ifisq" target=\'_blank\'>blue</a>, <a class="info-link" href="https://github.com/iAlex11/" target=\'_blank\'>alex</a>, <a class="info-link" href="https://github.com/tilda/" target=\'_blank\'>tilda</a>, and <a class="info-link" href="https://github.com/punctuations/" target=\'_blank\'>me</a>.';
};

githubProj.onclick = () => {
  bottomInfo[1].innerHTML =
    "Using github I have tons of my projects open source and easily avaliabe to me, I have most if not all of my projects hosted <a class='info-link' href='https://github.com/punctuations/' target='_blank'>there</a>.";
};

const parseResponse = (res) => {
  const track = res.recenttracks.track[0];
  const artist = track.artist["#text"];
  const image = track.image[3]["#text"];
  const name = track.name;
  const url = track.url;

  const np = track["@attr"] ? track["@attr"]["nowplaying"] === "true" : false;

  return {
    artist,
    name,
    image,
    np,
    url,
  };
};

const setResponse = (res) => {
  if (res.np === true) {
    document.querySelector("#spotify").innerHTML = `<img
          class="absolute right-0 top-0 rounded-full mr-74 grad-border"
          width="32"
          height="32"
          onclick="window.open('${res.url}','_blank');"
          src="${res.image}"
          alt="${res.name}"
          title="${res.name} - ${res.artist}"
        />
        <!-- credit goes to jack for providing this solution for grabbing spotify tracks, great guy https://lafond.dev/ -->`;
  } else {
    document.querySelector("#spotify").innerHTML = ``;
  }
};

const getSong = () => {
  fetch(
    "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=alloutofmatt&api_key=d24f709bb63d11301924e2738b3607ef&format=json&limit=1"
  )
    .then((res) => res.json())
    .then(parseResponse)
    .then(setResponse);
};

setInterval(getSong, 15 * 1000);
getSong();
