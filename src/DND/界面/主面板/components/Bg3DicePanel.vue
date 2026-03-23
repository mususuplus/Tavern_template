<template>
  <section class="bg3-dice-card">
    <div class="bg3-dice-controls">
      <label class="bg3-dice-field">
        <span>检定属性</span>
        <select v-model="selectedAbility" :disabled="isRolling">
          <option v-for="ability in ABILITY_KEYS" :key="ability" :value="ability">
            {{ ability }} {{ formatSignedNumber(getAbilityModifier(data.角色.能力值[ability])) }}
          </option>
        </select>
      </label>

      <label class="bg3-dice-field">
        <span>目标值 DC / AC</span>
        <input
          v-model="targetValueInput"
          type="number"
          min="0"
          step="0.1"
          inputmode="decimal"
          :disabled="isRolling"
        />
      </label>

      <label class="bg3-dice-toggle">
        <input v-model="useProficiency" type="checkbox" :disabled="isRolling" />
        <span>加入熟练加值</span>
        <strong>{{ formatSignedNumber(proficiencyBonusValue) }}</strong>
      </label>
    </div>

    <div class="bg3-dice-breakdown">
      <article class="bg3-dice-stat">
        <span>属性值</span>
        <strong>{{ abilityScoreValue }}</strong>
        <em>{{ selectedAbility }}</em>
      </article>
      <article class="bg3-dice-stat">
        <span>属性调整值</span>
        <strong>{{ formatSignedNumber(abilityModifierValue) }}</strong>
        <em>floor 后参与计算</em>
      </article>
      <article class="bg3-dice-stat">
        <span>熟练加值</span>
        <strong>{{ formatSignedNumber(appliedProficiencyValue) }}</strong>
        <em>{{ useProficiency ? '已启用' : '未启用' }}</em>
      </article>
      <article class="bg3-dice-stat">
        <span>目标值</span>
        <strong>{{ targetValue }}</strong>
        <em>总值需 ≥ 目标</em>
      </article>
    </div>

    <button
      type="button"
      class="bg3-dice-panel"
      :class="{
        'bg3-dice-panel--ready': sceneReady,
        'bg3-dice-panel--rolling': isRolling,
        'bg3-dice-panel--settled': lastSettledResult !== null && !isRolling,
      }"
      :disabled="isRolling || !sceneReady"
      @click="rollDice"
    >
      <div class="bg3-dice-panel__stage">
        <div class="bg3-dice-panel__backdrop"></div>
        <div class="bg3-dice-panel__guide"></div>
        <div ref="viewportRef" class="bg3-dice-panel__viewport"></div>
        <div
          class="bg3-dice-panel__face-number"
          :class="{ 'bg3-dice-panel__face-number--hidden': isRolling }"
        >
          {{ lastSettledResult?.total ?? rollResult ?? 20 }}
        </div>

        <div
          class="bg3-dice-panel__result"
          :class="{ 'bg3-dice-panel__result--visible': lastSettledResult !== null && !isRolling }"
        >
          <span>{{ lastSettledResult?.success ? 'Success' : 'Failure' }}</span>
          <strong>{{ lastSettledResult ? `${lastSettledResult.total} vs ${lastSettledResult.target}` : '--' }}</strong>
        </div>
      </div>
    </button>

    <section class="bg3-dice-outcome" :class="{ 'bg3-dice-outcome--visible': lastSettledResult !== null && !isRolling }">
      <template v-if="lastSettledResult">
        <header class="bg3-dice-outcome__header">
          <div>
            <p class="bg3-dice-outcome__eyebrow">D20 Test</p>
            <h3>{{ lastSettledResult.success ? '检定成功' : '检定失败' }}</h3>
          </div>
          <strong :class="lastSettledResult.success ? 'is-success' : 'is-failure'">
            {{ lastSettledResult.total }} / {{ lastSettledResult.target }}
          </strong>
        </header>

        <div class="bg3-dice-outcome__formula">
          1d20 + 属性调整值 + 熟练加值 =
          <strong>
            {{ lastSettledResult.roll }} + {{ formatSignedNumber(lastSettledResult.abilityModifier) }} +
            {{ formatSignedNumber(lastSettledResult.proficiencyBonus) }}
          </strong>
        </div>

        <div class="bg3-dice-outcome__grid">
          <article>
            <span>d20 原始点数</span>
            <strong>{{ lastSettledResult.roll }}</strong>
          </article>
          <article>
            <span>检定属性</span>
            <strong>{{ lastSettledResult.ability }}</strong>
            <em>属性值 {{ lastSettledResult.abilityScore }}</em>
          </article>
          <article>
            <span>属性调整值</span>
            <strong>{{ formatSignedNumber(lastSettledResult.abilityModifier) }}</strong>
            <em>向下取整后计算</em>
          </article>
          <article>
            <span>熟练加值</span>
            <strong>{{ formatSignedNumber(lastSettledResult.proficiencyBonus) }}</strong>
            <em>{{ lastSettledResult.useProficiency ? '本次已加入熟练' : '本次未加入熟练' }}</em>
          </article>
          <article>
            <span>最终总值</span>
            <strong>{{ lastSettledResult.total }}</strong>
          </article>
          <article>
            <span>目标值</span>
            <strong>{{ lastSettledResult.target }}</strong>
          </article>
        </div>
      </template>
      <p v-else class="bg3-dice-outcome__empty">选择属性与目标值后掷骰，面板会在动画结束后展示完整检定结算。</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { ABILITY_KEYS, type AbilityKey, getAbilityModifier } from '../../shared/model';
