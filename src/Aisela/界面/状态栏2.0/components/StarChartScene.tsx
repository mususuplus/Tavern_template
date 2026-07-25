import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

// @ts-expect-error The installed Three.js runtime has no bundled declarations in this template.
import * as THREE from 'three';

import type { RegionLore, RegionSculpture, RenderQuality } from '../types';

type StarChartSceneProps = {
  regions: RegionLore[];
  selectedRegionName: string;
  quality: RenderQuality;
  reducedMotion: boolean;
  onSelectRegion: (name: string) => void;
};

type SystemPlacement = {
  position: [number, number, number];
  fallback: [number, number];
  label: 'right' | 'left' | 'above' | 'below';
  radius: number;
};

type DisposableMaterial = { dispose?: () => void };
type SceneObject = {
  geometry?: { dispose?: () => void };
  material?: DisposableMaterial | DisposableMaterial[];
};

const systemPlacements: Record<RegionSculpture, SystemPlacement> = {
  winter: { position: [-5.8, 2.7, -8.5], fallback: [16, 24], label: 'right', radius: 0.78 },
  emerald: { position: [-2.15, -0.8, -3.2], fallback: [34, 57], label: 'left', radius: 0.92 },
  forest: { position: [0.15, 2.6, -7.7], fallback: [51, 23], label: 'below', radius: 0.8 },
  desert: { position: [4.65, 1.15, -6.4], fallback: [76, 39], label: 'right', radius: 0.88 },
  withered: { position: [2.65, -3.25, -2.8], fallback: [66, 74], label: 'right', radius: 0.72 },
  shadow: { position: [-3.35, -2.85, -6.2], fallback: [33, 78], label: 'left', radius: 0.82 },
  sky: { position: [6.1, 3.7, -11.6], fallback: [84, 15], label: 'left', radius: 0.98 },
};

const topology: Array<[RegionSculpture, RegionSculpture]> = [
  ['winter', 'emerald'],
  ['emerald', 'forest'],
  ['forest', 'sky'],
  ['forest', 'desert'],
  ['emerald', 'shadow'],
  ['shadow', 'withered'],
  ['withered', 'desert'],
];

const qualityProfiles: Record<RenderQuality, { particles: number; dpr: number; segments: number }> = {
  high: { particles: 1450, dpr: 2, segments: 48 },
  balanced: { particles: 560, dpr: 1.4, segments: 36 },
  low: { particles: 110, dpr: 0.85, segments: 22 },
};

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object: SceneObject) => {
    object.geometry?.dispose?.();
    const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
    materials.forEach(material => material.dispose?.());
  });
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.09, 'rgba(235, 250, 245, 0.98)');
  gradient.addColorStop(0.3, 'rgba(128, 222, 192, 0.34)');
  gradient.addColorStop(0.62, 'rgba(92, 162, 220, 0.07)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSeededRandom(seedValue: number) {
  let seed = seedValue;
  return () => {
    seed = (seed * 16_807) % 2_147_483_647;
    return (seed - 1) / 2_147_483_646;
  };
}

function planetGeometryFor(sculpture: RegionSculpture, radius: number, segments: number) {
  if (sculpture === 'winter' || sculpture === 'sky') return new THREE.IcosahedronGeometry(radius, 4);
  if (sculpture === 'shadow') return new THREE.DodecahedronGeometry(radius, 3);
  return new THREE.SphereGeometry(radius, segments, Math.max(14, Math.round(segments * 0.72)));
}

/**
 * A first-person stellar flight: the user looks through the astronomical field
 * rather than orbiting a centerpiece. Region systems are modeled as lit 3D
 * worlds, while the existing MVU-backed selection contract remains unchanged.
 */
