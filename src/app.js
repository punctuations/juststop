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

window.onload = function seePage() {
  let r = Math.floor(Math.random() * 1001);
  const profilePicture = document.getElementById("profile-picture");

  if (r == 86) {
    profilePicture.classList = "h-24 w-32 rounded-full mx-auto";
    profilePicture.src =
      "https://thumbs.gfycat.com/HonorablePhysicalKatydid-size_restricted.gif";
  } else {
    console.log("better luck next time!");
  }
};

// end of page load mechanics, start of theme mechanics -----------------------------------------------------------

const themeButton = document.getElementById("theme-switcher");
const body = document.body;

function themeSwitcher() {
  themeButton.onclick = () => {
    if (body.classList == "dark") {
      body.classList.replace("light", "dark");
      localStorage.setItem("theme", "dark");
    } else if (body.classList == "light") {
      body.classList.replace("dark", "light");
      localStorage.setItem("theme", "light");
    } else {
      break;
    }
  };
}

// Apply the cached theme on reload

const theme = localStorage.getItem("theme");
const isDark = localStorage.getItem("isDark");

// end of theme mechanics, start of card mechanics ----------------------------------------------------------------

let i;

function langButton() {
  i = 1;
  startCardThrow();
}

function projButton() {
  i = 2;
  startCardThrow();
}

function contactButton() {
  i = 3;
  startCardThrow();
}

const firstCard = document.getElementById("card-1");
const secondCard = document.getElementById("card-2");
const thirdCard = document.getElementById("card-3");
const fourthCard = document.getElementById("card-4");
const returnArrow = document.getElementsByClassName("return");
const cardFlip = document.getElementsByClassName("flip");

