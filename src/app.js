// mobile detection -----------------------------------------------------------------------------------------------

if (window.screen.width <= 828) {
  window.location.replace("/mobile/");
}

window.onresize = () => {
  if (window.screen.width <= 828) {
    window.location.replace("/mobile/");
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
  d.getDay() == new Date("Dec 21, 2020 00:00:00").getDay()
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
  d.getDay() == new Date("June 28, 2020 00:00:00").getDay()
) {
  if (e !== 1) {
    e = 1;
    confetti.toggle();
  }
} else {
}

// end of date mechanics, start of arg --------------------------------------------------------------------------

function hintScript() {
  let hintAdd = document.getElementById("hint-text");
  hintAdd.classList.add(" hint-active");
}

//end of arg, start of page load mechanics -----------------------------------------------------------------------

function seePage() {
  let r = Math.floor(Math.random() * 1001);
  const profilePicture = document.getElementById("profile-picture");

  if (r == 86) {
    profilePicture.classList = "h-24 w-32 rounded-full mx-auto";
    profilePicture.src =
      "https://thumbs.gfycat.com/HonorablePhysicalKatydid-size_restricted.gif";
  } else {
  }
  sideHover();
}

// end of page load mechanics, start of theme mechanics -----------------------------------------------------------

const themeButton = document.querySelector("#theme-switcher");
const html = document.querySelector("html");
const moon = document.querySelector(".fa-moon");

let themes;

if (localStorage.getItem("theme") == "light") {
  themes = 2;
} else {
  themes = 1;
}

themeButton.onclick = () => {
  if (themes == 1) {
    themes = 2;
    html.classList = "light";
    localStorage.setItem("theme", "light");
    moon.classList = "fas fa-moon";
    if (i == 1) {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-2",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-3",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-4",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-1",
            background: colour(false, false, false, true),
          },
          0
        );
    } else if (i == 2) {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-3",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-4",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-1",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-2",
            background: colour(false, false, false, true),
          },
          0
        );
    } else if (i == 3) {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-4",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-1",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-2",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-3",
            background: colour(false, false, false, true),
          },
          0
        );
    } else {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-1",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-2",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-3",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-4",
            background: colour(false, false, false, true),
          },
          0
        );
    }
  } else if (themes == 2) {
    themes = 1;
    html.classList = "dark";
    localStorage.setItem("theme", "dark");
    moon.classList = "far fa-moon";
    if (i == 1) {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-2",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-3",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-4",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-1",
            background: colour(false, false, false, true),
          },
          0
        );
    } else if (i == 2) {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-3",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-4",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-1",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-2",
            background: colour(false, false, false, true),
          },
          0
        );
    } else if (i == 3) {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-4",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-1",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-2",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-3",
            background: colour(false, false, false, true),
          },
          0
        );
    } else {
      const tl = anime.timeline();
      tl.add(
        {
          targets: "#card-1",
          background: colour(true),
        },
        0
      )
        .add(
          {
            targets: "#card-2",
            background: colour(false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-3",
            background: colour(false, false, true),
          },
          0
        )
        .add(
          {
            targets: "#card-4",
            background: colour(false, false, false, true),
          },
          0
        );
    }
  } else {
  }
};

// Apply the cached theme on reload

const theme = localStorage.getItem("theme");

if (theme == "dark") {
  html.classList = "dark";
  moon.classList = "far fa-moon";
} else if (theme == "light") {
  html.classList = "light";
  moon.classList = "fas fa-moon";
}

// end of theme mechanics, start of load mechanics ----------------------------------------------------------------

const loadingScreen = document.getElementById("loading");