import { useDndData } from '../../shared/useDndData';
import { fillRollResultInput, type RollInputTarget } from '../../shared/rollInputTarget';

type FaceMeta = {
  index: number;
  center: THREE.Vector3;
  normal: THREE.Vector3;
  up: THREE.Vector3;
};

type D20TestResult = {
  roll: number;
  ability: AbilityKey;
  abilityScore: number;
  abilityModifier: number;
  useProficiency: boolean;
  proficiencyBonus: number;
  target: number;
  total: number;
  success: boolean;
};

type RollAnimation = {
  duration: number;
  start: number;
  result: D20TestResult;
  startQuaternion: THREE.Quaternion;
  targetQuaternion: THREE.Quaternion;
  extraTurns: THREE.Vector3;
};

const props = withDefaults(
  defineProps<{
    inputTarget?: RollInputTarget;
  }>(),
  {
    inputTarget: 'main-panel',
  },
);

const FORWARD = new THREE.Vector3(0, 0, 1);
const SCREEN_UP = new THREE.Vector3(0, 1, 0);
const SCREEN_RIGHT = new THREE.Vector3(1, 0, 0);
const DICE_BASE_OFFSET = new THREE.Vector3(-0.04, 0.04, 0);
const FRONT_FACE_OFFSET = new THREE.Quaternion();

const viewportRef = ref<HTMLDivElement | null>(null);
const isRolling = ref(false);
const rollResult = ref<number | null>(null);
const lastSettledResult = ref<D20TestResult | null>(null);
const sceneReady = ref(false);
const selectedAbility = ref<AbilityKey>('敏捷');
const useProficiency = ref(true);
const targetValueInput = ref('15');

const { data } = useDndData();

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let diceGroup: THREE.Group | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId = 0;
let idleStartedAt = 0;
let rollAnimation: RollAnimation | null = null;

const disposableGeometries: THREE.BufferGeometry[] = [];
const disposableMaterials: THREE.Material[] = [];
const disposableTextures: THREE.Texture[] = [];
const faceQuaternionMap = new Map<number, THREE.Quaternion>();

const targetValue = computed(() => sanitizeTargetValue(targetValueInput.value));
const abilityScoreValue = computed(() => floorNumber(data.value.角色.能力值[selectedAbility.value]));
const abilityModifierValue = computed(() => floorNumber(getAbilityModifier(abilityScoreValue.value)));
const proficiencyBonusValue = computed(() => floorNumber(data.value.角色.熟练加值));
const appliedProficiencyValue = computed(() => (useProficiency.value ? proficiencyBonusValue.value : 0));

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function floorNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.floor(numeric) : fallback;
}

function sanitizeTargetValue(value: unknown) {
  return Math.max(0, floorNumber(value, 10));
}