function startCardThrow() {
  //50 50 chance for different animation
  let fir = Math.floor(Math.random() * 2);
  let sr = Math.floor(Math.random() * 2);
  let tr = Math.floor(Math.random() * 2);
  let fur = Math.floor(Math.random() * 2);

  const tl = new TimelineMax();

  if (i == 1) {
    //if lang was clicked
    if (fir == 1) {
      // left
      tl.to(firstCard, 0.6, {
        x: -500,
        y: -500,
        rotation: -90,
        opacity: 0,
      });
      tl.to(
        secondCard,
        0.3,
        {
          x: -10,
          y: 10,
          backgroundColor: "#212121",
        },
        "-=0.4"
      )
        .to(
          thirdCard,
          0.3,
          {
            x: -10,
            y: 10,
            backgroundColor: "#1D1D1D",
          },
          "-=0.3"
        )
        .to(
          fourthCard,
          0.3,
          {
            x: -10,
            y: 10,
            backgroundColor: "#1A1A1A",
          },
          "-=0.2"
        );

      tl.to(
        firstCard,
        0.5,
        {
          rotation: 0,
          x: 40,
          y: -90,
          backgroundColor: "#171717",
        },
        "-=0.1"
      )
        .to(firstCard, 0.4, {
          y: -40,
          opacity: 1,
        })
        .to(returnArrow[0], 0.2, {
          opacity: 1,
        })
        .to(cardFlip[0], 0.2, {
          opacity: 1,
        });
      setTimeout(function () {
        $("#card-1").css("z-index", "0");
      }, 600);
    } else {
      // right
      tl.to(firstCard, 0.6, {
        x: 500,
        y: -500,
        rotation: 90,
        opacity: 0,
      });

      tl.to(
        secondCard,
        0.3,
        {
          x: -10,
          y: 10,
          backgroundColor: "#212121",
        },
        "-=0.4"
      )
        .to(
          thirdCard,
          0.3,
          {
            x: -10,
            y: 10,
            backgroundColor: "#1D1D1D",
          },
          "-=0.3"
        )
        .to(
          fourthCard,
          0.3,
          {
            x: -10,
            y: 10,
            backgroundColor: "#1A1A1A",
          },
          "-=0.2"
        );

      tl.to(
        firstCard,
        0.5,
        {
          rotation: 0,
          x: 40,
          y: -90,
          backgroundColor: "#171717",
        },
        "-=0.1"
      )
        .to(firstCard, 0.4, {
          y: -40,
          opacity: 1,
        })
        .to(returnArrow[0], 0.2, {
          opacity: 1,
        })
        .to(cardFlip[0], 0.2, {
          opacity: 1,
        });
      setTimeout(function () {
        $("#card-1").css("z-index", "0");
      }, 600);
    }
  } else if (i == 2) {
    //if proj was clicked
    if (fir == 1) {
      //left
      tl.to(firstCard, 0.6, {
        x: -500,
        y: -500,
        rotation: -90,
        opacity: 0,
      });
      if (sr == 1) {
        //left
        tl.to(
          secondCard,
          0.6,
          {
            x: -500,
            y: -500,
            rotation: -90,
            opacity: 0,
          },
          "-=0.4"
        );
      } else {
        //right
        tl.to(
          secondCard,
          0.6,
          {
            x: 500,
            y: -500,
            rotation: 90,
            opacity: 0,
          },
          "-=0.4"
        );
      }
      tl.to(
        thirdCard,
        0.3,
        {
          x: -25,
          y: 30,
          backgroundColor: "#212121",
        },
        "-=0.3"
      ).to(
        fourthCard,
        0.3,
        {
          x: -25,
          y: 25,
          backgroundColor: "#1D1D1D",
        },
        "-=0.2"
      );

      tl.to(
        firstCard,
        0.5,
        {
          rotation: 0,
          x: 25,
          y: -90,
          backgroundColor: "#1A1A1A",
        },
        "-=0.1"
      ).to(firstCard, 0.4, {
        y: -30,
        opacity: 1,
      });
      tl.to(
        secondCard,
        0.5,
        {
          rotation: 0,
          x: 25,
          y: -90,
          backgroundColor: "#171717",
        },
        "-=0.1"
      )
        .to(secondCard, 0.4, {
          y: -25,
          opacity: 1,
        })
        .to(returnArrow[1], 0.2, {
          opacity: 1,
        });
      setTimeout(function () {
        $("#card-3").css("z-index", "3");
        $("#card-4").css("z-index", "2");
        $("#card-1").css("z-index", "1");
        $("#card-2").css("z-index", "0");
      }, 600);
    } else {
      //right
      tl.to(firstCard, 0.6, {
        x: 500,
        y: -500,
        rotation: 90,
        opacity: 0,
      });
      if (sr == 1) {
        //left
        tl.to(
          secondCard,
          0.6,
          {
            x: -500,
            y: -500,
            rotation: -90,
            opacity: 0,
          },
          "-=0.4"
        );
      } else {
        //right
        tl.to(
          secondCard,
          0.6,
          {
            x: 500,
            y: -500,
            rotation: 90,
            opacity: 0,
          },
          "-=0.4"
        );
      }
      tl.to(
        thirdCard,
        0.3,
        {
          x: -25,
          y: 30,
          backgroundColor: "#212121",
        },
        "-=0.3"
      ).to(
        fourthCard,
        0.3,
        {
          x: -25,
          y: 25,
          backgroundColor: "#1D1D1D",
        },
        "-=0.2"
      );

      tl.to(
        firstCard,
        0.5,
        {
          rotation: 0,
          x: 25,
          y: -90,
          backgroundColor: "#1A1A1A",
        },
        "-=0.1"
      ).to(firstCard, 0.4, {
        y: -30,
        opacity: 1,
      });
      tl.to(
        secondCard,
        0.5,
        {
          rotation: 0,
          x: 25,
          y: -90,
          backgroundColor: "#171717",
        },
        "-=0.1"
      )
        .to(secondCard, 0.4, {
          y: -25,
          opacity: 1,
        })
        .to(returnArrow[1], 0.2, {
          opacity: 1,
        });
      setTimeout(function () {
        $("#card-3").css("z-index", "3");
        $("#card-4").css("z-index", "2");
        $("#card-1").css("z-index", "1");
        $("#card-2").css("z-index", "0");
      }, 600);
    }
  } else {
    //if contact was clicked
    if (fir == 1) {
      //left
      tl.to(firstCard, 0.6, {
        x: -500,
        y: -500,
        rotation: -90,
        opacity: 0,
      });
      if (sr == 1) {
        //left
        tl.to(
          secondCard,
          0.6,
          {
            x: -500,
            y: -500,
            rotation: -90,
            opacity: 0,
          },
          "-=0.4"
        );
        if (tr == 1) {
          //left
          tl.to(
            thirdCard,
            0.6,
            {
              x: -500,
              y: -500,
              rotation: -90,
              opacity: 0,
            },
            "-=0.4"
          );
        } else {
          //right
          tl.to(
            thirdCard,
            0.6,
            {
              x: 500,
              y: -500,
              rotation: 90,
              opacity: 0,
            },
            "-=0.4"
          );
        }
      } else {
        //right
        tl.to(
          secondCard,
          0.6,
          {
            x: 500,
            y: -500,
            rotation: 90,
            opacity: 0,
          },
          "-=0.4"
        );
        if (tr == 1) {
          //left
          tl.to(
            thirdCard,
            0.6,
            {
              x: -500,
              y: -500,
              rotation: -90,
              opacity: 0,
            },
            "-=0.4"
          );
        } else {
          //right
          tl.to(
            thirdCard,
            0.6,
            {
              x: 500,
              y: -500,
              rotation: 90,
              opacity: 0,
            },
            "-=0.4"
          );
        }
      }
      tl.to(
        fourthCard,
        0.3,
        {
          x: -35,
          y: 40,
          backgroundColor: "#212121",
        },
        "-=0.3"
      );

      tl.to(
        firstCard,
        0.5,
        {
          rotation: 0,
          x: 15,
          y: -90,
          backgroundColor: "#1D1D1D",
        },
        "-=0.1"
      ).to(firstCard, 0.4, {
        y: -15,
        opacity: 1,
      });
      tl.to(
        secondCard,
        0.5,
        {
          rotation: 0,
          x: 15,
          y: -90,
          backgroundColor: "#1A1A1A",
        },
        "-=0.1"
      ).to(secondCard, 0.4, {
        y: -15,
        opacity: 1,
      });
      tl.to(thirdCard, 0.5, {
        rotation: 0,
        x: 15,
        y: -90,
        backgroundColor: "#171717",
      })
        .to(thirdCard, 0.4, {
          y: -15,
          opacity: 1,
        })
        .to(returnArrow[2], 0.2, {
          opacity: 1,
        });
      setTimeout(function () {
        $("#card-4").css("z-index", "3");
        $("#card-1").css("z-index", "2");
        $("#card-2").css("z-index", "1");
        $("#card-3").css("z-index", "0");
      }, 600);
    } else {
      //right
      tl.to(firstCard, 0.6, {
        x: 500,
        y: -500,
        rotation: 90,
        opacity: 0,
      });
      if (sr == 1) {
        //left
        tl.to(
          secondCard,
          0.6,
          {
            x: -500,
            y: -500,
            rotation: -90,
            opacity: 0,
          },
          "-=0.4"
        );
        if (tr == 1) {
          //left
          tl.to(
            thirdCard,
            0.6,
            {
              x: -500,
              y: -500,
              rotation: -90,
              opacity: 0,
            },
            "-=0.4"
          );
        } else {
          //right
          tl.to(
            thirdCard,
            0.6,
            {
              x: 500,
              y: -500,
              rotation: 90,
              opacity: 0,
            },
            "-=0.4"
          );
        }
      } else {
        //right
        tl.to(
          secondCard,
          0.6,
          {
            x: 500,
            y: -500,
            rotation: 90,
            opacity: 0,
          },
          "-=0.4"
        );
        if (tr == 1) {
          //left
          tl.to(
            thirdCard,
            0.6,
            {
              x: -500,
              y: -500,
              rotation: -90,
              opacity: 0,
            },
            "-=0.4"
          );
        } else {
          //right
          tl.to(
            thirdCard,
            0.6,
            {
              x: 500,
              y: -500,
              rotation: 90,
              opacity: 0,
            },
            "-=0.4"
          );
        }
      }
      tl.to(
        fourthCard,
        0.3,
        {
          x: -35,
          y: 40,
          backgroundColor: "#212121",
        },
        "-=0.3"
      );

      tl.to(
        firstCard,
        0.5,
        {
          rotation: 0,
          x: 15,
          y: -90,
          backgroundColor: "#1D1D1D",
        },
        "-=0.1"
      ).to(firstCard, 0.4, {
        y: -15,
        opacity: 1,
      });
      tl.to(
        secondCard,
        0.5,
        {
          rotation: 0,
          x: 15,
          y: -90,
          backgroundColor: "#1A1A1A",
        },
        "-=0.1"
      ).to(secondCard, 0.4, {
        y: -15,
        opacity: 1,
      });
      tl.to(thirdCard, 0.5, {
        rotation: 0,
        x: 15,
        y: -90,
        backgroundColor: "#171717",
      })
        .to(thirdCard, 0.4, {
          y: -15,
          opacity: 1,
        })
        .to(returnArrow[2], 0.2, {
          opacity: 1,
        });
      setTimeout(function () {
        $("#card-4").css("z-index", "3");
        $("#card-1").css("z-index", "2");
        $("#card-2").css("z-index", "1");
        $("#card-3").css("z-index", "0");
      }, 600);
    }
  }
}