window.onload = function loadingSequence() {
  const tl = anime.timeline();
  tl.add(
    {
      targets: "#comp-3",
      translateY: "-35",
      duration: "0900",
    },
    "-=550"
  )
    .add(
      {
        targets: "#comp-2",
        translateX: "32",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-1",
        translateX: "29",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-3",
        translateX: "-35",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-2",
        translateY: "-35",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-1",
        translateX: "64",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-3",
        translateY: "0",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-2",
        translateX: "-2.5",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-1",
        translateY: "-35",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-3",
        translateX: "0",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-2",
        translateY: "0",
        duration: "0900",
      },
      "-=550"
    )
    .add(
      {
        targets: "#comp-1",
        translateX: "30",
        duration: "0900",
      },
      "-=550"
    );
  tl.add(
    {
      targets: "#loading",
      opacity: "0",
    },
    "-=615"
  );
  this.setTimeout(function () {
    loadingScreen.classList = "pointer-events-none";
    seePage();
  }, 3600);
};

// loading mechanics above

let i;

const firstCardBtn = document.querySelector(".buttons");
const returnBtn = document.getElementsByClassName("return");
const flipBtn = document.querySelector(".flip");
const light = document.querySelector("html");

function colour(first, second, third, fourth) {
  if (first == true) {
    if (light.classList == "light") {
      return "#dedede";
    } else {
      return "#212121";
    }
  } else if (second == true) {
    if (light.classList == "light") {
      return "#c7c7c7";
    } else {
      return "#1d1d1d";
    }
  } else if (third == true) {
    if (light.classList == "light") {
      return "#b3b3b3";
    } else {
      return "#1a1a1a";
    }
  } else if (fourth == true) {
    if (light.classList == "light") {
      return "#a1a1a1";
    } else {
      return "#171717";
    }
  }
}

function langBtn() {
  const tl = anime.timeline();
  i = 1;
  firstCardBtn.classList += " pointer-events-none";
  returnBtn[0].classList += " pointer-events-none";
  flipBtn.classList += " pointer-events-none";
  tl.add({
    // initial throw
    targets: "#card-1",
    translateX: randVal(),
    translateY: "-500",
    rotate: randRotate(),
    opacity: "0",
    duration: "2600",
  })
    .add(
      {
        // move into place
        targets: "#card-2, #card-3, #card-4",
        translateX: "-10",
        translateY: "10",
        duration: "1600",
        delay: anime.stagger(150),
      },
      "-=2300"
    )
    .add(
      {
        targets: "#card-2",
        background: colour(true),
        zIndex: "4",
      },
      "-=1950"
    )
    .add(
      {
        targets: "#card-3",
        background: colour(false, true),
        zIndex: "3",
      },
      "-=1850"
    )
    .add(
      {
        targets: "#card-4",
        background: colour(false, false, true),
        zIndex: "2",
      },
      "-=1750"
    )
    .add(
      {
        targets: "#card-1",
        opacity: "0",
        rotate: "0",
        translateX: "40",
        translateY: "-90",
        background: colour(false, false, false, true),
        zIndex: "1",
        easing: "linear",
        duration: "0001",
      },
      "-=1750"
    )
    .add({
      targets: "#card-1",
      translateY: "-40",
      opacity: "1",
    })
    .add({
      targets: ".return",
      opacity: "1",
    })
    .add(
      {
        targets: ".flip",
        opacity: "1",
      },
      "-=1000"
    );
  setTimeout(function () {
    returnBtn[0].classList = "return";
    flipBtn.classList = "flip";
  }, 3600);
}