export function StarChartScene({
  regions,
  selectedRegionName,
  quality,
  reducedMotion,
  onSelectRegion,
}: StarChartSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectionRef = useRef(selectedRegionName);
  const onSelectRef = useRef(onSelectRegion);
  const resetViewRef = useRef<() => void>(() => undefined);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    selectionRef.current = selectedRegionName;
  }, [selectedRegionName]);

  useEffect(() => {
    onSelectRef.current = onSelectRegion;
  }, [onSelectRegion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    setFallback(false);
    const profile = qualityProfiles[quality];
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: quality !== 'low',
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallback(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040912, 0.023);
    const camera = new THREE.PerspectiveCamera(62, 1, 0.08, 80);
    const defaultPosition = new THREE.Vector3(0, 0.35, 9.4);
    let yaw = 0;
    let pitch = -0.035;
    camera.position.copy(defaultPosition);
    camera.rotation.order = 'YXZ';

    const applyView = () => {
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
      camera.rotation.z = 0;
    };
    applyView();
    resetViewRef.current = () => {
      camera.position.copy(defaultPosition);
      yaw = 0;
      pitch = -0.035;
      applyView();
    };

    scene.add(new THREE.HemisphereLight(0x8bc6dc, 0x071115, 1.45));
    const keyLight = new THREE.DirectionalLight(0xd9edff, 1.65);
    keyLight.position.set(-4, 7, 5);
    scene.add(keyLight);

    const field = new THREE.Group();
    scene.add(field);
    const glowTexture = createGlowTexture();
    const systemObjects: Array<{
      atmosphere: THREE.Mesh;
      core: THREE.Mesh;
      corona: THREE.Sprite;
      orbitDust: THREE.Points;
      region: RegionLore;
      system: THREE.Group;
    }> = [];
    const systemsBySculpture = new Map<RegionSculpture, THREE.Group>();
    const hitTargets: THREE.Mesh[] = [];

    regions.forEach((region, index) => {
      const placement = systemPlacements[region.sculpture];
      const accent = new THREE.Color(region.accent);
      const system = new THREE.Group();
      system.position.set(...placement.position);
      system.userData.regionName = region.name;
      system.userData.pulseOffset = index * 0.92;
      const radius = placement.radius;

      const core = new THREE.Mesh(
        planetGeometryFor(region.sculpture, radius, profile.segments),
        new THREE.MeshPhysicalMaterial({
          color: accent.clone().multiplyScalar(region.sculpture === 'shadow' ? 0.34 : 0.62),
          emissive: accent.clone().multiplyScalar(0.24),
          emissiveIntensity: 0.95,
          metalness: region.sculpture === 'winter' || region.sculpture === 'sky' ? 0.48 : 0.2,
          roughness: region.sculpture === 'desert' ? 0.78 : 0.38,
          clearcoat: 0.46,
          clearcoatRoughness: 0.25,
        }),
      );
      core.rotation.set(index * 0.42, index * 0.71, index * 0.25);
      system.add(core);

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.17, Math.max(18, profile.segments - 8), 16),
        new THREE.MeshBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.085,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      system.add(atmosphere);

      const corona = new THREE.Sprite(
        new THREE.SpriteMaterial({
          color: accent,
          map: glowTexture ?? undefined,
          transparent: true,
          opacity: 0.52,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      corona.scale.setScalar(radius * 4.6);
      system.add(corona);

      const dustRandom = createSeededRandom(71_297 + index * 141);
      const dustCount = quality === 'high' ? 48 : quality === 'balanced' ? 24 : 8;
      const dustPositions = new Float32Array(dustCount * 3);
      for (let dustIndex = 0; dustIndex < dustCount; dustIndex += 1) {
        const angle = dustRandom() * Math.PI * 2;
        const distance = radius * (1.55 + dustRandom() * 1.1);
        dustPositions[dustIndex * 3] = Math.cos(angle) * distance;
        dustPositions[dustIndex * 3 + 1] = (dustRandom() - 0.5) * radius * 0.42;
        dustPositions[dustIndex * 3 + 2] = Math.sin(angle) * distance * 0.46;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const orbitDust = new THREE.Points(
        dustGeometry,
        new THREE.PointsMaterial({
          color: accent.clone().lerp(new THREE.Color(0xffffff), 0.38),
          size: 0.043,
          transparent: true,
          opacity: 0.74,
          depthWrite: false,
        }),
      );
      system.add(orbitDust);

      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.45, 14, 14),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hitTarget.userData.regionName = region.name;
      system.add(hitTarget);
      hitTargets.push(hitTarget);
      systemObjects.push({ atmosphere, core, corona, orbitDust, region, system });
      systemsBySculpture.set(region.sculpture, system);
      field.add(system);

      const systemLight = new THREE.PointLight(accent, 2.8, radius * 8.5, 2);
      system.add(systemLight);
    });

    const links: Array<{ regions: [string, string]; material: THREE.LineBasicMaterial }> = [];
    topology.forEach(([fromSculpture, toSculpture], index) => {
      const from = systemsBySculpture.get(fromSculpture);
      const to = systemsBySculpture.get(toSculpture);
      if (!from || !to) return;

      const midpoint = from.position.clone().lerp(to.position, 0.5);
      midpoint.y += index % 2 === 0 ? 0.55 : -0.42;
      midpoint.x += index % 3 === 0 ? 0.26 : -0.15;
      const geometry = new THREE.BufferGeometry().setFromPoints(
        new THREE.QuadraticBezierCurve3(from.position.clone(), midpoint, to.position.clone()).getPoints(44),
      );
      const material = new THREE.LineBasicMaterial({
        color: 0x6d8e9c,
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
      });
      field.add(new THREE.Line(geometry, material));
      links.push({ regions: [String(from.userData.regionName), String(to.userData.regionName)], material });
    });

    const random = createSeededRandom(528_101);
    const particlePositions = new Float32Array(profile.particles * 3);
    const particleColors = new Float32Array(profile.particles * 3);
    for (let index = 0; index < profile.particles; index += 1) {
      const radius = 10 + random() * 32;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      particlePositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[index * 3 + 1] = radius * Math.cos(phi);
      particlePositions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 8;
      const warmth = random();
      particleColors[index * 3] = warmth > 0.88 ? 0.95 : 0.48;
      particleColors[index * 3 + 1] = warmth > 0.88 ? 0.72 : 0.7;
      particleColors[index * 3 + 2] = warmth > 0.88 ? 0.48 : 0.9;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: quality === 'high' ? 0.054 : 0.04,
        vertexColors: true,
        transparent: true,
        opacity: quality === 'low' ? 0.44 : 0.82,
        depthWrite: false,
      }),
    );
    scene.add(particles);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const forward = new THREE.Vector3();
    const projectedPosition = new THREE.Vector3();
    let pointerState: { hasDragged: boolean; x: number; y: number } | null = null;
    let animationFrame = 0;
    let visible = !document.hidden;

    const updateSize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.dpr));
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();

    const hitTest = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(hitTargets, false)[0]?.object as THREE.Mesh | undefined;
    };
    const constrainFlight = () => {
      if (camera.position.length() > 23) camera.position.setLength(23);
      camera.position.y = Math.max(-8, Math.min(8, camera.position.y));
      systemObjects.forEach(({ system }) => {
        const separation = camera.position.distanceTo(system.position);
        if (separation >= 1.35) return;
        camera.position.addScaledVector(camera.position.clone().sub(system.position).normalize(), 1.35 - separation);
      });
    };
    const handlePointerDown = (event: PointerEvent) => {
      canvas.focus();
      canvas.setPointerCapture(event.pointerId);
      pointerState = { hasDragged: false, x: event.clientX, y: event.clientY };
      canvas.style.cursor = 'grabbing';
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerState) {
        canvas.style.cursor = hitTest(event) ? 'pointer' : 'grab';
        return;
      }
      const deltaX = event.clientX - pointerState.x;
      const deltaY = event.clientY - pointerState.y;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 2) pointerState.hasDragged = true;
      yaw -= deltaX * 0.0044;
      pitch = Math.max(-1.22, Math.min(1.22, pitch - deltaY * 0.0044));
      pointerState.x = event.clientX;
      pointerState.y = event.clientY;
      applyView();
    };
    const handlePointerUp = (event: PointerEvent) => {
      const wasDragged = pointerState?.hasDragged;
      pointerState = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      canvas.style.cursor = hitTest(event) ? 'pointer' : 'grab';
      if (wasDragged) return;
      const regionName = hitTest(event)?.userData.regionName as string | undefined;
      if (regionName) onSelectRef.current(regionName);
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.getWorldDirection(forward);
      const travel = Math.max(-1.45, Math.min(1.45, event.deltaY * -0.0068));
      camera.position.addScaledVector(forward, travel);
      constrainFlight();
    };
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const handleVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const clock = new THREE.Clock();
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      if (!visible) return;

      const elapsed = clock.getElapsedTime();
      const movement = reducedMotion ? 0 : 1;
      particles.rotation.y = elapsed * 0.0018 * movement;
      particles.rotation.x = Math.sin(elapsed * 0.03) * 0.015 * movement;
      systemObjects.forEach(({ region, system, core, atmosphere, corona, orbitDust }, index) => {
        const selected = region.name === selectionRef.current;
        const targetScale = selected ? 1.22 : 1;
        const scale = system.scale.x + (targetScale - system.scale.x) * 0.09;
        system.scale.setScalar(scale);
        core.rotation.y += (0.0016 + index * 0.00014) * movement;
        core.rotation.x += (0.0004 + index * 0.00005) * movement;
        orbitDust.rotation.y -= (0.0024 + index * 0.00012) * movement;
        orbitDust.rotation.z = Math.sin(elapsed * 0.24 + index) * 0.12;
        const atmosphereMaterial = atmosphere.material as THREE.MeshBasicMaterial;
        atmosphereMaterial.opacity = selected ? 0.22 : 0.075;
        const coronaMaterial = corona.material as THREE.SpriteMaterial;
        coronaMaterial.opacity = selected ? 0.95 : 0.46 + Math.sin(elapsed * 0.9 + index) * 0.045 * movement;
        const coronaScale =
          systemPlacements[region.sculpture].radius *
          (selected ? 5.4 : 4.45 + Math.sin(elapsed + index) * 0.16 * movement);
        corona.scale.setScalar(coronaScale);
      });
      links.forEach(link => {
        const selected = link.regions.includes(selectionRef.current);
        link.material.opacity = selected ? 0.54 : 0.08;
        link.material.color.set(selected ? 0x9cd5c3 : 0x6d8e9c);
      });

      camera.updateMatrixWorld();
      field.updateMatrixWorld(true);
      systemObjects.forEach(({ system }, index) => {
        const button = nodeButtonRefs.current[index];
        if (!button) return;
        system.getWorldPosition(projectedPosition);
        projectedPosition.project(camera);
        const nodeX = Math.max(4, Math.min(96, (projectedPosition.x * 0.5 + 0.5) * 100));
        const nodeY = Math.max(7, Math.min(90, (-projectedPosition.y * 0.5 + 0.5) * 100));
        const depthScale = Math.max(0.76, Math.min(1.18, 1.04 - projectedPosition.z * 0.16));
        const inView = projectedPosition.z > -1 && projectedPosition.z < 1;
        button.style.setProperty('--map-x', `${nodeX}%`);
        button.style.setProperty('--map-y', `${nodeY}%`);
        button.style.setProperty('--map-depth-scale', depthScale.toFixed(3));
        button.style.zIndex = String(12 + Math.round((1 - projectedPosition.z) * 8));
        button.style.opacity = inView ? '1' : '0';
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('visibilitychange', handleVisibility);
      disposeScene(scene);
      glowTexture?.dispose();
      renderer.dispose();
      resetViewRef.current = () => undefined;
    };
  }, [quality, reducedMotion, regions]);

  return (
    <div className={`star-map-scene star-map-flight${fallback ? ' is-fallback' : ''}`} ref={containerRef}>
      <canvas aria-label="可拖拽环视的艾瑟兰立体星域" ref={canvasRef} tabIndex={0} />
      <div className="star-map-vignette" aria-hidden="true" />
      <div className="star-map-caption" aria-hidden="true">
        <span>SEPTEM REGIONES</span>
        <i />
        <small>FIRST-PERSON CELESTIAL FLIGHT</small>
      </div>
      <div className="star-map-controls">
        <span>拖拽环视 · 滚轮推进</span>
        <button onClick={() => resetViewRef.current()} type="button">
          复位航向
        </button>
      </div>
      <div className="star-map-node-cloud" aria-label="艾瑟兰七域立体星图">
        {regions.map((region, index) => {
          const placement = systemPlacements[region.sculpture];
          const selected = region.name === selectedRegionName;
          return (
            <button
              aria-pressed={selected}
              className={`star-map-node label-${placement.label}${selected ? ' is-selected' : ''}`}
              key={region.id}
              onClick={() => onSelectRegion(region.name)}
              ref={element => {
                nodeButtonRefs.current[index] = element;
              }}
              style={
                {
                  '--map-accent': region.accent,
                  '--map-depth-scale': 1,
                  '--map-x': `${placement.fallback[0]}%`,
                  '--map-y': `${placement.fallback[1]}%`,
                } as CSSProperties
              }
              type="button"
            >
              <i aria-hidden="true" />
              <span>
                <small>{String(index + 1).padStart(2, '0')} · WORLD</small>
                <strong>{region.shortName}</strong>
                <em>{region.name}</em>
              </span>
            </button>
          );
        })}
      </div>
      {fallback && (
        <div className="star-map-fallback" role="status">
          <span>星图已切换为静态定位</span>
          <small>区域点选与世界书检索仍可使用</small>
        </div>
      )}
    </div>
  );
}
