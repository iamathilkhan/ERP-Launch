<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HUD Unveiling</title>
<style>
  .tech-clock {
    position: fixed;
    right: 40px;
    top: 250px;
    font-family: 'Orbitron', Arial, sans-serif;
    font-size: 1.3rem;
    color: #ff9933;
    background: rgba(0,0,0,0.7);
    border: 2px solid #ff9933;
    border-radius: 12px;
    padding: 6px 18px;
    box-shadow: 0 0 10px #ff9933a0;
    z-index: 50;
    letter-spacing: 0.12em;
    opacity: 0;
    transition: opacity 0.5s;
  }
  .logo-circle-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(1);
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle at 60% 40%, #222 70%, #444 100%);
    box-shadow: 0 0 40px #ff9933a0, 0 0 0 8px #222 inset;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    transition: transform 0.7s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.5s;
  }
  .logo-circle-container img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 0 20px #ff9933a0;
    background: #fff;
  }
  .circle-split-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 220px;
    height: 220px;
    z-index: 10;
    pointer-events: none;
  }
  .circle-split-svg {
    width: 220px;
    height: 220px;
    position: absolute;
    left: 0;
    top: 0;
  }
  .circle-img {
    position: absolute;
    width: 220px;
    height: 220px;
    left: 0;
    top: 0;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transition: transform 1s cubic-bezier(.68,-0.55,.27,1.55);
  }
  .circle-img.left {
    clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
    z-index: 2;
  }
  .circle-img.right {
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
    z-index: 2;
  }
  .circle-img.split-left {
    transform: translateX(-120px);
  }
  .circle-img.split-right {
    transform: translateX(120px);
  }
  :root {
    --bg:#000;
    --orange:#ff9933;
    --orange-strong:#ff7a1a;
    --grid:rgba(255,153,51,.15);
  }
  html, body {
    margin:0; padding:0;
    height:100%;
    background: var(--bg);
    overflow:hidden;
    font-family: Arial, sans-serif;
  }

  /* ---------------- VIDEO OVERLAY ---------------- */
  #video-overlay {
    position:fixed; inset:0;
    display:flex; justify-content:center; align-items:center;
    flex-direction:column;
    background:black;
    z-index:9999;
  }
  #intro-video {
    width:100%; height:100%;
    object-fit:cover; display:none;
  }
  #launch-btn {
    /* padding:10px 80px;
    font-size:2rem;
    cursor:pointer;
    border:none;
    background-color:#E8823A;
    color:white;
    border-radius:10px; */
    z-index:10000;
  }

  /* ---------------- BOOST CONTAINER (LEFT) ---------------- */
  .hud-left {
    position:fixed;
    left:30px; top:50%;
    transform:translateY(-50%) scale(0);
    opacity:0;
    width:250px; color:var(--orange);
    transition: transform 0.7s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.5s;
    transform-origin: center center;
  }
  .title {
    display:flex; align-items:center;
    font-weight:bold; font-size:18px;
    margin-bottom:20px;
  }
  .circle {
    width:30px; height:30px;
    border:2px solid var(--orange);
    border-radius:50%; margin-right:10px;
    box-shadow:0 0 8px var(--orange);
    animation:rotate 3s linear infinite;
  }
  @keyframes rotate {from{transform:rotate(0);} to{transform:rotate(360deg);}}
  .scale {
    position:absolute; top:60px; left:15px; bottom:20px;
    width:2px; background:linear-gradient(to bottom, var(--orange), transparent);
  }
  .scale div {
    width:10px; height:2px; background:var(--orange);
    margin:8px 0; box-shadow:0 0 5px var(--orange);
  }
  .boxes {
    margin-left:50px; display:flex; flex-direction:column;
    height:500px; position:relative; overflow:hidden;
  }
  .box {
    width:180px; height:30px;
    border:2px solid var(--orange);
    margin:5px 0; box-shadow:0 0 8px var(--orange);
    background:transparent;
    opacity:0; transform:translateY(-10px);
    position:relative; overflow:hidden;
  }
  .box.revealed {
    opacity:1; transform:translateY(0);
    transition:opacity .2s ease, transform .2s ease;
  }
  .liquid {
    position:absolute; bottom:0; left:0;
    width:100%; height:0%;
    background:linear-gradient(to top, var(--orange), #ff6600);
    box-shadow:0 0 10px #ff6600 inset;
    transition:height .3s ease-in-out;
  }
  .liquid::before {
    content:""; position:absolute; top:0; left:-100%;
    width:200%; height:100%;
    background:linear-gradient(270deg, transparent, rgba(255,255,255,0.4), transparent);
    animation:flow 1s linear infinite;
  }
  @keyframes flow {0%{left:-100%;}100%{left:0%;}}

  /* ---------------- CLOCK HUD (BOTTOM RIGHT) ---------------- */
  .dashboard {
    position:fixed; right:26px; bottom:26px;
    width:min(360px,92vw); pointer-events:none;
    transform: scale(0);
    opacity:0;
    transition: transform 0.7s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.5s;
    transform-origin: center center;
  }
  .hud {
    position:relative; width:100%;
    border:2px solid var(--orange);
    border-radius:16px;
    box-shadow:0 0 20px rgba(255,122,26,.35), inset 0 0 25px rgba(255,122,26,.15);
    background: radial-gradient(100% 120% at 50% 10%, rgba(255,153,51,.10), rgba(0,0,0,.0) 55%),
                linear-gradient(180deg, rgba(255,153,51,.06), rgba(255,153,51,.02));
    aspect-ratio:1/1; overflow:hidden;
  }
  .hud-title {
    position:absolute; top:10px; left:14px;
    background:rgba(0,0,0,.85); padding:6px 12px;
    border:2px solid var(--orange); border-radius:12px;
    box-shadow:0 0 12px rgba(255,122,26,.55);
    font-weight:800; letter-spacing:.08em; font-size:.9rem;
  }
  .grid {
    position:absolute; inset:0; opacity:.9;
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size:22px 22px;
  }
  .logo-placeholder {
    position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%);
    display:flex; justify-content:center; align-items:center;
  }
  .logo-placeholder img {
    max-width:300px; max-height:300px;
    filter:drop-shadow(0 0 15px rgba(255,255,255,.9))
           drop-shadow(0 0 25px rgba(255,255,255,.6));
    animation:logo-pulse 3s infinite ease-in-out;
  }
  @keyframes logo-pulse {
    0%,100% {filter:drop-shadow(0 0 15px rgba(255,255,255,.9)) drop-shadow(0 0 25px rgba(255,153,51,.6));}
    50% {filter:drop-shadow(0 0 25px rgba(255,255,255,1)) drop-shadow(0 0 45px rgba(255,153,51,.85));}
  }
  .readout {
    position:absolute; left:14px; bottom:10px;
    font-weight:800; letter-spacing:.08em;
    text-shadow:0 0 8px var(--orange-strong);
  }
  .controls {
    position:absolute; right:12px; bottom:10px; display:flex; gap:6px;
  }
  .pill {
    width:12px; height:18px; border-radius:3px;
    border:2px solid var(--orange);
    box-shadow:0 0 8px rgba(255,122,26,.6) inset;
  }

  /* ---------- SIGNATURE HUD (top-right) ---------- */
  .signature {
    position: fixed;
    top: 40px;
    right: 40px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    z-index: 20;
    transform: scale(0);
    opacity:0;
    transition: transform 0.7s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.5s;
    transform-origin: center center;
  }

  .signature-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .signature-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }
  .signature-bars .bar {
    width: 14px;
    height: 14px;
    background: var(--orange);
    opacity: 0;
    transform: scale(0.5);
    animation: barLoad 1.5s ease-in-out infinite;
  }
  .signature-bars .bar:nth-child(2) { animation-delay: 0.2s; }
  .signature-bars .bar:nth-child(3) { animation-delay: 0.4s; }

  @keyframes barLoad {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1); }
  }

  .signature-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--orange);
    letter-spacing: 0.08em;
    min-width: 220px;
    white-space: nowrap;
    opacity: 0;
    animation: textFadeIn 0.5s ease-out 0.6s forwards;
  }

  @keyframes textFadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  /* Horizontal HUD lines */
  .hud-lines {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-left: 28px;
  }
  .hud-line {
    height: 8px;
    background: var(--orange);
    opacity: 0.8;
    border-radius: 2px;
    transform-origin: left;
    animation: lineExpand 2s ease-in-out infinite;
  }
  .hud-line:nth-child(1) { width: 220px; animation-delay: 0.8s; }
  .hud-line:nth-child(2) { width: 140px; animation-delay: 1.0s; }
  .hud-line:nth-child(3) { width: 200px; animation-delay: 1.2s; }

  @keyframes lineExpand {
    0%, 100% { transform: scaleX(0); opacity: 0.8; }
    50% { transform: scaleX(1); opacity: 0.9; }
  }


  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    transform: scale(0);
    opacity:0;
    transition: transform 0.7s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.5s;
    transform-origin: center center;
  }

        .container-ring {
            width: 80vmin;
            height: 80vmin;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: scaleIn 1s ease-out;
        }

        .ringMain circle {
            fill: none;
            stroke-linecap: round;
            transform-origin: 50% 50%;  
        }

        .c1 { stroke: #ff9933; stroke-width: 0.2; }
        .c2 { stroke: #ff9933; stroke-width: 0.3; stroke-dasharray: 5, 10; animation: rotate-c2 8s infinite linear; }
        .c3 { stroke: #ff7a1a; stroke-width: 1; transform: rotate(-90deg); stroke-dasharray: 50, 100; animation: progress 6s ease-out forwards; }
        .c4 { stroke: #cc6600; stroke-width: 0.7; animation: rotate-c4 12s infinite linear; }
        .c5 { stroke: #E8823A; stroke-width: 0.8; stroke-dasharray: 40; animation: rotate-c5 10s infinite linear; }
        .c6 { stroke: #ff9933; stroke-width: 0.9; stroke-dasharray: 15; animation: rotate-c6 14s infinite linear; }
        .c7 { stroke: #ff7a1a; stroke-width: 0.9; stroke-dasharray: 2; animation: rotate-c7 16s infinite linear; }
        .c8 { stroke: #ff9933; stroke-width: 2; stroke-dasharray: 30,100; animation: rotate-c8 18s infinite linear; }
        .c9 { stroke: #E8823A; stroke-width: 0.6; stroke-dasharray: 20; animation: rotate-c9 20s infinite linear; }
        .c10 { stroke: #ff7a1a; stroke-width: 0.7; stroke-dasharray: 80, 100; animation: rotate-c10 22s infinite linear; }
        .c11 { stroke: #ff9933; stroke-width: 1; stroke-dasharray: 80, 100; animation: rotate-c11 24s infinite linear; }

        @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes progress {
            0% { stroke-dasharray: 0 100; }
            100% { stroke-dasharray: 50 100; }
        }

        @keyframes rotate-c2 { 100% { transform: rotate(360deg); } }
        @keyframes rotate-c4 { 100% { transform: rotate(-360deg); } }
        @keyframes rotate-c5 { 100% { transform: rotate(360deg); } }
        @keyframes rotate-c6 { 100% { transform: rotate(-360deg); } }
        @keyframes rotate-c7 { 100% { transform: rotate(360deg); } }
        @keyframes rotate-c8 { 100% { transform: rotate(-360deg); } }
        @keyframes rotate-c9 { 100% { transform: rotate(360deg); } }
        @keyframes rotate-c10 { 100% { transform: rotate(-360deg); } }
        @keyframes rotate-c11 { 100% { transform: rotate(360deg); } }
</style>

</head>
<body>


  
<div class="tech-clock" id="techClock"></div>
<!-- VIDEO OVERLAY -->
<div id="video-overlay">
  <button id="launch-btn"></button>
  <video id="intro-video">
    <source src="loader.mp4" type="video/mp4">
  </video>
</div>

<!-- LEFT LOADER -->
<div class="hud-left" id="left-loader" style="display:none;">
  <div class="title"><div class="circle"></div>Loading Container</div>
  <div class="scale">
    <div></div><div></div><div></div><div></div>
    <div></div><div></div><div></div><div></div>
    <div></div><div></div><div></div><div></div>
  </div>
  <div class="boxes" id="boxes">
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
    <div class="box"><div class="liquid"></div></div>
  </div>
</div>

<!-- CLOCK HUD RIGHT BOTTOM -->
<div class="dashboard" id="clock-hud" style="display:none; z-index:40;">
  <div class="hud">
   
    <div class="grid"></div>
    <div class="logo-placeholder"><img src="logo1.png" alt="logo"></div>
    <div class="readout" id="mhz">0000</div>
    <div class="controls"><div class="pill"></div><div class="pill"></div><div class="pill"></div></div>
  </div>
</div>

<div class="signature">
    <div class="signature-header">
      <div class="signature-bars">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
      <div class="signature-text">
        <span id="design-text"></span> <br>
        <span class="ml-15" >NSCET</span>
      </div>
    </div>
    <div class="hud-lines">
      <div class="hud-line"></div>
      <div class="hud-line"></div>
      <div class="hud-line"></div>
    </div>
  </div>



  <div class="container">
    <div class="container-ring">
      <svg class="ringMain" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="4" class="c1"></circle>
        <circle cx="50" cy="50" r="6" class="c2"></circle>
        <circle cx="50" cy="50" r="8" class="c3"></circle>
        <circle cx="50" cy="50" r="20" class="c4"></circle>
        <circle cx="50" cy="50" r="25" class="c5"></circle>
        <circle cx="50" cy="50" r="28" class="c6"></circle>
        <circle cx="50" cy="50" r="32" class="c7"></circle>
        <circle cx="50" cy="50" r="38" class="c8"></circle>
        <circle cx="50" cy="50" r="42" class="c9"></circle>
        <circle cx="50" cy="50" r="46" class="c10"></circle>
        <circle cx="50" cy="50" r="49" class="c11"></circle>
      </svg>
      <div class="logo-circle-container" id="logoCircle">
        <img src="iq.png" alt="Logo" />
      </div>
    </div>
    </div>


     <audio id="drumroll" preload="auto">
      <source src="audio_2.mp3" type="audio/mpeg" />
    </audio>
<script>
  // Show countdown clock after all elements are displayed
  let countdown = 5;
  const techClock = document.getElementById('techClock');
  function updateTechCountdown() {
    techClock.textContent = countdown.toString().padStart(2, '0');
    if (countdown > 0) {
      countdown--;
      setTimeout(updateTechCountdown, 1000);
    } else {
      techClock.style.opacity = '0';
      // Zoom out all elements
      document.querySelector('.container').style.transform = 'scale(0)';
      document.querySelector('.container').style.opacity = '0';
      document.getElementById('logoCircle').style.transform = 'scale(0)';
      document.getElementById('logoCircle').style.opacity = '0';
      document.getElementById('left-loader').style.transform = 'translateY(-50%) scale(0)';
      document.getElementById('left-loader').style.opacity = '0';
      document.getElementById('clock-hud').style.transform = 'scale(0)';
      document.getElementById('clock-hud').style.opacity = '0';
      document.querySelector('.signature').style.transform = 'scale(0)';
      document.querySelector('.signature').style.opacity = '0';
      setTimeout(() => {
        window.location.href = 'home.php';
      }, 1000);
    }
  }

  // Start countdown only after all elements and boost boxes are revealed
  function startTechClockAfterBoxes() {
    techClock.style.opacity = '1';
    updateTechCountdown();
  }
  // Tech timer logic and zoom-out/fade transition
  const launchBtn = document.getElementById('launch-btn');
  const videoOverlay = document.getElementById('video-overlay');
  const introVideo = document.getElementById('intro-video');
  const drumroll = document.getElementById('drumroll');
  const leftLoader = document.getElementById('left-loader');
  const clockHud = document.getElementById('clock-hud');


  function startOverlaySequence() {
    launchBtn.style.display = 'none';
    introVideo.style.display = 'block';
    introVideo.play();
  }

  launchBtn.addEventListener('click', startOverlaySequence);

  // Auto start overlay after 2 seconds
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(startOverlaySequence, 300);
  });

  introVideo.addEventListener('ended', () => {
    videoOverlay.style.display = 'none';

    // Show all HUD/GUI elements
    leftLoader.style.display = 'block';
    clockHud.style.display = 'block';
    drumroll.play()
    document.querySelector('.signature').style.display = 'flex';
    document.querySelector('.container').style.display = 'flex';

    // Sequential zoom-in reveal for all HUD/GUI elements
    setTimeout(() => {
      document.querySelector('.container').style.transform = 'scale(1)';
      document.querySelector('.container').style.opacity = '1';
    }, 100);
    setTimeout(() => {
      leftLoader.style.transform = 'translateY(-50%) scale(1)';
      leftLoader.style.opacity = '1';
    }, 500);
    setTimeout(() => {
      clockHud.style.transform = 'scale(1)';
      clockHud.style.opacity = '1';
    }, 900);
    setTimeout(() => {
      document.querySelector('.signature').style.transform = 'scale(1)';
      document.querySelector('.signature').style.opacity = '1';
    }, 1300);

    // ---------------- LEFT LOADER LOGIC ----------------
    const boxes = document.querySelectorAll('.box');
    const liquids = document.querySelectorAll('.liquid');
    const maxFillPercent = 65;
    let targetPercent = 0;

    boxes.forEach((box, i) => {
      setTimeout(() => box.classList.add('revealed'), i * 80 + 1700);
    });

    setTimeout(() => {
      function stepFill(newPercent, callback) {
        const targetBoxes = Math.floor((newPercent / 100) * boxes.length);
        const currentBoxes = Math.floor((targetPercent / 100) * boxes.length);
        if (newPercent > targetPercent) {
          for (let i = currentBoxes; i < targetBoxes; i++) {
            setTimeout(() => {
              liquids[boxes.length - 1 - i].style.height = "100%";
              if (i === targetBoxes - 1 && callback) callback();
            }, i * 60);
          }
        } else {
          for (let i = currentBoxes; i > targetBoxes; i--) {
            setTimeout(() => {
              liquids[boxes.length - i].style.height = "0%";
              if (i === targetBoxes + 1 && callback) callback();
            }, (currentBoxes - i) * 60);
          }
        }
        targetPercent = newPercent;
      }
      function fluctuate() {
        const newPercent = Math.floor(Math.random() * maxFillPercent) + 20;
        stepFill(newPercent, () => {
          setTimeout(fluctuate, 800); // keep running infinitely
        });
      }
      fluctuate();
      // Start the tech clock countdown after all boxes are revealed
      setTimeout(startTechClockAfterBoxes, boxes.length * 80 + 400);
    }, boxes.length * 80 + 2200);

    // ---------------- CLOCK HUD LOGIC ----------------
    const readout = document.getElementById('mhz');
    let lastValue = 2800 + Math.round(Math.random()*400);
    function loopClock() {
      lastValue = Math.round(2200 + Math.random()*1000);
      readout.textContent = String(lastValue);
      setTimeout(loopClock, 160);
    }
    loopClock();
  });
  const textEl = document.getElementById("design-text");
    const fullText = "DESIGNED BY ISPIN";
    let i = 0;

    function typeEffect() {
    if (i < fullText.length) {
        textEl.textContent += fullText.charAt(i);
        i++;
        setTimeout(typeEffect, 120);
    }
    } 
    typeEffect();
</script>

</body>
</html>