function projBtn() {
  const tl = anime.timeline();
  i = 2;
  firstCardBtn.classList += " pointer-events-none";
  returnBtn[1].classList += " pointer-events-none";
  tl.add({
    // initial throw
    targets: "#card-1",
    translateX: randVal(),
    translateY: "-500",
    rotate: randRotate(),
    opacity: "0",
    duration: "2600",
  })
    .add(
      {
        targets: "#card-2",
        translateX: randVal(),
        translateY: "-500",
        rotate: randRotate(),
        opacity: "0",
        duration: "2600",
      },
      "-=2450"
    )
    .add(
      {
        // move into place
        targets: "#card-3, #card-4",
        translateX: "-25",
        translateY: "30",
        duration: "1600",
        delay: anime.stagger(150),
      },
      "-=2300"
    )
    .add(
      {
        targets: "#card-3",
        background: colour(true),
        zIndex: "4",
      },
      "-=1950"
    )
    .add(
      {
        targets: "#card-4",
        background: colour(false, true),
        zIndex: "3",
      },
      "-=1850"
    )
    .add(
      {
        targets: "#card-1",
        opacity: "0",
        rotate: "0",
        translateX: "25",
        translateY: "-90",
        background: colour(false, false, true),
        zIndex: "2",
        easing: "linear",
        duration: "0001",
      },
      "-=1650"
    )
    .add(
      {
        targets: "#card-2",
        opacity: "0",
        rotate: "0",
        translateX: "25",
        translateY: "-90",
        background: colour(false, false, false, true),
        zIndex: "1",
        easing: "linear",
        duration: "0001",
      },
      "-=1650"
    )
    .add({
      targets: "#card-1",
      translateY: "-23",
      opacity: "1",
    })
    .add({
      targets: "#card-2",
      translateY: "-20",
      opacity: "1",
    })
    .add({
      targets: ".return",
      opacity: "1",
    });
  setTimeout(function () {
    returnBtn[1].classList = "return";
  }, 3600);
}

function contactBtn() {
  i = 3;
  const tl = anime.timeline();
  firstCardBtn.classList += " pointer-events-none";
  returnBtn[2].classList += " pointer-events-none";
  tl.add({
    targets: "#card-1",
    translateX: randVal(),
    translateY: "-500",
    rotate: randRotate(),
    opacity: "0",
    duration: "2600",
  })
    .add(
      {
        targets: "#card-2",
        translateX: randVal(),
        translateY: "-500",
        rotate: randRotate(),
        opacity: "0",
        duration: "2600",
      },
      "-=2450"
    )
    .add(
      {
        targets: "#card-3",
        translateX: randVal(),
        translateY: "-500",
        rotate: randRotate(),
        opacity: "0",
        duration: "2600",
      },
      "-=2450"
    )
    .add(
      {
        // move into place
        targets: "#card-4",
        translateX: "-25",
        translateY: "30",
        duration: "1600",
      },
      "-=2300"
    )
    .add(
      {
        targets: "#card-4",
        background: colour(true),
        zIndex: "4",
      },
      "-=1950"
    )
    .add(
      {
        targets: "#card-1",
        opacity: "0",
        rotate: "0",
        translateX: "23",
        translateY: "-90",
        background: colour(false, true),
        zIndex: "3",
        easing: "linear",
        duration: "0001",
      },
      "-=1550"
    )
    .add(
      {
        targets: "#card-2",
        opacity: "0",
        rotate: "0",
        translateX: "20",
        translateY: "-90",
        background: colour(false, false, true),
        zIndex: "2",
        easing: "linear",
        duration: "0001",
      },
      "-=1550"
    )
    .add(
      {
        targets: "#card-3",
        opacity: "0",
        rotate: "0",
        translateX: "20",
        translateY: "-90",
        background: colour(false, false, false, true),
        zIndex: "1",
        easing: "linear",
        duration: "0001",
      },
      "-=1550"
    )
    .add({
      targets: "#card-1",
      translateY: "-23",
      opacity: "1",
    })
    .add({
      targets: "#card-2",
      translateY: "-20",
      opacity: "1",
    })
    .add({
      targets: "#card-3",
      translateY: "-20",
      opacity: "1",
    })
    .add({
      targets: ".return",
      opacity: "1",
    });
  setTimeout(function () {
    returnBtn[2].classList = "return";
  }, 3600);
}

let randr;

function randVal() {
  let rand = Math.round(Math.random());
  randr = rand;
  return rand ? "500" : "-500";
}

function randRotate() {
  return randr ? "90" : "-90";
}

