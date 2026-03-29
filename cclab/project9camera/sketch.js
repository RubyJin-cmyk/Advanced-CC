let video;
let faceMesh;
let faces = [];

let appState = "camera"; // "camera" | "collage"

let pieces = [];
let selectedPiece = null;
let draggedPiece = null;

let guideBox = {
  x: 250,
  y: 120,
  w: 300,
  h: 360
};

const gravity = 0.9;
const bounceDamping = 0.42;

const ASSET_FILES = {
  hat: [
    "hat_01.png",
    "hat_02.png",
    "hat_03.png",
    "hat_04.png"
  ],
  upperbody: [
    "upperbody_01.png",
    "upperbody_02.png",
    "upperbody_03.png"
  ],
  lowerbody: [
    "lowerbody_01.png",
    "lowerbody_02.png",
    "lowerbody_03.png"
  ],
  arm: [
    "arm_01.png",
    "arm_02.png",
    "arm_03.png"
  ],
  accessory: [
    "accessory_01.png",
    "accessory_02.png"
  ]
};

let assetPools = {
  hat: [],
  upperbody: [],
  lowerbody: [],
  arm: [],
  accessory: []
};

function preload() {
  loadCategory("hat");
  loadCategory("upperbody");
  loadCategory("lowerbody");
  loadCategory("arm");
  loadCategory("accessory");
}

function loadCategory(category) {
  const files = ASSET_FILES[category] || [];
  for (let file of files) {
    assetPools[category].push(loadImage(`assets/${category}/${file}`));
  }
}