//return button ------------------
function homeCard() {
  const tl = new TimelineMax();
  let fir = Math.floor(Math.random() * 2);
  let sr = Math.floor(Math.random() * 2);
  let tr = Math.floor(Math.random() * 2);
  let fur = Math.floor(Math.random() * 2);

  tl.to(returnArrow[0], 0, {
    opacity: 0,
  })
    .to(cardFlip[0], 0, {
      opacity: 0,
    })
    .to(returnArrow[1], 0, {
      opacity: 0,
    })
    .to(returnArrow[2], 0, {
      opacity: 0,
    });

  if (i == 1) {
    //on lang card
    if (sr == 1) {
      //left
      tl.to(secondCard, 0.6, {
        x: -500,
        y: -500,
        rotation: -90,
        opacity: 0,
      });
    } else {
      //right
      tl.to(secondCard, 0.6, {
        x: 500,
        y: -500,
        rotation: 90,
        opacity: 0,
      });
    }
    if (tr == 1) {
      //left
      tl.to(
        thirdCard,
        0.6,
        {
          x: -500,
          y: -500,
          rotation: -90,
          opacity: 0,
        },
        "-=0.2"
      );
    } else {
      //right
      tl.to(
        thirdCard,
        0.6,
        {
          x: 500,
          y: -500,
          rotation: 90,
          opacity: 0,
        },
        "-=0.2"
      );
    }
    if (fur == 1) {
      //left
      tl.to(
        fourthCard,
        0.6,
        {
          x: -500,
          y: -500,
          rotation: -90,
          opacity: 0,
        },
        "-=0.2"
      );
    } else {
      //right
      tl.to(
        fourthCard,
        0.6,
        {
          x: 500,
          y: -500,
          rotation: 90,
          opacity: 0,
        },
        "-=0.2"
      );
    }
  } else if (i == 2) {
    // on proj
    if (tr == 1) {
      //left
      tl.to(
        thirdCard,
        0.6,
        {
          x: -500,
          y: -500,
          rotation: -90,
          opacity: 0,
        },
        "-=0.2"
      );
    } else {
      //right
      tl.to(
        thirdCard,
        0.6,
        {
          x: 500,
          y: -500,
          rotation: 90,
          opacity: 0,
        },
        "-=0.2"
      );
    }
    if (fur == 1) {
      //left
      tl.to(
        fourthCard,
        0.6,
        {
          x: -500,
          y: -500,
          rotation: -90,
          opacity: 0,
        },
        "-=0.2"
      );
    } else {
      //right
      tl.to(
        fourthCard,
        0.6,
        {
          x: 500,
          y: -500,
          rotation: 90,
          opacity: 0,
        },
        "-=0.2"
      );
    }
  } else {
    if (fur == 1) {
      //left
      tl.to(
        fourthCard,
        0.6,
        {
          x: -500,
          y: -500,
          rotation: -90,
          opacity: 0,
        },
        "-=0.2"
      );
    } else {
      //right
      tl.to(
        fourthCard,
        0.6,
        {
          x: 500,
          y: -500,
          rotation: 90,
          opacity: 0,
        },
        "-=0.2"
      );
    }
  }

  setTimeout(function () {
    if (i == 1) {
      // if lang was clicked
      tl.to(
        firstCard,
        0.6,
        {
          x: 0,
          y: 0,
          backgroundColor: "#212121",
        },
        "-=0.4"
      );
      $("#card-1").css("z-index", "3");
      $("#card-2").css("z-index", "2");
      $("#card-3").css("z-index", "1");
      $("#card-4").css("z-index", "0");
      tl.to(
        secondCard,
        0.5,
        {
          rotation: 0,
          x: 0,
          y: -90,
          backgroundColor: "#1D1D1D",
        },
        "-=0.1"
      )
        .to(secondCard, 0.4, {
          y: 0,
          opacity: 1,
        })
        .to(
          thirdCard,
          0.5,
          {
            rotation: 0,
            x: 0,
            y: -90,
            backgroundColor: "#1A1A1A",
          },
          "-=0.6"
        )
        .to(
          thirdCard,
          0.4,
          {
            y: 0,
            opacity: 1,
          },
          "-=0.1"
        )
        .to(
          fourthCard,
          0.5,
          {
            rotation: 0,
            x: 0,
            y: -90,
            backgroundColor: "#171717",
          },
          "-=1.2"
        )
        .to(
          fourthCard,
          0.4,
          {
            y: 0,
            opacity: 1,
          },
          "-=0.2"
        )
        .to();
    } else if (i == 2) {
      // if proj was clicked
      tl.to(
        firstCard,
        0.6,
        {
          x: 0,
          y: 0,
          backgroundColor: "#212121",
        },
        "-=0.4"
      ).to(
        secondCard,
        0.6,
        {
          x: 0,
          y: 0,
          backgroundColor: "#1D1D1D",
        },
        "-=0.3"
      );
      $("#card-1").css("z-index", "3");
      $("#card-2").css("z-index", "2");
      $("#card-3").css("z-index", "1");
      $("#card-4").css("z-index", "0");
      tl.to(
        thirdCard,
        0.5,
        {
          rotation: 0,
          x: 0,
          y: -90,
          backgroundColor: "#1A1A1A",
        },
        "-=0.1"
      )
        .to(thirdCard, 0.4, {
          y: 0,
          opacity: 1,
        })
        .to(
          fourthCard,
          0.5,
          {
            rotation: 0,
            x: 0,
            y: -90,
            backgroundColor: "#171717",
          },
          "-=0.6"
        )
        .to(
          fourthCard,
          0.4,
          {
            y: 0,
            opacity: 1,
          },
          "-=0.1"
        );
    } else {
      // if contact was clicked
      tl.to(
        firstCard,
        0.6,
        {
          x: 0,
          y: 0,
          backgroundColor: "#212121",
        },
        "-=0.4"
      )
        .to(
          secondCard,
          0.6,
          {
            x: 0,
            y: 0,
            backgroundColor: "#1D1D1D",
          },
          "-=0.3"
        )
        .to(
          thirdCard,
          0.6,
          {
            x: 0,
            y: 0,
            backgroundColor: "#1A1A1A",
          },
          "-=0.2"
        );
      $("#card-1").css("z-index", "3");
      $("#card-2").css("z-index", "2");
      $("#card-3").css("z-index", "1");
      $("#card-4").css("z-index", "0");
      tl.to(
        fourthCard,
        0.5,
        {
          rotation: 0,
          x: 0,
          y: -90,
          backgroundColor: "#171717",
        },
        "-=0.6"
      ).to(
        fourthCard,
        0.4,
        {
          y: 0,
          opacity: 1,
        },
        "-=0.1"
      );
    }
  }, 800);
}