function formatSignedNumber(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function pickFaceLayout(faces: FaceMeta[]) {
  const front = [...faces].sort((a, b) => b.center.z - a.center.z)[0];
  const candidates = faces.filter(face => face.index !== front.index).sort((a, b) => b.center.z - a.center.z);
  const picked = new Set<number>([front.index]);

  const pickBy = (score: (face: FaceMeta) => number) => {
    const options = candidates.filter(face => !picked.has(face.index));
    const chosen = [...options].sort((a, b) => score(b) - score(a))[0];
    picked.add(chosen.index);
    return chosen;
  };

  const topLeft = pickBy(face => face.center.y * 2.2 - face.center.x * 1.35 + face.center.z * 1.15);
  const left = pickBy(face => -face.center.x * 2 + face.center.y * 0.55 + face.center.z * 0.85);
  const right = pickBy(face => face.center.x * 2 + face.center.y * 0.5 + face.center.z * 0.82);
  const bottom = pickBy(face => -face.center.y * 2.1 - Math.abs(face.center.x) * 0.15 + face.center.z * 0.65);

  const remainingLabels = [1, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16, 17, 19];
  const remainingFaces = faces
    .filter(face => !picked.has(face.index))
    .sort((a, b) => b.center.z - a.center.z || b.center.y - a.center.y || a.center.x - b.center.x);

  return new Map<number, number>([
    [front.index, 20],
    [topLeft.index, 18],
    [left.index, 2],
    [right.index, 14],
    [bottom.index, 8],
    ...remainingFaces.map((face, index) => [face.index, remainingLabels[index]]),
  ]);
}

function createLabelTexture(label: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create dice label canvas');
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "700 136px 'Georgia'";
  ctx.shadowColor = 'rgba(255, 255, 255, 0.96)';
  ctx.shadowBlur = 28;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(label), canvas.width / 2, canvas.height / 2 + 4);
  ctx.shadowBlur = 0;
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(92, 100, 132, 0.52)';
  ctx.strokeText(String(label), canvas.width / 2, canvas.height / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  disposableTextures.push(texture);
  return texture;
}

function createFaceOrientation(face: FaceMeta) {
  const align = new THREE.Quaternion().setFromUnitVectors(face.normal, FORWARD);
  const alignedUp = face.up.clone().applyQuaternion(align).setZ(0);

  if (alignedUp.lengthSq() > 1e-6) {
    alignedUp.normalize();
    const angle = Math.atan2(alignedUp.x, alignedUp.y);
    const correction = new THREE.Quaternion().setFromAxisAngle(FORWARD, angle);
    align.premultiply(correction);
  }

  return FRONT_FACE_OFFSET.clone().multiply(align.normalize()).normalize();
}

function buildFaceMeta(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute('position');
  const faces: FaceMeta[] = [];

  for (let index = 0; index < position.count; index += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(position, index);
    const b = new THREE.Vector3().fromBufferAttribute(position, index + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, index + 2);
    const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
    const normal = b
      .clone()
      .sub(a)
      .cross(c.clone().sub(a))
      .normalize();

    const projectedUp = SCREEN_UP.clone().sub(normal.clone().multiplyScalar(SCREEN_UP.dot(normal)));
    const fallbackUp = SCREEN_RIGHT.clone().sub(normal.clone().multiplyScalar(SCREEN_RIGHT.dot(normal)));
    const up = (projectedUp.lengthSq() > 1e-4 ? projectedUp : fallbackUp).normalize();

    faces.push({
      index: index / 3,
      center,
      normal,
      up,
    });
  }

  return faces;
}

function createDiceGroup() {
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1.48, 0).toNonIndexed();
  geometry.computeVertexNormals();
  disposableGeometries.push(geometry);

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: '#8d93a8',
    metalness: 0.92,
    roughness: 0.28,
    clearcoat: 0.72,
    clearcoatRoughness: 0.24,
    reflectivity: 0.95,
  });
  disposableMaterials.push(bodyMaterial);

  const bodyMesh = new THREE.Mesh(geometry, bodyMaterial);
  group.add(bodyMesh);

  const innerGlowMaterial = new THREE.MeshStandardMaterial({
    color: '#b9bfd4',
    transparent: true,
    opacity: 0.18,
    emissive: '#7f86a9',
    emissiveIntensity: 0.3,
  });
  disposableMaterials.push(innerGlowMaterial);

  const innerGlow = new THREE.Mesh(geometry.clone(), innerGlowMaterial);
  innerGlow.scale.setScalar(0.975);
  disposableGeometries.push(innerGlow.geometry);
  group.add(innerGlow);

  const edgeGeometry = new THREE.EdgesGeometry(geometry, 20);
  disposableGeometries.push(edgeGeometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: '#f1f4ff',
    transparent: true,
    opacity: 0.42,
  });
  disposableMaterials.push(edgeMaterial);
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  edges.scale.setScalar(1.004);
  group.add(edges);

  const labelGeometry = new THREE.PlaneGeometry(0.66, 0.66);
  disposableGeometries.push(labelGeometry);
  const faces = buildFaceMeta(geometry);
  const labelMap = pickFaceLayout(faces);
  const labelGroup = new THREE.Group();

  faces.forEach(face => {
    const label = labelMap.get(face.index);

    if (!label) {
      return;
    }

    const labelMaterial = new THREE.MeshBasicMaterial({
      map: createLabelTexture(label),
      transparent: true,
      opacity: label === 20 ? 1 : 0.96,
      depthWrite: false,
      toneMapped: false,
    });
    disposableMaterials.push(labelMaterial);

    const plane = new THREE.Mesh(labelGeometry, labelMaterial);
    const right = new THREE.Vector3().crossVectors(face.up, face.normal).normalize();
    const basis = new THREE.Matrix4().makeBasis(right, face.up, face.normal);
    plane.quaternion.setFromRotationMatrix(basis);
    plane.position.copy(face.center.clone().multiplyScalar(0.79)).add(face.normal.clone().multiplyScalar(0.12));
    labelGroup.add(plane);

    faceQuaternionMap.set(label, createFaceOrientation(face));
  });

  group.add(labelGroup);
  group.scale.setScalar(0.68);
  group.rotation.order = 'YXZ';
  return group;
}

