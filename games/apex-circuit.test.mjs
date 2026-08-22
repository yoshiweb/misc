import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const html = await readFile(new URL('./apex-circuit.html', import.meta.url), 'utf8');
const moduleSource = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];

test('Apex Circuit is a self-contained Three.js racing page', () => {
  assert.ok(moduleSource, 'module script should exist');
  assert.doesNotThrow(() => new Function(moduleSource.replace(/import \* as THREE from [^;]+;/, 'const THREE = {};')));
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/three@0\.181\.2/);
  assert.match(html, /id="game"/);
  assert.match(html, /id="joystick"/);
  assert.match(html, /id="joystickKnob"/);
  assert.match(html, /pointerdown/);
  assert.match(html, /setPointerCapture/);
  assert.match(html, /touch-action:none/);
});

test('the race has the requested flow, HUD, loop, AI, and feedback systems', () => {
  for (const id of ['titleScreen', 'resultsScreen', 'startButton', 'restartButton', 'minimap', 'speedValue', 'lapValue', 'positionValue']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const feature of ['state.phase=\'countdown\'', 'state.phase=\'race\'', 'state.phase=\'results\'', 'racers=[]', 'function updateCamera', 'function updateMap', 'AudioContext', 'speedLines', 'laps:3']) {
    assert.ok(html.includes(feature), `missing ${feature}`);
  }
  assert.doesNotMatch(html, /accelerateButton|brakeButton|steerButton/);
});