function setup() {
  createCanvas(800, 600);

  // 主画布保持高分屏清晰
  pixelDensity(window.devicePixelRatio || 1);

  textFont("Helvetica");

  video = createCapture(VIDEO);

  // 保持和 canvas 一致，避免 facemesh 坐标映射错位
  video.size(width, height);
  video.hide();

  // 阻止方向键 / 空格导致网页滚动
  window.addEventListener(
    "keydown",
    (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  faceMesh = ml5.faceMesh({ maxFaces: 1 }, () => {
    console.log("faceMesh ready");
    faceMesh.detectStart(video, gotFaces);
  });
}

function gotFaces(results) {
  faces = results || [];
}

function draw() {
  if (appState === "camera") {
    drawCameraUI();
    return;
  }

  drawCollageUI();
}

function drawCameraUI() {
  image(video, 0, 0, width, height);

  drawCameraOverlay();
  drawGuideFrame();

  if (faces.length > 0) {
    const box = getHeadBounds(faces[0]);

    noFill();
    strokeWeight(1.5);
    stroke(isFaceInsideGuide(box) ? color(160, 235, 190, 180) : color(255, 170, 170, 180));
    rect(box.x, box.y, box.w, box.h, 18);
  }

  drawCameraText();
}

function drawCameraOverlay() {
  noStroke();
  fill(12, 12, 14, 105);

  rect(0, 0, width, guideBox.y);
  rect(0, guideBox.y + guideBox.h, width, height - guideBox.y - guideBox.h);
  rect(0, guideBox.y, guideBox.x, guideBox.h);
  rect(guideBox.x + guideBox.w, guideBox.y, width - guideBox.x - guideBox.w, guideBox.h);

  fill(8, 8, 10, 54);
  rect(0, 0, width, height);

  drawTopCameraPanel();
  drawBottomCameraPanel();
}

function drawTopCameraPanel() {
  drawGlassPanel(28, 24, 280, 78, 18, 22);

  fill(255, 245);
  noStroke();
  textAlign(LEFT, TOP);

  textSize(24);
  text("face collage", 48, 42);

  textSize(12);
  fill(255, 180);
  text("align your face inside the frame", 48, 72);
}

function drawBottomCameraPanel() {
  const panelW = 250;
  const panelH = 56;
  const x = width / 2 - panelW / 2;
  const y = height - 84;

  drawGlassPanel(x, y, panelW, panelH, 16, 18);

  fill(255, 220);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);

  if (faces.length === 0) {
    text("waiting for face...", width / 2, y + panelH / 2);
  } else {
    const box = getHeadBounds(faces[0]);
    if (isFaceInsideGuide(box)) {
      text("click anywhere to capture", width / 2, y + panelH / 2);
    } else {
      text("move closer or farther to fit the frame", width / 2, y + panelH / 2);
    }
  }
}

function drawGuideFrame() {
  let frameColor = color(255, 255, 255, 210);

  if (faces.length > 0) {
    const box = getHeadBounds(faces[0]);
    if (isFaceInsideGuide(box)) {
      frameColor = color(170, 235, 190, 230);
    } else {
      frameColor = color(255, 175, 175, 220);
    }
  }

  push();
  drawingContext.shadowBlur = 24;
  drawingContext.shadowColor = frameColor.toString();

  noFill();
  strokeWeight(2);
  stroke(frameColor);
  rect(guideBox.x, guideBox.y, guideBox.w, guideBox.h, 26);

  pop();

  drawGuideCorners(frameColor);
}

function drawGuideCorners(c) {
  const x = guideBox.x;
  const y = guideBox.y;
  const w = guideBox.w;
  const h = guideBox.h;
  const len = 22;

  stroke(c);
  strokeWeight(3);
  noFill();

  line(x, y, x + len, y);
  line(x, y, x, y + len);

  line(x + w - len, y, x + w, y);
  line(x + w, y, x + w, y + len);

  line(x, y + h - len, x, y + h);
  line(x, y + h, x + len, y + h);

  line(x + w - len, y + h, x + w, y + h);
  line(x + w, y + h - len, x + w, y + h);
}

function drawCameraText() {
  noStroke();
  textAlign(CENTER, CENTER);

  fill(255, 190);
  textSize(12);
  text("click to continue", width / 2, guideBox.y - 26);
}

function drawCollageUI() {
  drawCollageBackground();

  updatePiecesPhysics();
  drawPieces();

  drawCollageHeader();
  drawCollageControlsPanel();
  drawCollageStatusPanel();
  drawCollageBottomHint();
}

function drawCollageBackground() {
  for (let y = 0; y < height; y++) {
    let c = lerpColor(color(247, 247, 245), color(235, 235, 232), y / height);
    stroke(c);
    line(0, y, width, y);
  }

  for (let i = 0; i < 900; i++) {
    stroke(0, 8);
    point(random(width), random(height));
  }
}

function drawPieces() {
  for (let p of pieces) {
    image(p.img, p.x, p.y, p.w, p.h);

    if (p.selected) {
      push();
      drawingContext.shadowBlur = 12;
      drawingContext.shadowColor = "rgba(110, 160, 255, 0.22)";

      noFill();
      stroke(90, 145, 255, 165);
      strokeWeight(1.5);
      rect(p.x - 6, p.y - 6, p.w + 12, p.h + 12, 10);

      pop();
    }
  }
}

function drawCollageHeader() {
  drawGlassPanel(20, 18, 210, 60, 16, 16);

  noStroke();
  fill(20, 220);
  textAlign(LEFT, TOP);

  textSize(20);
  text("collage editor", 38, 34);

  textSize(11);
  fill(20, 130);
  text("build, move, resize, layer", 38, 60);
}

function drawCollageControlsPanel() {
  drawGlassPanel(20, 96, 180, 214, 16, 14);

  noStroke();
  textAlign(LEFT, TOP);

  fill(15, 210);
  textSize(13);
  text("add pieces", 36, 114);

  fill(15, 140);
  textSize(12);
  text(
    "1  hat\n2  upper body\n3  lower body\n4  arm\n5  accessory",
    36,
    140
  );

  fill(15, 210);
  textSize(13);
  text("edit", 36, 220);

  fill(15, 140);
  textSize(12);
  text(
    "↑  enlarge\n↓  shrink\nf   bring front\nb   send back\ndelete  remove",
    36,
    246
  );
}

function drawCollageStatusPanel() {
  const x = width - 212;
  const y = 18;
  const w = 192;
  const h = 92;

  drawGlassPanel(x, y, w, h, 16, 14);

  noStroke();
  textAlign(LEFT, TOP);

  fill(15, 210);
  textSize(13);
  text("status", x + 16, y + 16);

  fill(15, 140);
  textSize(12);

  let selectedLabel = selectedPiece ? selectedPiece.type : "none";
  let totalLabel = `${pieces.length}`;

  text(`selected  ${selectedLabel}`, x + 16, y + 42);
  text(`pieces     ${totalLabel}`, x + 16, y + 62);
}

function drawCollageBottomHint() {
  const w = 290;
  const h = 48;
  const x = width / 2 - w / 2;
  const y = height - 66;

  drawGlassPanel(x, y, w, h, 16, 16);

  noStroke();
  fill(20, 170);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("drag pieces with mouse   ·   s save   ·   r retake", width / 2, y + h / 2);
}

function drawGlassPanel(x, y, w, h, radius = 16, alpha = 18) {
  noStroke();
  fill(255, alpha);
  rect(x, y, w, h, radius);

  stroke(255, 85);
  strokeWeight(1);
  noFill();
  rect(x, y, w, h, radius);
}

function updatePiecesPhysics() {
  for (let p of pieces) {
    if (!p.dragging && p.falling) {
      p.vy += gravity;
      p.y += p.vy;

      const floorY = height - p.h - 12;

      if (p.y >= floorY) {
        p.y = floorY;

        if (abs(p.vy) > 1.2) {
          p.vy *= -bounceDamping;
        } else {
          p.vy = 0;
          p.falling = false;
        }
      }
    }
  }
}

function mousePressed() {
  if (appState === "camera") {
    captureFacePiece();
    return;
  }

  if (appState === "collage") {
    selectOrDragPiece(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (draggedPiece) {
    draggedPiece.x = mouseX - draggedPiece.dragOffsetX;
    draggedPiece.y = mouseY - draggedPiece.dragOffsetY;

    draggedPiece.x = constrain(draggedPiece.x, 0, width - draggedPiece.w);
    draggedPiece.y = constrain(draggedPiece.y, 0, height - draggedPiece.h);
  }
}

function mouseReleased() {
  if (draggedPiece) {
    draggedPiece.dragging = false;
    draggedPiece.falling = false;
    draggedPiece.vy = 0;
    draggedPiece = null;
  }
}

function keyPressed() {
  if (appState !== "collage") {
    if (key === "r" || key === "R") {
      resetToCamera();
      return false;
    }

    if ([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
      return false;
    }

    return false;
  }

  if (key === "1") {
    spawnFromCategory("hat");
    return false;
  }

  if (key === "2") {
    spawnFromCategory("upperbody");
    return false;
  }

  if (key === "3") {
    spawnFromCategory("lowerbody");
    return false;
  }

  if (key === "4") {
    spawnFromCategory("arm");
    return false;
  }

  if (key === "5") {
    spawnFromCategory("accessory");
    return false;
  }

  if (keyCode === UP_ARROW) {
    resizeSelected(1.08);
    return false;
  }

  if (keyCode === DOWN_ARROW) {
    resizeSelected(0.92);
    return false;
  }

  if (key === "f" || key === "F") {
    bringSelectedToFront();
    return false;
  }

  if (key === "b" || key === "B") {
    sendSelectedToBack();
    return false;
  }

  if (key === "s" || key === "S") {
    let prev = selectedPiece;
    clearSelectionBoxForSave();
    saveCanvas("collage_output", "png");
    if (prev && pieces.includes(prev)) {
      setSelectedPiece(prev);
    }
    return false;
  }

  if (key === "r" || key === "R") {
    resetToCamera();
    return false;
  }

  if (keyCode === DELETE || keyCode === BACKSPACE) {
    deleteSelectedPiece();
    return false;
  }

  return false;
}

function captureFacePiece() {
  if (faces.length === 0) {
    console.log("no face yet");
    return;
  }

  const face = faces[0];
  const originalBox = getHeadBounds(face);

  if (!isFaceInsideGuide(originalBox)) {
    console.log("face not inside frame");
    return;
  }

  const snap = video.get();
  const fitted = captureFaceFromGuide(snap, originalBox);

  const warpedHead = exaggerateFaceFeatures(
    fitted.img,
    face,
    originalBox,
    fitted.refBox
  );

  const faceImg = makeEggMaskHead(warpedHead, fitted.refBox.w, fitted.refBox.h);

  const piece = createPiece({
    type: "face",
    img: faceImg,
    x: width / 2 - fitted.refBox.w / 2,
    y: 60,
    w: fitted.refBox.w,
    h: fitted.refBox.h
  });

  pieces.push(piece);
  setSelectedPiece(piece);
  appState = "collage";
}

function createPiece({ type, img, x, y, w, h }) {
  return {
    type,
    img,
    x,
    y,
    w,
    h,
    vy: 0,
    falling: true,
    dragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    selected: false
  };
}

function spawnFromCategory(category) {
  const pool = assetPools[category];
  if (!pool || pool.length === 0) {
    console.log(`no assets in category: ${category}`);
    return;
  }

  const img = random(pool);

  let scale = getDefaultScale(category, img);
  let w = img.width * scale;
  let h = img.height * scale;

  let piece = createPiece({
    type: category,
    img: img,
    x: random(60, max(61, width - w - 60)),
    y: -h,
    w: w,
    h: h
  });

  pieces.push(piece);
  setSelectedPiece(piece);
}

function getDefaultScale(category, img) {
  if (category === "hat") return 0.35;
  if (category === "upperbody") return 0.42;
  if (category === "lowerbody") return 0.42;
  if (category === "arm") return 0.35;
  if (category === "accessory") return 0.28;
  return 0.35;
}

function selectOrDragPiece(px, py) {
  selectedPiece = null;
  draggedPiece = null;

  for (let p of pieces) {
    p.selected = false;
  }

  for (let i = pieces.length - 1; i >= 0; i--) {
    let p = pieces[i];

    if (pointInPiece(px, py, p)) {
      pieces.splice(i, 1);
      pieces.push(p);

      setSelectedPiece(p);

      p.dragging = true;
      p.falling = false;
      p.vy = 0;
      p.dragOffsetX = px - p.x;
      p.dragOffsetY = py - p.y;

      draggedPiece = p;
      return;
    }
  }
}

function setSelectedPiece(piece) {
  for (let p of pieces) {
    p.selected = false;
  }
  piece.selected = true;
  selectedPiece = piece;
}

function pointInPiece(px, py, p) {
  return (
    px >= p.x &&
    px <= p.x + p.w &&
    py >= p.y &&
    py <= p.y + p.h
  );
}

function resizeSelected(multiplier) {
  if (!selectedPiece) return;

  let centerX = selectedPiece.x + selectedPiece.w / 2;
  let centerY = selectedPiece.y + selectedPiece.h / 2;

  let newW = selectedPiece.w * multiplier;
  let newH = selectedPiece.h * multiplier;

  newW = constrain(newW, 30, width * 0.9);
  newH = constrain(newH, 30, height * 0.9);

  selectedPiece.w = newW;
  selectedPiece.h = newH;
  selectedPiece.x = centerX - newW / 2;
  selectedPiece.y = centerY - newH / 2;

  selectedPiece.x = constrain(selectedPiece.x, 0, width - selectedPiece.w);
  selectedPiece.y = constrain(selectedPiece.y, 0, height - selectedPiece.h);
}

function bringSelectedToFront() {
  if (!selectedPiece) return;
  let idx = pieces.indexOf(selectedPiece);
  if (idx === -1) return;

  pieces.splice(idx, 1);
  pieces.push(selectedPiece);
}

function sendSelectedToBack() {
  if (!selectedPiece) return;
  let idx = pieces.indexOf(selectedPiece);
  if (idx === -1) return;

  pieces.splice(idx, 1);
  pieces.unshift(selectedPiece);
}

function deleteSelectedPiece() {
  if (!selectedPiece) return;

  let idx = pieces.indexOf(selectedPiece);
  if (idx !== -1) {
    pieces.splice(idx, 1);
  }

  selectedPiece = null;
}

function clearSelectionBoxForSave() {
  for (let p of pieces) {
    p.selected = false;
  }
  selectedPiece = null;
}

function resetToCamera() {
  pieces = [];
  selectedPiece = null;
  draggedPiece = null;
  appState = "camera";
}

function isFaceInsideGuide(box) {
  return (
    box.x >= guideBox.x &&
    box.y >= guideBox.y &&
    box.x + box.w <= guideBox.x + guideBox.w &&
    box.y + box.h <= guideBox.y + guideBox.h
  );
}

function captureFaceFromGuide(snap, box) {
  const raw = snap.get(box.x, box.y, box.w, box.h);

  // 提高脸图基础分辨率
  const targetW = 480;
  const targetH = 600;

  let g = createGraphics(targetW, targetH);
  g.pixelDensity(1);
  g.clear();
  g.image(raw, 0, 0, targetW, targetH);

  return {
    img: g.get(),
    refBox: {
      x: 0,
      y: 0,
      w: targetW,
      h: targetH
    }
  };
}

function exaggerateFaceFeatures(rawHead, face, originalBox, targetBox) {
  let img = rawHead.get();
  const pts = face.keypoints || face.scaledMesh || [];

  const leftEye = getFeatureCenterMapped(
    pts,
    [33, 133, 160, 159, 158, 144, 145, 153],
    originalBox,
    targetBox
  );

  const rightEye = getFeatureCenterMapped(
    pts,
    [362, 263, 387, 386, 385, 373, 374, 380],
    originalBox,
    targetBox
  );

  const mouth = getFeatureCenterMapped(
    pts,
    [13, 14, 78, 308, 82, 312],
    originalBox,
    targetBox
  );

  let eyeW = targetBox.w * 0.18;
  let eyeH = targetBox.h * 0.11;
  let mouthW = targetBox.w * 0.26;
  let mouthH = targetBox.h * 0.14;

  img = enlargePatchSoft(img, leftEye.x, leftEye.y - 4, eyeW, eyeH, 1.5);
  img = enlargePatchSoft(img, rightEye.x, rightEye.y - 4, eyeW, eyeH, 1.5);
  img = enlargePatchSoft(img, mouth.x, mouth.y, mouthW, mouthH, 1.22);

  return img;
}

function getAveragePoint(pts, indices) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let idx of indices) {
    let p = pts[idx];
    if (!p) continue;

    const px = p.x !== undefined ? p.x : p[0];
    const py = p.y !== undefined ? p.y : p[1];

    sumX += px;
    sumY += py;
    count++;
  }

  if (count === 0) {
    return { x: width / 2, y: height / 2 };
  }

  return {
    x: sumX / count,
    y: sumY / count
  };
}

function getFeatureCenterMapped(pts, indices, originalBox, targetBox) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let idx of indices) {
    let p = pts[idx];
    if (!p) continue;

    const px = p.x !== undefined ? p.x : p[0];
    const py = p.y !== undefined ? p.y : p[1];

    const localX = (px - originalBox.x) / originalBox.w;
    const localY = (py - originalBox.y) / originalBox.h;

    sumX += localX * targetBox.w;
    sumY += localY * targetBox.h;
    count++;
  }

  if (count === 0) {
    return {
      x: targetBox.w * 0.5,
      y: targetBox.h * 0.5
    };
  }

  return {
    x: sumX / count,
    y: sumY / count
  };
}