// flip

function langFlip() {
  const tl = new TimelineMax();
  tl.to(secondCard, 0.3, {
    rotationY: "180deg",
  });
}

//hover for bottom card buttons

const tooltipLeftVisible = document.querySelector(".tooltip-left-visible");
const tooltipRightVisible = document.querySelector(".tooltip-right-visible");

function tooltipLeft() {
  const tl = new TimelineMax();
  tl.to(tooltipLeftVisible, 0.3, {
    opacity: 0.4,
  });
}

function tooltipRight() {
  const tl = new TimelineMax();
  tl.to(tooltipRightVisible, 0.3, {
    opacity: 0.4,
  });
  $(".tooltip-pos-right").css("z-index", "10");
}

function unTooltip() {
  const tl = new TimelineMax();
  tl.to(tooltipLeftVisible, 0.3, {
    opacity: 0,
  }).to(tooltipRightVisible, 0.3, {
    opacity: 0,
  });
}
// mobile detection -----------------------------------------------------------------------------------------------

if (window.screen.width <= 828) {
  window.location.replace("/mobile/");
}

// end of mobile detection, start of loading sequence -------------------------------------------------------------

const sqr1 = document.getElementById("comp-1");
const sqr2 = document.getElementById("comp-2");
const sqr3 = document.getElementById("comp-3");
const loadingScreen = document.getElementById("loading");
const loadedPage = document.getElementById("full-load");