function homeCard() {
  returnBtn[0].classList += " pointer-events-none";
  returnBtn[1].classList += " pointer-events-none";
  returnBtn[2].classList += " pointer-events-none";
  flipBtn.classList += " pointer-events-none";
  if (i == 1) {
    i = 0;
    const tl = anime.timeline();
    tl.add({
      targets: "#card-2",
      translateX: randVal(),
      translateY: "-500",
      rotate: randRotate(),
      opacity: "0",
      duration: "2600",
    })
      .add(
        {
          targets: "#card-3",
          translateX: randVal(),
          translateY: "-500",
          rotate: randRotate(),
          opacity: "0",
          duration: "2600",
        },
        "-=2450"
      )
      .add(
        {
          targets: "#card-4",
          translateX: randVal(),
          translateY: "-500",
          rotate: randRotate(),
          opacity: "0",
          duration: "2600",
        },
        "-=2450"
      )
      .add(
        {
          // move into place
          targets: "#card-1",
          translateX: "0",
          translateY: "0",
          duration: "1600",
        },
        "-=2300"
      )
      .add(
        {
          targets: "#card-1",
          background: colour(true),
          zIndex: "4",
        },
        "-=1950"
      )
      .add(
        {
          targets: "#card-2",
          opacity: "0",
          rotate: "0",
          translateX: "0",
          translateY: "-90",
          background: colour(false, true),
          zIndex: "3",
          easing: "linear",
          duration: "0001",
        },
        "-=1550"
      )
      .add(
        {
          targets: "#card-3",
          opacity: "0",
          rotate: "0",
          translateX: "0",
          translateY: "-90",
          background: colour(false, false, true),
          zIndex: "2",
          easing: "linear",
          duration: "0001",
        },
        "-=1550"
      )
      .add(
        {
          targets: "#card-4",
          opacity: "0",
          rotate: "0",
          translateX: "0",
          translateY: "-90",
          background: colour(false, false, false, true),
          zIndex: "1",
          easing: "linear",
          duration: "0001",
        },
        "-=1550"
      )
      .add({
        targets: "#card-2",
        translateY: "0",
        opacity: "1",
      })
      .add({
        targets: "#card-3",
        translateY: "0",
        opacity: "1",
      })
      .add({
        targets: "#card-4",
        translateY: "0",
        opacity: "1",
      })
      .add({
        targets: ".return",
        opacity: "0",
      })
      .add(
        {
          targets: ".flip",
          opacity: "0",
        },
        "-=1000"
      );
    setTimeout(function () {
      firstCardBtn.classList =
        "mt-4 text-left align-center overflow-auto buttons";
    }, 5000);
  } else if (i == 2) {
    i = 0;
    const tl = anime.timeline();
    tl.add({
      targets: "#card-3",
      translateX: randVal(),
      translateY: "-500",
      rotate: randRotate(),
      opacity: "0",
      duration: "2600",
    })
      .add(
        {
          targets: "#card-4",
          translateX: randVal(),
          translateY: "-500",
          rotate: randRotate(),
          opacity: "0",
          duration: "2600",
        },
        "-=2450"
      )
      .add(
        {
          // move into place
          targets: "#card-1, #card-2",
          translateX: "0",
          translateY: "0",
          duration: "1600",
          delay: anime.stagger(100),
        },
        "-=2300"
      )
      .add(
        {
          targets: "#card-1",
          background: colour(true),
          zIndex: "4",
        },
        "-=1950"
      )
      .add(
        {
          targets: "#card-2",
          background: colour(false, true),
          zIndex: "3",
        },
        "-=1950"
      )
      .add(
        {
          targets: "#card-3",
          opacity: "0",
          rotate: "0",
          translateX: "0",
          translateY: "-90",
          background: colour(false, false, true),
          zIndex: "2",
          easing: "linear",
          duration: "0001",
        },
        "-=1550"
      )
      .add(
        {
          targets: "#card-4",
          opacity: "0",
          rotate: "0",
          translateX: "0",
          translateY: "-90",
          background: colour(false, false, false, true),
          zIndex: "1",
          easing: "linear",
          duration: "0001",
        },
        "-=1550"
      )
      .add({
        targets: "#card-3",
        translateY: "0",
        opacity: "1",
      })
      .add({
        targets: "#card-4",
        translateY: "0",
        opacity: "1",
      })
      .add({
        targets: ".return",
        opacity: "0",
      });
    setTimeout(function () {
      firstCardBtn.classList =
        "mt-4 text-left align-center overflow-auto buttons";
    }, 5000);
  } else if (i == 3) {
    i = 0;
    const tl = anime.timeline();
    tl.add({
      targets: "#card-4",
      translateX: randVal(),
      translateY: "-500",
      rotate: randRotate(),
      opacity: "0",
      duration: "2600",
    })
      .add(
        {
          // move into place
          targets: "#card-1, #card-2, #card-3",
          translateX: "0",
          translateY: "0",
          duration: "1600",
          delay: anime.stagger(100),
        },
        "-=2300"
      )
      .add(
        {
          targets: "#card-1",
          background: colour(true),
          zIndex: "4",
        },
        "-=1950"
      )
      .add(
        {
          targets: "#card-2",
          background: colour(false, true),
          zIndex: "3",
        },
        "-=1950"
      )
      .add(
        {
          targets: "#card-3",
          background: colour(false, false, true),
          zIndex: "2",
        },
        "-=1950"
      )
      .add(
        {
          targets: "#card-4",
          opacity: "0",
          rotate: "0",
          translateX: "0",
          translateY: "-90",
          background: colour(false, false, false, true),
          zIndex: "1",
          easing: "linear",
          duration: "0001",
        },
        "-=1550"
      )
      .add({
        targets: "#card-4",
        translateY: "0",
        opacity: "1",
      })
      .add({
        targets: ".return",
        opacity: "0",
        easing: "easeInOutSine",
      });
    setTimeout(function () {
      firstCardBtn.classList =
        "mt-4 text-left align-center overflow-auto buttons";
    }, 5000);
  }
}