function enlargePatchSoft(baseImg, cx, cy, patchW, patchH, scale) {
  let sw = int(patchW);
  let sh = int(patchH);
  let sx = int(cx - sw / 2);
  let sy = int(cy - sh / 2);

  sx = constrain(sx, 0, baseImg.width - 1);
  sy = constrain(sy, 0, baseImg.height - 1);
  sw = constrain(sw, 1, baseImg.width - sx);
  sh = constrain(sh, 1, baseImg.height - sy);

  let patch = baseImg.get(sx, sy, sw, sh);

  let dw = sw * scale;
  let dh = sh * scale;
  let dx = cx - dw / 2;
  let dy = cy - dh / 2;

  let g = createGraphics(baseImg.width, baseImg.height);
  g.pixelDensity(1);
  g.clear();
  g.image(baseImg, 0, 0);

  let patchG = createGraphics(dw, dh);
  patchG.pixelDensity(1);
  patchG.clear();
  patchG.image(patch, 0, 0, dw, dh);

  let maskG = createGraphics(dw, dh);
  maskG.pixelDensity(1);
  maskG.clear();
  maskG.noStroke();
  maskG.fill(255);
  maskG.ellipse(dw / 2, dh / 2, dw * 0.95, dh * 0.95);

  let patchImg = patchG.get();
  let maskImg = maskG.get();
  patchImg.mask(maskImg);

  g.image(patchImg, dx, dy, dw, dh);

  return g.get();
}