window.onload = function loadingAnimation() {
  const tl = new TimelineMax();
  tl.to(sqr3, 0.3, {
    y: -35,
  })
    .to(sqr2, 0.3, {
      x: 32,
    })
    .to(sqr1, 0.3, {
      x: 30,
    })
    .to(sqr3, 0.3, {
      x: -35,
    })
    .to(sqr2, 0.3, {
      y: -35,
    })
    .to(sqr1, 0.3, {
      x: 64,
    })
    .to(sqr3, 0.3, {
      y: 0,
    })
    .to(sqr2, 0.3, {
      x: -3,
    })
    .to(sqr1, 0.3, {
      y: -35,
    })
    .to(sqr3, 0.3, {
      x: 0,
    })
    .to(sqr2, 0.3, {
      y: 0,
    })
    .to(sqr1, 0.3, {
      x: 30,
    });
  setTimeout(function () {
    tl.to(loadingScreen, 0.3, {
      opacity: 0,
    }).to(
      loadedPage,
      0.3,
      {
        opacity: 1,
      },
      "-=0.2"
    );
    loadingScreen.classList = "pointer-events-none";
  }, 3600);
};

function show(id, value) {
  document.getElementById(id).style.display = value ? "block" : "none";
}

// Mouse Tracking ---------------------------------------------------------------------------------------------------------

