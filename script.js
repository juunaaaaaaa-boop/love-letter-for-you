
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // NOTIFIKASI KECIL
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  // LOADING SCREEN
  const loadingMessages = [
    "nyiapin keberanian buat confess...",
    "merapikan kata-kata manis...",
    "mengecek kadar salting...",
    "hati siap dijalankan ♡"
  ];

  let progress = 0;
  let msgIndex = 0;

  const loadTimer = setInterval(() => {
    progress = Math.min(100, progress + 8 + Math.random() * 13);
    $("#progressBar").style.width = progress + "%";

    if (progress >= (msgIndex + 1) * 24 && msgIndex < 3) {
      msgIndex++;
      $("#loadText").textContent = loadingMessages[msgIndex];
    }

    if (progress >= 100) {
      clearInterval(loadTimer);
      setTimeout(() => {
        $("#loader").classList.add("done");
        $("#app").classList.remove("hidden");
      }, 350);
    }
  }, 150);

  // PARTIKEL HATI DAN BINTANG
  function createParticle() {
    const el = document.createElement("span");
    el.className = "particle";
    el.textContent = ["♡", "✦", "♥", "✧"][
      Math.floor(Math.random() * 4)
    ];

    el.style.left = Math.random() * 100 + "%";
    el.style.fontSize = 10 + Math.random() * 16 + "px";
    el.style.animationDuration = 7 + Math.random() * 8 + "s";

    $("#particles").append(el);
    setTimeout(() => el.remove(), 16000);
  }

  setInterval(createParticle, 650);

  // NAVIGASI MULTI-HALAMAN
  const pageNames = [
    "home", "confess", "game", "doodle",
    "card", "notes", "gallery", "about"
  ];

  function openPage(name) {
    if (!pageNames.includes(name)) name = "home";

    $$(".page").forEach(page => {
      page.classList.toggle("active", page.id === "page-" + name);
    });

    $$(".nav-item").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.page === name);
    });

    $("#sidebar").classList.remove("open");
    $("#menuOverlay").classList.remove("show");

    window.scrollTo({ top: 0, behavior: "smooth" });

    // URL hash bikin halaman lebih gampang dibuka lewat link.
    history.replaceState(null, "", "#" + name);
  }

  $$("[data-page]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openPage(btn.dataset.page);
    });
  });

  $("#menuBtn").addEventListener("click", () => {
    $("#sidebar").classList.add("open");
    $("#menuOverlay").classList.add("show");
  });

  function closeMenu() {
    $("#sidebar").classList.remove("open");
    $("#menuOverlay").classList.remove("show");
  }

  $("#closeMenu").addEventListener("click", closeMenu);
  $("#menuOverlay").addEventListener("click", closeMenu);

  const initialPage = location.hash.slice(1);
  if (pageNames.includes(initialPage)) {
    openPage(initialPage);
  }

  // MUSIK ORIGINAL DARI WEB AUDIO
  // Musik dibuat langsung oleh browser, tanpa file lagu eksternal.
  let audioContext = null;
  let musicInterval = null;
  let musicEnabled = false;
  let musicStep = 0;

  const melody = [
    392, 493.88, 587.33, 493.88,
    440, 523.25, 659.25, 523.25
  ];

  function playTone(frequency, time, duration, volume, type) {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type || "sine";
    osc.frequency.setValueAtTime(frequency, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(
      0.0001, time + duration
    );

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  function playMusicNote() {
    if (!musicEnabled || !audioContext) return;

    const now = audioContext.currentTime;
    const note = melody[musicStep % melody.length];

    playTone(note, now, 0.38, 0.018, "sine");

    if (musicStep % 2 === 0) {
      playTone(note / 2, now, 0.55, 0.012, "triangle");
    }

    musicStep++;
  }

  $("#musicBtn").addEventListener("click", async () => {
    try {
      if (!audioContext) {
        audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      musicEnabled = !musicEnabled;

      if (musicEnabled) {
        playMusicNote();
        musicInterval = setInterval(playMusicNote, 430);
      } else {
        clearInterval(musicInterval);
        musicInterval = null;
      }

      $("#musicText").textContent = musicEnabled
        ? "MUSIC ON" : "MUSIC OFF";

      toast(musicEnabled
        ? "musik LOVE.exe nyala ♫"
        : "musik dimatiin. mode hening aktif."
      );
    } catch (error) {
      toast("audio belum bisa diputar di browser ini.");
    }
  });

  // CONFESSION ROOM
  let noAttempts = 0;

  const noButton = $("#noBtn");
  const confessResult = $("#confessResult");

  function dodgeButton() {
    if (noAttempts >= 5) return;

    noAttempts++;

    const messages = [
      "eh, kok tombolnya kabur 😭",
      "tombolnya ikut salting.",
      "ini tombol apa atlet parkour?",
      "aku cuma tombol, jangan ditekan terus 😔",
      "oke, tombolnya capek. sekarang bisa dipilih."
    ];

    confessResult.textContent =
      messages[Math.min(noAttempts - 1, 4)];

    if (noAttempts < 5) {
      noButton.style.transform =
        `translate(${Math.random() * 100 - 50}px, ${
          Math.random() * 30 - 15
        }px)`;
    } else {
      noButton.style.transform = "none";
      noButton.textContent = "aku pilih ini kok";
    }
  }

  noButton.addEventListener("pointerenter", e => {
    if (e.pointerType === "mouse") dodgeButton();
  });

  noButton.addEventListener("click", () => {
    if (noAttempts < 5) {
      dodgeButton();
    } else {
      confessResult.textContent =
        "makasih udah jujur ♡ nggak apa-apa, perasaan nggak harus dipaksa.";
      toast("jawaban kamu tetap dihargai ♡");
    }
  });

  // EFEK CELEBRATION
  function celebrate() {
    const layer = $("#confetti");
    layer.innerHTML = "";

    for (let i = 0; i < 70; i++) {
      const el = document.createElement("span");
      el.className = "confetti";
      el.textContent = ["♥", "♡", "✦", "✧", "💗"][
        Math.floor(Math.random() * 5)
      ];

      el.style.left = Math.random() * 100 + "%";
      el.style.animationDelay = Math.random() * 1.5 + "s";
      el.style.fontSize = 12 + Math.random() * 18 + "px";
      el.style.color = [
        "#ff5ca8", "#ffb3d7", "#c6a7ff", "#fff0f7"
      ][i % 4];

      layer.append(el);
    }

    $("#celebration").classList.remove("hidden");
  }

  $("#yesBtn").addEventListener("click", celebrate);

  $("#closeCelebration").addEventListener("click", () => {
    $("#celebration").classList.add("hidden");
    confessResult.textContent =
      "achievement unlocked: berhasil bikin satu orang senyum-senyum sendiri ♡";
  });

  $("#celebration").addEventListener("click", e => {
    if (e.target.id === "celebration") {
      $("#celebration").classList.add("hidden");
    }
  });

  // LOVE GAME: LABIRIN 10 X 10
  const gameCanvas = $("#gameCanvas");
  const g = gameCanvas.getContext("2d");
  const tile = 40;

  const originalMap = [
    "##########",
    "#P..#...H#",
    "#.#.#.##.#",
    "#.#...#..#",
    "#.###.#H##",
    "#...#....#",
    "###.#.##.#",
    "#H..#H...#",
    "#.####.#E#",
    "##########"
  ];

  // Posisi awal dan lima hati sengaja tetap.
  let gameMap;
  let player;
  let collected;
  let gameFinished;

  function resetGame() {
    gameMap = originalMap.map(row => row.split(""));
    player = { x: 1, y: 1 };
    collected = 0;
    gameFinished = false;

    $("#heartCount").textContent = "0 / 5";
    $("#gameStatus").textContent = "READY";
    $("#gameMessage").textContent =
      "WASD, tombol panah, atau tombol di layar. gaskeun!";

    drawGame();
  }

  function drawGame() {
    g.clearRect(0, 0, 400, 400);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = gameMap[y][x];
        const px = x * tile;
        const py = y * tile;

        g.fillStyle = (x + y) % 2
          ? "#130d19" : "#17101e";
        g.fillRect(px, py, tile, tile);

        if (cell === "#") {
          g.fillStyle = "#30203a";
          g.fillRect(px + 3, py + 3, tile - 6, tile - 6);
          g.strokeStyle = "#56304d";
          g.strokeRect(px + 5, py + 5, tile - 10, tile - 10);
        }

        if (cell === "H") {
          g.save();
          g.font = "24px sans-serif";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillStyle = "#ff72b7";
          g.shadowColor = "#ff4da5";
          g.shadowBlur = 12;
          g.fillText("♥", px + 20, py + 21);
          g.restore();
        }

        if (cell === "E") {
          g.save();
          g.beginPath();
          g.arc(px + 20, py + 20, 12, 0, Math.PI * 2);
          g.strokeStyle = "#c4a0ff";
          g.lineWidth = 3;
          g.shadowColor = "#b58cff";
          g.shadowBlur = 12;
          g.stroke();
          g.restore();

          g.fillStyle = "#c7a9ff";
          g.font = "10px sans-serif";
          g.textAlign = "center";
          g.fillText("GO", px + 20, py + 23);
        }
      }
    }

    // Bola pemain
    g.save();
    g.beginPath();
    g.arc(player.x * tile + 20, player.y * tile + 20, 11, 0, Math.PI * 2);
    g.fillStyle = "#ff5ca8";
    g.shadowColor = "#ff5ca8";
    g.shadowBlur = 15;
    g.fill();
    g.restore();

    g.beginPath();
    g.arc(player.x * tile + 16, player.y * tile + 16, 3, 0, Math.PI * 2);
    g.fillStyle = "#fff2fa";
    g.fill();
  }

  const directions = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  };

  function movePlayer(dx, dy) {
    if (gameFinished) return;

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (
      nx < 0 || ny < 0 || nx >= 10 || ny >= 10 ||
      gameMap[ny][nx] === "#"
    ) return;

    player = { x: nx, y: ny };

    if (gameMap[ny][nx] === "H") {
      gameMap[ny][nx] = ".";
      collected++;

      $("#heartCount").textContent = `${collected} / 5`;
      $("#gameMessage").textContent =
        `hati terkumpul ${collected}/5. lanjut, pejuang cinta! 💗`;
    }

    if (gameMap[ny][nx] === "E") {
      if (collected >= 5) {
        gameFinished = true;
        $("#gameStatus").textContent = "CLEARED";
        $("#gameMessage").textContent =
          "MISI SELESAI! cieee, berhasil sampai tujuan. jangan lupa balik ke dunia nyata 😭💗";
        toast("level complete! 🎉");
      } else {
        $("#gameMessage").textContent =
          `portalnya belum kebuka. cari ${5 - collected} hati lagi!`;
      }
    }

    drawGame();
  }

  $$(".dpad button").forEach(btn => {
    btn.addEventListener("pointerdown", e => {
      e.preventDefault();
      const [dx, dy] = directions[btn.dataset.dir];
      movePlayer(dx, dy);
    });
  });

  window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();

    const keyMap = {
      arrowup: "up", w: "up",
      arrowdown: "down", s: "down",
      arrowleft: "left", a: "left",
      arrowright: "right", d: "right"
    };

    const direction = keyMap[key];
    if (!direction) return;

    if ($("#page-game").classList.contains("active")) {
      e.preventDefault();
      const [dx, dy] = directions[direction];
      movePlayer(dx, dy);
    }
  });

  $("#resetGame").addEventListener("click", resetGame);
  resetGame();

  // DOODLE CANVAS
  const drawingCanvas = $("#drawingCanvas");
  const dctx = drawingCanvas.getContext("2d");

  dctx.fillStyle = "#fffafd";
  dctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

  let isDrawing = false;
  let erasing = false;

  const brushColor = $("#brushColor");
  const brushSize = $("#brushSize");

  function drawingPoint(e) {
    const rect = drawingCanvas.getBoundingClientRect();

    return {
      x: (e.clientX - rect.left) *
        drawingCanvas.width / rect.width,
      y: (e.clientY - rect.top) *
        drawingCanvas.height / rect.height
    };
  }

  drawingCanvas.addEventListener("pointerdown", e => {
    isDrawing = true;
    drawingCanvas.setPointerCapture(e.pointerId);

    const p = drawingPoint(e);
    dctx.beginPath();
    dctx.moveTo(p.x, p.y);
  });

  drawingCanvas.addEventListener("pointermove", e => {
    if (!isDrawing) return;

    const p = drawingPoint(e);
    dctx.lineCap = "round";
    dctx.lineJoin = "round";
    dctx.lineWidth = Number(brushSize.value);
    dctx.strokeStyle = erasing ? "#fffafd" : brushColor.value;

    dctx.lineTo(p.x, p.y);
    dctx.stroke();
  });

  ["pointerup", "pointercancel", "lostpointercapture"].forEach(event => {
    drawingCanvas.addEventListener(event, () => {
      isDrawing = false;
    });
  });

  brushSize.addEventListener("input", () => {
    $("#brushValue").textContent = brushSize.value + " px";
  });

  $("#eraserBtn").addEventListener("click", () => {
    erasing = !erasing;
    $("#eraserBtn").textContent =
      erasing ? "penghapus: ON" : "penghapus";
  });

  $("#clearDrawing").addEventListener("click", () => {
    dctx.fillStyle = "#fffafd";
    dctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    toast("kanvas bersih. siap bikin masterpiece baru.");
  });

  function downloadCanvas(canvas, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  $("#downloadDrawing").addEventListener("click", () => {
    downloadCanvas(drawingCanvas, "love-exe-doodle.png");
    toast("gambar doodle siap disimpan ♡");
  });

  // LOVE CARD CREATOR
  const messageCard = $("#messageCard");
  const stickerLayer = $("#stickerLayer");

  let cardColor = "#21101f";
  let stickerId = 0;

  function updateCard() {
    $("#previewTitle").textContent =
      $("#cardTitle").value || "for someone special ♡";

    $("#previewMessage").textContent =
      $("#cardMessage").value || "tulis pesan kecil di sini ♡";
  }

  $("#cardTitle").addEventListener("input", updateCard);
  $("#cardMessage").addEventListener("input", updateCard);

  $$(".swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".swatch").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");

      cardColor = btn.dataset.color;
      messageCard.style.setProperty("--card-bg", cardColor);

      // Warna teks menyesuaikan latar pink terang.
      if (cardColor === "#f6dce9") {
        $("#previewTitle").style.color = "#39162a";
        $("#previewMessage").style.color = "#39162a";
      } else {
        $("#previewTitle").style.color = "#fff5fb";
        $("#previewMessage").style.color = "#f9e7f1";
      }
    });
  });

  function addSticker(symbol) {
    const el = document.createElement("span");
    el.className = "card-sticker";
    el.textContent = symbol;
    el.style.left = (15 + Math.random() * 65) + "%";
    el.style.top = (18 + Math.random() * 60) + "%";
    el.dataset.id = ++stickerId;

    stickerLayer.append(el);

    let dragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    el.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();

      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = el.offsetLeft;
      startTop = el.offsetTop;

      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", e => {
      if (!dragging) return;

      const maxX = messageCard.clientWidth - el.offsetWidth;
      const maxY = messageCard.clientHeight - el.offsetHeight;

      el.style.left = Math.max(0, Math.min(
        maxX, startLeft + e.clientX - startX
      )) + "px";

      el.style.top = Math.max(0, Math.min(
        maxY, startTop + e.clientY - startY
      )) + "px";
    });

    function stopDragging() {
      dragging = false;
    }

    el.addEventListener("pointerup", stopDragging);
    el.addEventListener("pointercancel", stopDragging);

    el.addEventListener("dblclick", () => {
      el.remove();
      toast("stiker dihapus ♡");
    });

    // Alternatif untuk HP: tap dua kali juga menghapus.
    let lastTap = 0;

    el.addEventListener("click", () => {
      const now = Date.now();
      if (now - lastTap < 350) {
        el.remove();
        toast("stiker dihapus ♡");
      }
      lastTap = now;
    });
  }

  $$(".stickers button").forEach(btn => {
    btn.addEventListener("click", () => {
      addSticker(btn.dataset.sticker);
    });
  });

  updateCard();

  // EKSPOR LOVE CARD MENJADI PNG
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(/\s+/);
    let line = "";
    let lines = 0;

    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + " ";

      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), x, y);
        line = words[i] + " ";
        y += lineHeight;
        lines++;

        if (lines >= maxLines - 1) {
          if (i < words.length - 1) line = line.trim() + "…";
          break;
        }
      } else {
        line = test;
      }
    }

    if (line.trim()) ctx.fillText(line.trim(), x, y);
  }

  function roundedRect(ctx, x, y, w, h, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  $("#downloadCard").addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = cardColor;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(
      1050, 80, 10, 1050, 80, 450
    );
    glow.addColorStop(0, "rgba(255,92,168,.35)");
    glow.addColorStop(1, "rgba(255,92,168,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,.30)";
    ctx.lineWidth = 2;
    roundedRect(ctx, 28, 28, w - 56, h - 56, 28);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,.15)";
    roundedRect(ctx, 45, 45, w - 90, h - 90, 20);
    ctx.stroke();

    const lightCard = cardColor === "#f6dce9";
    const titleColor = lightCard ? "#39162a" : "#fff5fb";
    const bodyColor = lightCard ? "#54243f" : "#f9e7f1";

    ctx.fillStyle = lightCard ? "#6e3455" : "#ffc3df";
    ctx.font = "22px monospace";
    ctx.textAlign = "left";
    ctx.fillText("A LITTLE NOTE FOR YOU", 75, 100);

    ctx.textAlign = "right";
    ctx.font = "34px sans-serif";
    ctx.fillText("♡", w - 75, 100);

    ctx.textAlign = "left";
    ctx.fillStyle = titleColor;
    ctx.font = "bold 58px sans-serif";

    wrapText(
      ctx, $("#previewTitle").textContent,
      75, 245, 1020, 70, 2
    );

    ctx.fillStyle = bodyColor;
    ctx.font = "29px sans-serif";

    wrapText(
      ctx, $("#previewMessage").textContent,
      78, 350, 1020, 48, 7
    );

    ctx.fillStyle = lightCard ? "#6e3455" : "#ffc3df";
    ctx.font = "20px monospace";
    ctx.fillText("made with a little courage ✦", 75, h - 78);

    // Masukkan stiker ke gambar yang diunduh.
    const cardRect = messageCard.getBoundingClientRect();

    $$(".card-sticker", stickerLayer).forEach(el => {
      const x = (
        el.offsetLeft + el.offsetWidth / 2
      ) / cardRect.width * w;

      const y = (
        el.offsetTop + el.offsetHeight / 2
      ) / cardRect.height * h;

      ctx.textAlign = "center";
     