function setSceneSize() {
  if (!viewportRef.value || !renderer || !camera) {
    return;
  }

  const { clientWidth, clientHeight } = viewportRef.value;

  if (!clientWidth || !clientHeight) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(clientWidth, clientHeight, true);
  camera.aspect = clientWidth / clientHeight;
  camera.fov = clientWidth <= 260 ? 20.5 : clientWidth <= 360 ? 20 : 19;
  camera.position.set(0, 0.2, clientWidth <= 260 ? 8.1 : clientWidth <= 360 ? 7.8 : 7.45);
  camera.lookAt(0, 0.06, 0);
  camera.updateProjectionMatrix();
}

function animate(now: number) {
  if (!renderer || !scene || !camera || !diceGroup) {
    return;
  }

  if (idleStartedAt === 0) {
    idleStartedAt = now;
  }

  const elapsedSeconds = (now - idleStartedAt) / 1000;

  if (rollAnimation) {
    const progress = Math.min((now - rollAnimation.start) / rollAnimation.duration, 1);
    const settleProgress = easeInOutCubic(Math.max(0, (progress - 0.18) / 0.82));
    const decay = 1 - easeOutCubic(progress);
    const extraEuler = new THREE.Euler(
      rollAnimation.extraTurns.x * Math.PI * 2 * decay,
      rollAnimation.extraTurns.y * Math.PI * 2 * decay,
      rollAnimation.extraTurns.z * Math.PI * 2 * decay,
      'YXZ',
    );
    const extraQuaternion = new THREE.Quaternion().setFromEuler(extraEuler);
    const blendedQuaternion = rollAnimation.startQuaternion.clone().slerp(rollAnimation.targetQuaternion, settleProgress);
    blendedQuaternion.premultiply(extraQuaternion).normalize();

    diceGroup.quaternion.copy(blendedQuaternion);
    diceGroup.position.copy(DICE_BASE_OFFSET);

    if (progress >= 1) {
      diceGroup.quaternion.copy(rollAnimation.targetQuaternion);
      diceGroup.position.copy(DICE_BASE_OFFSET);
      rollResult.value = rollAnimation.result.roll;
      lastSettledResult.value = rollAnimation.result;
      fillRollResultInput(props.inputTarget, rollAnimation.result);
      isRolling.value = false;
      rollAnimation = null;
      idleStartedAt = now;
    }
  } else {
    const idleQuaternion = faceQuaternionMap.get(rollResult.value ?? 20) ?? FRONT_FACE_OFFSET;
    const hoverY = Math.sin(elapsedSeconds * 1.4) * 0.04;
    const sway = Math.sin(elapsedSeconds * 0.92) * 0.018;
    const nod = Math.cos(elapsedSeconds * 1.12) * 0.014;
    diceGroup.quaternion.copy(
      idleQuaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(nod, sway, 0, 'YXZ'))),
    );
    diceGroup.position.copy(DICE_BASE_OFFSET);
    diceGroup.position.y += hoverY;
  }

  renderer.render(scene, camera);
  rafId = window.requestAnimationFrame(animate);
}