const cursorCricle = document.getElementById("cursor-circle");

$(document).ready(function () {
  $(document).mousemove(function (e) {
    const tl = new TimelineMax();
    tl.to(cursorCricle, 0.3, {
      left: e.pageX,
      top: e.pageY,
      opacity: 1,
    });
  });
});

$(function () {
  $("a").hover(
    function () {
      const tl = new TimelineMax();
      tl.to(cursorCricle, 0.2, {
        width: 24,
        height: 24,
      });
    },
    function () {
      const tl = new TimelineMax();
      tl.to(cursorCricle, 0.2, {
        width: 16,
        height: 16,
      });
    }
  );
});

$(function () {
  $(".return").hover(
    function () {
      const tl = new TimelineMax();
      tl.to(cursorCricle, 0.2, {
        width: 24,
        height: 24,
      });
    },
    function () {
      const tl = new TimelineMax();
      tl.to(cursorCricle, 0.2, {
        width: 16,
        height: 16,
      });
    }
  );
});

$(function () {
  $(".flip").hover(
    function () {
      const tl = new TimelineMax();
      tl.to(cursorCricle, 0.2, {
        width: 24,
        height: 24,
      });
    },
    function () {
      const tl = new TimelineMax();
      tl.to(cursorCricle, 0.2, {
        width: 16,
        height: 16,
      });
    }
  );
});

// 404 page return ----------------------------------------------------------------------------------------------

function goBack() {
  window.history.back();
}

//arg -------------------------------------------------------------------------------------------------------------

const lightbulb = document.getElementById("hint");
const hintMessage = document.getElementsByClassName("hint-inner");
let hintUse = 0;