function makeEggMaskHead(img, w, h) {
  let sourceG = createGraphics(w, h);
  sourceG.pixelDensity(1);
  sourceG.clear();
  sourceG.image(img, 0, 0, w, h);

  let maskG = createGraphics(w, h);
  maskG.pixelDensity(1);
  maskG.clear();
  maskG.noStroke();
  maskG.fill(255);

  maskG.beginShape();
  maskG.vertex(w * 0.50, h * 0.12);

  maskG.bezierVertex(
    w * 0.30, h * 0.10,
    w * 0.10, h * 0.28,
    w * 0.12, h * 0.58
  );

  maskG.bezierVertex(
    w * 0.14, h * 0.82,
    w * 0.30, h * 0.94,
    w * 0.50, h * 0.94
  );

  maskG.bezierVertex(
    w * 0.70, h * 0.94,
    w * 0.86, h * 0.82,
    w * 0.88, h * 0.58
  );

  maskG.bezierVertex(
    w * 0.90, h * 0.28,
    w * 0.70, h * 0.10,
    w * 0.50, h * 0.12
  );

  maskG.endShape(CLOSE);

  let masked = sourceG.get();
  let maskImg = maskG.get();
  masked.mask(maskImg);

  return masked;
}

function getHeadBounds(face) {
  const pts = face.keypoints || face.scaledMesh || [];
  if (!pts || pts.length === 0) {
    return { x: 0, y: 0, w: 1, h: 1 };
  }

  const leftEye = getAveragePoint(pts, [33, 133, 160, 159, 158, 144, 145, 153]);
  const rightEye = getAveragePoint(pts, [362, 263, 387, 386, 385, 373, 374, 380]);

  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const eyeCenterY = (leftEye.y + rightEye.y) / 2;
  const eyeDist = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y);

  let w = eyeDist * 2.45;
  let h = eyeDist * 3.45;

  let x = eyeCenterX - w / 2;
  let y = eyeCenterY - h * 0.46;

  x = constrain(x, 0, width - 1);
  y = constrain(y, 0, height - 1);
  w = constrain(w, 1, width - x);
  h = constrain(h, 1, height - y);

  return {
    x: int(x),
    y: int(y),
    w: int(w),
    h: int(h)
  };
}