// card mechanics above

let flipped = false;
const cardFlip = document.querySelector("#card-flip");
const navButtons = document.querySelector("#nav-buttons");

function langFlip() {
  switch (flipped) {
    case true:
      flipped = false;
      cardFlip.innerHTML =
        '<div><a class="block py-button" href="#"><i class="fab fa-python"></i>python</a></div>\n<div><a class="block html-button" href="#"><i class="fab fa-html5"></i>html</a></div>\n<div><a class="block css-button" href="#"><i class="fab fa-css3-alt"></i>css</a></div>\n<div><a class="block js-button" href="#"><i class="fab fa-js-square"></i>javascript</a></div>\n<div><a class="block lua-button" href="#"><i class="fas fa-file-alt"></i>lua</a></div>';
      navButtons.classList = "mt-8 card-bottom text-left grid overflow-auto";
      sideHover();
      break;
    case false:
      flipped = true;
      cardFlip.innerHTML =
        "<div><a class='block node-button' href='#'><i class='fab fa-node-js'></i>node.js</a></div>\n<div><a class='block sql-button' href='#'><i class='fas fa-database'></i>SQL</a></div>\n<div><a class='block vue-button' href='#'><i class='fab fa-vuejs'></i>Vue</a></div>";
      navButtons.classList = "mt-24 card-bottom text-left grid overflow-auto";
      sideHover();
      break;
  }
}

// flip mechanics above

function tooltipLeft() {
  const tl = anime.timeline();
  tl.add({
    targets: ".tooltip-left-visible",
    opacity: "0.4",
  });
}

function tooltipRight() {
  const tl = anime.timeline();
  tl.add({
    targets: ".tooltip-right-visible",
    opacity: "0.4",
  });
}

function unTooltip() {
  const tl = anime.timeline();
  tl.add({
    targets: ".tooltip-right-visible, .tooltip-left-visible",
    opacity: "0",
    easing: "easeInOutSine",
  });
}

// 404 page return ----------------------------------------------------------------------------------------------

function goBack() {
  window.history.back();
}

//arg -------------------------------------------------------------------------------------------------------------

const lightbulb = document.getElementById("hint");
const hintMessage = document.querySelector(".hint-inner");
let hintUse = 0;

function showHint() {
  const tl = anime.timeline();
  if (hintUse == 0) {
    lightbulb.classList = "fas fa-lightbulb cursor-not-allowed";
    tl.add({
      targets: ".hint-message",
      opacity: "1",
    });
    hintMessage.innerHTML = "F12";
    hintMessage.classList = "hint-inner cursor-default";
  } else {
  }
}