function showHint() {
  const tl = new TimelineMax();
  if (hintUse == 0) {
    lightbulb.classList = "fas fa-lightbulb cursor-not-allowed";
    tl.to(hintMessage[0], 0.3, { opacity: 1 });
    hintMessage[0].innerHTML = "F12";
  } else {
  }
}

// Side info ------------------------------------------------------------------------------------------------------

const sideInfo = document.getElementById("side-info");
const sideDesc = document.getElementById("info");
const utButton = document.getElementsByClassName("utile-button");
const misButton = document.getElementsByClassName("miscord-button");
const gitPrButton = document.getElementsByClassName("github-proj-button");
const pyButton = document.getElementsByClassName("py-button");
const htmlButton = document.getElementsByClassName("html-button");
const cssButton = document.getElementsByClassName("css-button");
const jsButton = document.getElementsByClassName("js-button");
const luaButton = document.getElementsByClassName("lua-button");
const sideExit = document.getElementsByClassName("side-exit");
let override = 0;

utButton[0].addEventListener("click", utInfo);
utButton[0].addEventListener("mouseover", utHover);
utButton[0].addEventListener("mouseout", sideHide);
misButton[0].addEventListener("click", misInfo);
misButton[0].addEventListener("mouseover", misHover);
misButton[0].addEventListener("mouseout", sideHide);
gitPrButton[0].addEventListener("click", gitPrInfo);
gitPrButton[0].addEventListener("mouseover", gitPrHover);
gitPrButton[0].addEventListener("mouseout", sideHide);
pyButton[0].addEventListener("click", pyInfo);
pyButton[0].addEventListener("mouseover", pyHover);
pyButton[0].addEventListener("mouseout", sideHide);
htmlButton[0].addEventListener("click", htmlInfo);
htmlButton[0].addEventListener("mouseover", htmlHover);
htmlButton[0].addEventListener("mouseout", sideHide);
cssButton[0].addEventListener("click", cssInfo);
cssButton[0].addEventListener("mouseover", cssHover);
cssButton[0].addEventListener("mouseout", sideHide);
jsButton[0].addEventListener("click", jsInfo);
jsButton[0].addEventListener("mouseover", jsHover);
jsButton[0].addEventListener("mouseout", sideHide);
luaButton[0].addEventListener("click", luaInfo);
luaButton[0].addEventListener("mouseover", luaHover);
luaButton[0].addEventListener("mouseout", sideHide);
sideExit[0].addEventListener("click", sideClose);