function createTestResultSnapshot(roll: number): D20TestResult {
  const ability = selectedAbility.value;
  const abilityScore = floorNumber(data.value.角色.能力值[ability]);
  const abilityModifier = floorNumber(getAbilityModifier(abilityScore));
  const proficiencyBonus = useProficiency.value ? floorNumber(data.value.角色.熟练加值) : 0;
  const target = sanitizeTargetValue(targetValueInput.value);
  const normalizedRoll = floorNumber(roll);
  const total = normalizedRoll + abilityModifier + proficiencyBonus;

  return {
    roll: normalizedRoll,
    ability,
    abilityScore,
    abilityModifier,
    useProficiency: useProficiency.value,
    proficiencyBonus,
    target,
    total,
    success: total >= target,
  };
}

function rollDice() {
  if (!diceGroup || isRolling.value) {
    return;
  }

  const roll = Math.floor(Math.random() * 20) + 1;
  const snapshot = createTestResultSnapshot(roll);
  const targetQuaternion = faceQuaternionMap.get(roll)?.clone();

  if (!targetQuaternion) {
    return;
  }

  const startQuaternion = diceGroup.quaternion.clone();
  rollResult.value = null;
  isRolling.value = true;
  rollAnimation = {
    duration: 2050,
    start: performance.now(),
    result: snapshot,
    startQuaternion,
    targetQuaternion,
    extraTurns: new THREE.Vector3(
      4.4 + Math.random() * 1.3,
      5.6 + Math.random() * 1.4,
      3.5 + Math.random() * 1.1,
    ),
  };
}

function initScene() {
  if (!viewportRef.value) {
    return;
  }

  cleanupScene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.classList.add('bg3-dice-panel__canvas');
  viewportRef.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(19, 1, 0.1, 20);
  camera.position.set(0, 0.2, 7.45);
  camera.lookAt(0, 0.06, 0);

  const ambient = new THREE.AmbientLight('#b2b8d4', 1.35);
  const key = new THREE.DirectionalLight('#f7f8ff', 2.7);
  key.position.set(2.6, 3.2, 4.8);
  const fill = new THREE.DirectionalLight('#8d9bc9', 1.15);
  fill.position.set(-3.2, -0.4, 3.4);
  const rim = new THREE.PointLight('#fefcff', 1.6, 12, 2);
  rim.position.set(0.2, 2.4, 2.8);

  scene.add(ambient, key, fill, rim);

  const haloGeometry = new THREE.RingGeometry(1.6, 2.38, 128);
  disposableGeometries.push(haloGeometry);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: '#c7cde9',
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  });
  disposableMaterials.push(haloMaterial);
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, -1.82, 0);
  scene.add(halo);

  diceGroup = createDiceGroup();
  scene.add(diceGroup);

  setSceneSize();
  resizeObserver = new ResizeObserver(() => setSceneSize());
  resizeObserver.observe(viewportRef.value);

  sceneReady.value = true;
  rafId = window.requestAnimationFrame(animate);
}

function cleanupScene() {
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  resizeObserver?.disconnect();
  resizeObserver = null;

  disposableTextures.forEach(texture => texture.dispose());
  disposableMaterials.forEach(material => material.dispose());
  disposableGeometries.forEach(geometry => geometry.dispose());

  renderer?.dispose();

  if (renderer?.domElement && viewportRef.value?.contains(renderer.domElement)) {
    viewportRef.value.removeChild(renderer.domElement);
  }

  faceQuaternionMap.clear();
  disposableTextures.length = 0;
  disposableMaterials.length = 0;
  disposableGeometries.length = 0;
  renderer = null;
  scene = null;
  camera = null;
  diceGroup = null;
  rollAnimation = null;
}

onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  cleanupScene();
});
</script>

<style scoped lang="scss">
.bg3-dice-card {
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid var(--dnd-border);
  background:
    radial-gradient(circle at top left, rgba(215, 169, 91, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(56, 40, 29, 0.9), rgba(24, 18, 14, 0.96)),
    var(--dnd-panel);
  box-shadow: var(--dnd-shadow);
}


.bg3-dice-controls,
.bg3-dice-breakdown,
.bg3-dice-outcome__grid {
  display: grid;
}

.bg3-dice-controls {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.bg3-dice-field,
.bg3-dice-toggle {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid rgba(183, 190, 221, 0.12);
  background: rgba(16, 15, 24, 0.56);
}

.bg3-dice-field span,
.bg3-dice-toggle span,
.bg3-dice-stat span,
.bg3-dice-outcome__eyebrow,
.bg3-dice-outcome__grid span,
.bg3-dice-outcome__grid em {
  color: rgba(214, 219, 244, 0.72);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bg3-dice-field select,
.bg3-dice-field input {
  width: 100%;
  border: 1px solid rgba(197, 203, 232, 0.18);
  background: rgba(10, 11, 18, 0.88);
  color: #eef1ff;
  padding: 9px 10px;
}

.bg3-dice-toggle {
  align-content: start;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 10px;
}

.bg3-dice-toggle input {
  margin: 0;
}

.bg3-dice-toggle strong,
.bg3-dice-stat strong,
.bg3-dice-outcome__header strong,
.bg3-dice-outcome__grid strong {
  font-family: var(--dnd-font-display);
}

.bg3-dice-breakdown {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.bg3-dice-stat {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid rgba(183, 190, 221, 0.1);
  background: rgba(11, 11, 18, 0.56);
}

.bg3-dice-stat strong {
  font-size: 20px;
  color: #eef1ff;
}

.bg3-dice-stat em {
  color: rgba(214, 219, 244, 0.78);
  font-style: normal;
  line-height: 1.4;
}

.bg3-dice-panel {
  width: 100%;
  padding: 0;
  appearance: none;
  border: 1px solid rgba(183, 190, 221, 0.16);
  background:
    radial-gradient(circle at 50% 16%, rgba(216, 223, 255, 0.06), transparent 22%),
    linear-gradient(180deg, rgba(26, 24, 38, 0.98), rgba(18, 17, 27, 0.98));
  color: inherit;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.bg3-dice-panel:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(198, 205, 236, 0.3);
  box-shadow:
    0 18px 38px rgba(0, 0, 0, 0.34),
    inset 0 0 0 1px rgba(227, 232, 255, 0.04);
}

.bg3-dice-panel:disabled {
  cursor: not-allowed;
}

.bg3-dice-panel__stage {
  position: relative;
  aspect-ratio: 1 / 0.54;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 46%, rgba(116, 125, 170, 0.1), transparent 42%),
    linear-gradient(180deg, rgba(41, 37, 58, 0.92), rgba(23, 21, 34, 0.98));
}

.bg3-dice-panel__backdrop,
.bg3-dice-panel__guide,
.bg3-dice-panel__viewport,
.bg3-dice-panel__face-number,
.bg3-dice-panel__result {
  position: absolute;
}

.bg3-dice-panel__backdrop {
  inset: 0;
  background:
    radial-gradient(circle at 50% 42%, rgba(215, 221, 255, 0.08), transparent 24%),
    radial-gradient(circle at 50% 74%, rgba(53, 59, 88, 0.5), transparent 28%);
}

.bg3-dice-panel__guide {
  inset: 12px;
  border-radius: 16px;
  background:
    radial-gradient(circle at 50% 44%, transparent 0 34%, rgba(173, 182, 222, 0.12) 34.5% 35.1%, transparent 35.6% 100%),
    radial-gradient(circle at 50% 44%, transparent 0 53%, rgba(173, 182, 222, 0.07) 53.4% 53.9%, transparent 54.2% 100%);
  opacity: 0.72;
}

.bg3-dice-panel__viewport {
  inset: 0;
  overflow: hidden;
}

.bg3-dice-panel__face-number {
  top: 50%;
  left: 50%;
  z-index: 2;
  min-width: 54px;
  padding: 1px 8px 3px;
  transform: translate(-50%, -34%);
  color: rgba(233, 236, 245, 0.92);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(24px, 4.1vw, 44px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  text-align: center;
  -webkit-text-stroke: 1px rgba(70, 77, 102, 0.82);
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08),
    0 -1px 0 rgba(40, 44, 58, 0.78),
    0 2px 4px rgba(8, 10, 18, 0.34);
  filter: saturate(0.82) brightness(0.96);
  opacity: 1;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
  pointer-events: none;
}

.bg3-dice-panel__face-number--hidden {
  opacity: 0;
  transform: translate(-50%, -30%) scale(0.96);
}

.bg3-dice-panel__canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.bg3-dice-panel__result {
  top: 10px;
  right: 10px;
  z-index: 2;
  display: grid;
  gap: 2px;
  min-width: 90px;
  padding: 7px 9px;
  border: 1px solid rgba(197, 203, 232, 0.18);
  border-radius: 12px;
  background: rgba(22, 21, 31, 0.78);
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateY(-8px);
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.bg3-dice-panel__result span {
  margin: 0;
  color: rgba(214, 219, 244, 0.76);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.bg3-dice-panel__result--visible {
  opacity: 1;
  transform: translateY(0);
}

.bg3-dice-panel__result strong {
  font-family: var(--dnd-font-display);
  font-size: 16px;
  color: #eef1ff;
}

.bg3-dice-panel--ready .bg3-dice-panel__viewport::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 18%;
  width: 34%;
  height: 8%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(10, 11, 18, 0.82), rgba(10, 11, 18, 0));
  filter: blur(10px);
}

.bg3-dice-outcome {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(183, 190, 221, 0.12);
  background: rgba(14, 14, 22, 0.7);
  opacity: 0.88;
  transition:
    opacity 180ms ease,
    border-color 180ms ease;
}

.bg3-dice-outcome--visible {
  opacity: 1;
  border-color: rgba(197, 203, 232, 0.2);
}

.bg3-dice-outcome__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.bg3-dice-outcome__header h3,
.bg3-dice-outcome__formula {
  margin: 0;
}

.bg3-dice-outcome__header h3 {
  font-family: var(--dnd-font-display);
  font-size: 22px;
  color: #eef1ff;
}

.bg3-dice-outcome__header strong {
  font-size: 24px;
}

.bg3-dice-outcome__header .is-success {
  color: #b8f0c7;
}

.bg3-dice-outcome__header .is-failure {
  color: #ffb3b3;
}

.bg3-dice-outcome__formula {
  color: rgba(238, 241, 255, 0.9);
  line-height: 1.6;
}

.bg3-dice-outcome__formula strong {
  color: #ffffff;
}

.bg3-dice-outcome__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.bg3-dice-outcome__grid article {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid rgba(197, 203, 232, 0.1);
  background: rgba(10, 10, 16, 0.56);
}

.bg3-dice-outcome__grid strong {
  font-size: 18px;
  color: #eef1ff;
}

.bg3-dice-outcome__grid em {
  font-style: normal;
  line-height: 1.5;
  text-transform: none;
}

.bg3-dice-outcome__empty {
  margin: 0;
  color: rgba(214, 219, 244, 0.78);
  line-height: 1.7;
}

@media (max-width: 1240px) {
  .bg3-dice-controls,
  .bg3-dice-breakdown,
  .bg3-dice-outcome__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bg3-dice-panel__stage {
    aspect-ratio: 1 / 0.5;
  }
}

@media (max-width: 960px) {
  .bg3-dice-controls {
    grid-template-columns: 1fr;
  }

  .bg3-dice-panel__stage {
    aspect-ratio: 1 / 0.48;
  }
}

@media (max-width: 720px) {
  .bg3-dice-card {
    padding: 14px;
  }

  .bg3-dice-breakdown,
  .bg3-dice-outcome__grid {
    grid-template-columns: 1fr;
  }

  .bg3-dice-outcome__header {
    display: grid;
  }

  .bg3-dice-panel__stage {
    aspect-ratio: 1 / 0.44;
  }
}
</style>