// Side info ------------------------------------------------------------------------------------------------------
function sideHover() {
  const sideDesc = document.getElementById("info");
  if (!flipped) {
    const utButton = document.querySelector(".utile-button");
    const misButton = document.querySelector(".miscord-button");
    const gitPrButton = document.querySelector(".github-proj-button");
    const pyButton = document.querySelector(".py-button");
    const htmlButton = document.querySelector(".html-button");
    const cssButton = document.querySelector(".css-button");
    const jsButton = document.querySelector(".js-button");
    const luaButton = document.querySelector(".lua-button");

    utButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "The Utile project is a discord bot made by <a class='info-link' href='https://github.com/tilda/' target='_blank'>tilda</a>, <a class='info-link' href='https://github.com/iAlex11/' target='_blank'>alex</a>, and <a class='info-link' href='https://github.com/punctuations/' target='_blank'>me</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    utButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "The Utile project is a discord bot made by <a class='info-link' href='https://github.com/tilda/' target='_blank'>tilda</a>, <a class='info-link' href='https://github.com/iAlex11/' target='_blank'>alex</a>, and <a class='info-link' href='https://github.com/punctuations/' target='_blank'>me</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    utButton.onmouseout = () => {
      sideHide();
    };

    misButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        'The Miscord Project is a project that was developed during discord\'s <a class="info-link" href="https://blog.discord.com/discord-community-hack-week-category-winners-bd0364360f92" target=\'_blank\'>Hack Week</a>, which is the reason we made this other discord bot, Miscord has lots of features which you can see <a class="info-link" href="https://miscord.utile.cf/" target=\'_blank\'>here</a>. Miscord was made by <a class="info-link" href="https://github.com/ifisq" target=\'_blank\'>blue</a>, <a class="info-link" href="https://github.com/iAlex11/" target=\'_blank\'>alex</a>, <a class="info-link" href="https://github.com/tilda/" target=\'_blank\'>tilda</a>, and <a class="info-link" href="https://github.com/punctuations/" target=\'_blank\'>me</a>.';
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    misButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        'The Miscord Project is a project that was developed during discord\'s <a class="info-link" href="https://blog.discord.com/discord-community-hack-week-category-winners-bd0364360f92" target=\'_blank\'>Hack Week</a>, which is the reason we made this other discord bot, Miscord has lots of features which you can see <a class="info-link" href="https://miscord.utile.cf/" target=\'_blank\'>here</a>. Miscord was made by <a class="info-link" href="https://github.com/ifisq" target=\'_blank\'>blue</a>, <a class="info-link" href="https://github.com/iAlex11/" target=\'_blank\'>alex</a>, <a class="info-link" href="https://github.com/tilda/" target=\'_blank\'>tilda</a>, and <a class="info-link" href="https://github.com/punctuations/" target=\'_blank\'>me</a>.';
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    misButton.onmouseout = () => {
      sideHide();
    };

    gitPrButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "Using github I have tons of my projects open source and easily avaliabe to me, I have most if not all of my projects hosted <a class='info-link' href='https://github.com/punctuations/' target='_blank'>there</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    gitPrButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "Using github I have tons of my projects open source and easily avaliabe to me, I have most if not all of my projects hosted <a class='info-link' href='https://github.com/punctuations/' target='_blank'>there</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    gitPrButton.onmouseout = () => {
      sideHide();
    };

    pyButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "Using <a class='info-link' href='https://docs.python.org/3/' target='_blank'>python</a> I have made tons of projects, an example would be <a class='info-link' href='https://github.com/utilefordiscord' target='https://github.com/utilefordiscord'>Utile</a> the discord bot, and a few others you can see <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    pyButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "Using <a class='info-link' href='https://docs.python.org/3/' target='_blank'>python</a> I have made tons of projects, an example would be <a class='info-link' href='https://github.com/utilefordiscord' target='https://github.com/utilefordiscord'>Utile</a> the discord bot, and a few others you can see <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    pyButton.onmouseout = () => {
      sideHide();
    };

    htmlButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "Using <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/HTML' target='_blank'>HTML</a> I was able to basically layout what I'd call the framework of the website with all the text and things. An example of things I've done with this would be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    htmlButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "Using <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/HTML' target='_blank'>HTML</a> I was able to basically layout what I'd call the framework of the website with all the text and things. An example of things I've done with this would be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    htmlButton.onmouseout = () => {
      sideHide();
    };

    cssButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is like the fancy wallpaper added to a building where html is the blank wall and framework, <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is what makes it look fancy and nice. To see some of my work with <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> it'd be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    cssButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is like the fancy wallpaper added to a building where html is the blank wall and framework, <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is what makes it look fancy and nice. To see some of my work with <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> it'd be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    cssButton.onmouseout = () => {
      sideHide();
    };

    jsButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language with tons of libraries and capabilities to utilize, I used a lot of <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> in this project, overall <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language to see some of it in action go <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    jsButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language with tons of libraries and capabilities to utilize, I used a lot of <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> in this project, overall <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language to see some of it in action go <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    jsButton.onmouseout = () => {
      sideHide();
    };

    luaButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> is a language that I used quite a bit, it is a great language, however I have not personally used <a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> in a long time.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    luaButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> is a language that I used quite a bit, it is a great language, however I have not personally used <a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> in a long time.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    luaButton.onmouseout = () => {
      sideHide();
    };
  } else {
    const nodeButton = document.querySelector(".node-button");
    const sqlButton = document.querySelector(".sql-button");
    const vueButton = document.querySelector(".vue-button");

    nodeButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://nodejs.org' target='_blank'>Node.js</a> is a JavaScript runtime environment that executes JavaScript code outside of a web browser. I use it a lot in combination with  <a class='info-link' href='https://dev.mysql.com/doc/' target='_blank'>SQL</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    nodeButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://nodejs.org' target='_blank'>Node.js</a> is a JavaScript runtime environment that executes JavaScript code outside of a web browser. I use it a lot in combination with  <a class='info-link' href='https://dev.mysql.com/doc/' target='_blank'>SQL</a>.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    nodeButton.onmouseout = () => {
      sideHide();
    };

    sqlButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://dev.mysql.com/doc/' target='_blank'>SQL</a> is the language I choose to program databases.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    sqlButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://dev.mysql.com/doc/' target='_blank'>SQL</a> is the language I choose to program databases.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    sqlButton.onmouseout = () => {
      sideHide();
    };

    vueButton.onclick = () => {
      override = 1;
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://vuejs.org/' target='_blank'>Vue</a> is a wonderful Javascript framework, it is extremely versatile and I could just keep going on and on, I love it.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    vueButton.onmouseover = () => {
      const tl = anime.timeline();
      sideDesc.innerHTML =
        "<a class='info-link' href='https://vuejs.org/' target='_blank'>Vue</a> is a wonderful Javascript framework, it is extremely versatile and I could just keep going on and on, I love it.";
      tl.add({
        targets: "#side-info",
        opacity: "1",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-auto";
    };

    vueButton.onmouseout = () => {
      sideHide();
    };
  }
  const sideExit = document.querySelector(".side-exit");
  let override = 0;

  sideExit.onclick = () => {
    override = 0;
    const tl = anime.timeline();
    tl.add({
      targets: "#side-info",
      opacity: "0",
      easing: "easeInOutSine",
    });
    sideExit.classList =
      "fas fa-times text-right cursor-pointer side-exit pointer-events-none";
    sideDesc.classList =
      "text-sm cursor-default cursor-pointer pointer-events-none";
  };

  function sideHide() {
    if (override == 0) {
      const tl = anime.timeline();
      tl.add({
        targets: "#side-info",
        opacity: "0",
        easing: "easeInOutSine",
      });
      sideExit.classList =
        "fas fa-times text-right cursor-pointer side-exit pointer-events-none";
      sideDesc.classList =
        "text-sm cursor-default cursor-pointer pointer-events-none";
    } else if (override !== 0) {
    }
  }
}