function sideClose() {
  override = 0;
  const tl = new TimelineMax();
  tl.to(sideInfo, 0.4, {
    opacity: 0,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-none";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-none";
}

function utInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "The Utile project is a discord bot made by <a class='info-link' href='https://github.com/tilda/' target='_blank'>tilda</a>, <a class='info-link' href='https://github.com/iAlex11/' target='_blank'>alex</a>, and <a class='info-link' href='https://github.com/punctuations/' target='_blank'>me</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function utHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "The Utile project is a discord bot made by <a class='info-link' href='https://github.com/tilda/' target='_blank'>tilda</a>, <a class='info-link' href='https://github.com/iAlex11/' target='_blank'>alex</a>, and <a class='info-link' href='https://github.com/punctuations/' target='_blank'>me</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function misInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    'The Miscord Project is a project that was developed during discord\'s <a class="info-link" href="https://blog.discord.com/discord-community-hack-week-category-winners-bd0364360f92" target=\'_blank\'>Hack Week</a>, which is the reason we made this other discord bot, Miscord has lots of features which you can see <a class="info-link" href="https://miscord.utile.cf/" target=\'_blank\'>here</a>. Miscord was made by <a class="info-link" href="https://github.com/ifisq" target=\'_blank\'>blue</a>, <a class="info-link" href="https://github.com/iAlex11/" target=\'_blank\'>alex</a>, <a class="info-link" href="https://github.com/tilda/" target=\'_blank\'>tilda</a>, and <a class="info-link" href="https://github.com/punctuations/" target=\'_blank\'>me</a>.';
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function misHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    'The Miscord Project is a project that was developed during discord\'s <a class="info-link" href="https://blog.discord.com/discord-community-hack-week-category-winners-bd0364360f92" target=\'_blank\'>Hack Week</a>, which is the reason we made this other discord bot, Miscord has lots of features which you can see <a class="info-link" href="https://miscord.utile.cf/" target=\'_blank\'>here</a>. Miscord was made by <a class="info-link" href="https://github.com/ifisq" target=\'_blank\'>blue</a>, <a class="info-link" href="https://github.com/iAlex11/" target=\'_blank\'>alex</a>, <a class="info-link" href="https://github.com/tilda/" target=\'_blank\'>tilda</a>, and <a class="info-link" href="https://github.com/punctuations/" target=\'_blank\'>me</a>.';
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function gitPrInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "Using github I have tons of my projects open source and easily avaliabe to me, I have most if not all of my projects hosted <a class='info-link' href='https://github.com/punctuations/' target='_blank'>there</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function gitPrHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "Using github I have tons of my projects open source and easily avaliabe to me, I have most if not all of my projects hosted <a class='info-link' href='https://github.com/punctuations/' target='_blank'>there</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function pyInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "Using <a class='info-link' href='https://docs.python.org/3/' target='_blank'>python</a> I have made tons of projects, an example would be <a class='info-link' href='https://github.com/utilefordiscord' target='https://github.com/utilefordiscord'>Utile</a> the discord bot, and a few others you can see <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function pyHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "Using <a class='info-link' href='https://docs.python.org/3/' target='_blank'>python</a> I have made tons of projects, an example would be <a class='info-link' href='https://github.com/utilefordiscord' target='https://github.com/utilefordiscord'>Utile</a> the discord bot, and a few others you can see <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function htmlInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "Using <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/HTML' target='_blank'>HTML</a> I was able to basically layout what I'd call the framework of the website with all the text and things. An example of things I've done with this would be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function htmlHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "Using <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/HTML' target='_blank'>HTML</a> I was able to basically layout what I'd call the framework of the website with all the text and things. An example of things I've done with this would be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function cssInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is like the fancy wallpaper added to a building where html is the blank wall and framework, <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is what makes it look fancy and nice. To see some of my work with <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> it'd be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function cssHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is like the fancy wallpaper added to a building where html is the blank wall and framework, <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> is what makes it look fancy and nice. To see some of my work with <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/CSS/Reference' target='_blank'>CSS</a> it'd be on <a class='info-link' href='https://github.com/punctuations' target='_blank'>Github</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function jsInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language with tons of libraries and capabilities to utilize, I used a lot of <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> in this project, overall <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language to see some of it in action go <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function jsHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "<a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language with tons of libraries and capabilities to utilize, I used a lot of <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> in this project, overall <a class='info-link' href='https://developer.mozilla.org/en-US/docs/Web/javascript' target='_blank'>Javascript</a> is a great language to see some of it in action go <a class='info-link' href='https://github.com/punctuations' target='_blank'>here</a>.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function luaInfo() {
  override = 1;
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "<a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> is a language that I used quite a bit, it is a great language, however I have not personally used <a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> in a long time.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function luaHover() {
  const tl = new TimelineMax();
  sideDesc.innerHTML =
    "<a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> is a language that I used quite a bit, it is a great language, however I have not personally used <a class='info-link' href='https://www.lua.org/docs.html' target='_blank'>Lua</a> in a long time.";
  tl.to(sideInfo, 0.4, {
    opacity: 1,
  });
  sideExit[0].classList =
    "fas fa-times text-right cursor-pointer side-exit pointer-events-auto";
  sideDesc.classList =
    "text-sm cursor-default cursor-pointer pointer-events-auto";
}

function sideHide() {
  if (override == 0) {
    sideExit[0].classList =
      "fas fa-times text-right cursor-pointer side-exit pointer-events-none";
    sideDesc.classList =
      "text-sm cursor-default cursor-pointer pointer-events-none";
    const tl = new TimelineMax();
    tl.to(sideInfo, 0.4, {
      opacity: 0,
    });
  } else if (override !== 0) {
  }
}