test('lap progression is checkpoint-gated and results never fabricate zero rival times', () => {
  assert.match(html, /checkpointPositions=\[Math\.floor\(N\*\.25\),Math\.floor\(N\*\.5\),Math\.floor\(N\*\.75\),0\]/);
  assert.match(html, /startProgress=12/);
  assert.match(html, /function crossed\(/);
  assert.match(html, /function advance\(r,amount\)/);
  assert.match(html, /r\.raceDistance\+=amount/);
  assert.match(html, /r\.lap=Math\.min\(state\.laps,Math\.max\(0,Math\.floor\(r\.raceDistance\/N\)\)\)/);
  assert.match(html, /if\(r\.raceDistance>=state\.laps\*N\)/);
  assert.match(html, /r\.finishTime=r\.finishTime\?\?state\.time/);
  assert.match(html, /formatTime\(r\.finishTime\?\?Math\.max\(\.1,state\.time/);
  assert.doesNotMatch(html, /state\.time-\(i\+1\)\*\.37/);
  assert.match(html, /player\.finished=true;player\.finishTime=player\.finishTime\?\?state\.time/);
  assert.match(html, /if\(a\.finished!==b\.finished\)return a\.finished\?-1:1/);
  assert.match(html, /if\(a\.finished\)return a\.finishTime-b\.finishTime/);
});

test('driving skill matters through corner grip and off-track penalties', () => {
  assert.match(html, /target:config\.aiBase\+i\*config\.aiStep/);
  assert.match(html, /turnAmount=clamp\(1-tangentNow\.dot\(tangentAhead\),0,1\)/);
  assert.match(html, /steeringError=Math\.max\(0,steeringNeed-steer\*turnDirection\)/);
  assert.match(html, /player\.lateral=clamp\(player\.lateral,-7\.4,7\.4\)/);
  assert.match(html, /const offTrack=Math\.abs\(player\.lateral\)>4\.8/);
  assert.match(html, /player\.speed=lerp\(player\.speed,Math\.min\(player\.speed,13\)/);
});

test('mobile steering prioritizes lateral input and restart removes stale cars', () => {
  assert.match(html, /Math\.abs\(input\.x\)>.35&&Math\.abs\(input\.x\)>Math\.abs\(input\.y\)\*1\.15/);
  assert.match(html, /const PLAYER_MAX_SPEED=22/);
  assert.match(html, /reverse=player\.speed<1&&input\.y>.78/);
  assert.match(html, /for\(const racer of racers\)scene\.remove\(racer\.mesh\)/);
  assert.match(html, /document\.querySelectorAll\('\.map-dot'\)\.forEach\(dot=>dot\.remove\(\)\)/);
  assert.match(html, /state\.accumulator\+=elapsed/);
  assert.match(html, /function trackSample\(progress\)/);
  assert.match(html, /center\[\(i\+1\)%N\]/);
  assert.match(html, /tangent\(i\)\.lerp\(tangent\(\(i\+1\)%N\)/);
});

test('VOID STRIKE-style floating joystick and generated visual assets are wired', async () => {
  assert.match(html, /function placeJoystick\(/);
  assert.match(html, /function moveJoystick\(/);
  assert.match(html, /canvas\.setPointerCapture\(e\.pointerId\)/);
  assert.match(html, /joystick\.style\.display='block'/);
  assert.match(html, /joystick\.style\.display='none'/);
  assert.match(html, /assets\/apex-circuit\/asphalt-texture\.png/);
  assert.match(html, /assets\/apex-circuit\/key-visual\.png/);
  assert.match(html, /new THREE\.TextureLoader\(\)/);
  for (const asset of ['./assets/apex-circuit/key-visual.png', './assets/apex-circuit/asphalt-texture.png']) {
    const bytes = await readFile(new URL(asset, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  }
});

test('the title keeps the key visual visible and the race supports keyboard arrows', () => {
  assert.match(html, /\.screen#titleScreen \.panel\{[^}]*background:transparent/);
  assert.match(html, /\.screen#titleScreen \.panel\{[^}]*border:0/);
  assert.match(html, /background:linear-gradient\(180deg,#020a1850/);
  assert.match(html, /const keyboard=\{up:false,down:false,left:false,right:false\}/);
  assert.match(html, /key==='arrowup'/);
  assert.match(html, /key==='arrowdown'/);
  assert.match(html, /key==='arrowleft'/);
  assert.match(html, /key==='arrowright'/);
  assert.match(html, /document\.addEventListener\('keyup'/);
  assert.match(html, /syncKeyboardInput\(\)/);
  assert.doesNotMatch(html, /id="dpad"|data-dpad-/);
});

test('Apex Circuit is installable as a fullscreen PWA', async () => {
  assert.match(html, /rel="manifest" href="apex-circuit\.webmanifest"/);
  assert.match(html, /apple-touch-icon" href="assets\/apex-circuit\/icon-192\.png"/);
  assert.match(html, /serviceWorker\.register\('apex-circuit-sw\.js',\{scope:'\.\/apex-circuit\.html'\}/);
  const manifest = JSON.parse(await readFile(new URL('./apex-circuit.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'fullscreen');
  assert.equal(manifest.start_url, './apex-circuit.html?source=pwa');
  assert.equal(manifest.scope, './apex-circuit.html');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512', '512x512']);
  const worker = await readFile(new URL('./apex-circuit-sw.js', import.meta.url), 'utf8');
  assert.match(worker, /apex-circuit-v2/);
  assert.match(worker, /assets\/apex-circuit\/icon-maskable-512\.png/);
  for (const asset of ['./assets/apex-circuit/icon-192.png', './assets/apex-circuit/icon-512.png', './assets/apex-circuit/icon-maskable-512.png']) {
    const bytes = await readFile(new URL(asset, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  }
});

test('the title flow supports staged progression with softer opening AI', () => {
  assert.match(html, /SINGLE PLAYER \/\/ MOBILE ARCADE/);
  assert.match(html, /TAP TO LAUNCH/);
  assert.match(html, /stageSettings=\[\s*\{name:'SUNRISE PASS',aiBase:10/);
  assert.match(html, /name:'NEON RIDGE',aiBase:12/);
  assert.match(html, /name:'NIGHT DESCENT',aiBase:14/);
  for (const stage of ['ROADWORKS', 'SPLIT LINE', 'WET CIRCUIT', 'RIVAL TACTICS', 'APEX FINAL']) {
    assert.match(html, new RegExp(`name:'${stage}'`));
  }
  assert.match(html, /function getStageConfig\(stage\)/);
  assert.match(html, /maxStage:999/);
  assert.match(html, /aiBase:base\.aiBase\+extra\*1\.35/);
  assert.match(html, /barrierLayout=/);
  assert.match(html, /boostLayout=/);
  assert.match(html, /wetLayout=/);
  assert.match(html, /function applyTrackChallenges\(r\)/);
  assert.match(html, /r\.speed\*=\.46/);
  assert.match(html, /r\.speed=clamp\(r\.speed\+2\.4/);
  assert.match(html, /config\.tactical&&gap<14/);
  assert.match(html, /state\.lastPosition=position/);
  assert.match(html, /cleared=position<=3/);
  assert.match(html, /state\.stage<state\.maxStage/);
  assert.match(html, /state\.stage\+\+/);
  assert.match(html, /apexCircuitBestStage/);
  assert.match(html, /NEXT STAGE/);
  assert.match(html, /playerMax:22,cornerDemand:\.16,apexSpeed:16/);
  assert.match(html, /playerMax:24,cornerDemand:\.11,apexSpeed:15/);
  assert.match(html, /playerMax:26,cornerDemand:\.08,apexSpeed:14/);
  assert.match(html, /綺麗なコーナー/);
  assert.match(html, /コーナー前：/);
  assert.match(html, /drivingHint/);
  assert.match(html, /aiTurn=clamp\(1-tangent\(aiIndex\)\.dot/);
  assert.match(html, /hazardLayout=\[\{progress:46,lateral:-2\.2/);
  assert.match(html, /config\.badRoad/);
  assert.match(html, /function hazardFor\(r\)/);
  assert.match(html, /r\.speed\*=\.54/);
  assert.match(html, /左右に避けよう/);
});

test('the portal links to the new game', async () => {
  const portal = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(portal, /games\/apex-circuit\.html/);
});
