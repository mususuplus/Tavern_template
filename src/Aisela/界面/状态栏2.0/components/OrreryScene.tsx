import { useEffect, useRef, useState } from 'react';
// @ts-expect-error The installed Three.js runtime has no bundled declarations in this template.
import * as THREE from 'three';

import type { ObservatoryMode, RegionLore, RenderQuality } from '../types';

type OrrerySceneProps = {
  mode: ObservatoryMode;
  regions: RegionLore[];
  selectedRegionName: string;
  quality: RenderQuality;
  reducedMotion: boolean;
  onSelectRegion: (name: string) => void;
};

function regionGeometry() {
  const shape = new THREE.Shape();
  const points = [
    [0, 0.72],
    [0.105, 0.12],
    [0.5, 0],
    [0.105, -0.12],
    [0, -0.72],
    [-0.105, -0.12],
    [-0.5, 0],
    [-0.105, 0.12],
  ];
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.045,
    bevelThickness: 0.035,
  });
  geometry.center();
  return geometry;
}

const qualityProfiles = {
  high: { stars: 2600, starSize: 0.045, starOpacity: 0.86, ticks: 60, orbits: [1.52, 1.94, 2.42, 2.88, 3.28], dpr: 2 },
  balanced: { stars: 760, starSize: 0.031, starOpacity: 0.58, ticks: 30, orbits: [1.72, 2.45, 3.18], dpr: 1.3 },
  low: { stars: 90, starSize: 0.018, starOpacity: 0.28, ticks: 12, orbits: [2.45], dpr: 0.8 },
} as const;

type DisposableMaterial = { dispose?: () => void };
type SceneObject = {
  geometry?: { dispose?: () => void };
  material?: DisposableMaterial | DisposableMaterial[];
};

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object: SceneObject) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      materials.forEach((material: DisposableMaterial) => material.dispose?.());
    }
  });
}

export function OrreryScene({
  mode,
  regions,
  selectedRegionName,
  quality,
  reducedMotion,
  onSelectRegion,
}: OrrerySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modeRef = useRef(mode);
  const selectionRef = useRef(selectedRegionName);
  const onSelectRef = useRef(onSelectRegion);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

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
    const qualityProfile = qualityProfiles[quality];

    setFallback(false);
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
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080f, 0.058);
    const camera = new THREE.PerspectiveCamera(41, 1, 0.1, 70);
    camera.position.set(0, 0.35, 9.4);

    scene.add(new THREE.AmbientLight(0x8aa6bd, 1.1));
    const keyLight = new THREE.DirectionalLight(0xffd7a1, 2.6);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);
    const coreLight = new THREE.PointLight(0x61e6bd, 16, 13, 1.6);
    coreLight.position.set(0, 0, 1.4);
    scene.add(coreLight);

    const world = new THREE.Group();
    world.rotation.x = -0.16;
    scene.add(world);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x183a38,
      emissive: 0x0b9d77,
      emissiveIntensity: 1.35,
      metalness: 0.74,
      roughness: 0.24,
      transmission: 0.12,
      clearcoat: 0.9,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 4), coreMaterial);
    core.position.z = 0.35;
    world.add(core);

    const orbitGroup = new THREE.Group();
    world.add(orbitGroup);
    qualityProfile.orbits.forEach((radius, index) => {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(radius, index === 1 ? 0.018 : 0.012, 8, quality === 'high' ? 256 : 120),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? 0xb98c52 : 0x536c6e,
          transparent: true,
          opacity: index === 1 ? 0.56 : 0.34,
        }),
      );
      orbit.scale.y = 0.54 + index * 0.055;
      orbit.rotation.z = index * 0.31 - 0.24;
      orbitGroup.add(orbit);
    });

    const ticks = new THREE.Group();
    for (let index = 0; index < qualityProfile.ticks; index += 1) {
      const angle = (index / qualityProfile.ticks) * Math.PI * 2;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(index % 3 === 0 ? 0.12 : 0.055, 0.012, 0.012),
        new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? 0xd8b679 : 0x647c77, transparent: true, opacity: 0.58 }),
      );
      tick.position.set(Math.cos(angle) * 3.55, Math.sin(angle) * 1.95, -0.15);
      tick.rotation.z = angle;
      ticks.add(tick);
    }
    world.add(ticks);

    const regionGroup = new THREE.Group();
    const regionMeshes: THREE.Mesh[] = [];
    regions.forEach((region, index) => {
      const angle = (index / regions.length) * Math.PI * 2 - Math.PI / 2;
      const accent = new THREE.Color(region.accent);
      const material = new THREE.MeshStandardMaterial({
        color: accent.clone().multiplyScalar(0.64),
        emissive: accent,
        emissiveIntensity: 0.72,
        metalness: 0.68,
        roughness: 0.26,
        transparent: true,
        opacity: 0.96,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(regionGeometry(), material);
      mesh.position.set(Math.cos(angle) * 3.15, Math.sin(angle) * 1.72, 0.2 + Math.sin(angle * 2) * 0.42);
      mesh.rotation.set(Math.sin(angle) * 0.12, Math.cos(angle) * 0.1, angle + Math.PI / 2);
      mesh.userData.regionName = region.name;
      mesh.userData.baseZ = mesh.position.z;
      regionMeshes.push(mesh);
      regionGroup.add(mesh);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.59, 0.014, 6, 64),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.42 }),
      );
      halo.position.copy(mesh.position);
      halo.rotation.z = angle + 0.5;
      regionGroup.add(halo);
    });
    world.add(regionGroup);

    const starCount = qualityProfile.stars;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      const radius = 5 + Math.random() * 19;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[index * 3 + 2] = radius * Math.cos(phi);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xd7e9dc,
        size: qualityProfile.starSize,
        transparent: true,
        opacity: qualityProfile.starOpacity,
      }),
    );
    scene.add(stars);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerX = 0;
    let pointerY = 0;
    let animationFrame = 0;
    let visible = !document.hidden;

    const updateSize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, qualityProfile.dpr));
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerX = pointer.x;
      pointerY = pointer.y;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(regionMeshes, false)[0]?.object as THREE.Mesh | undefined;
      canvas.style.cursor = hit && modeRef.current === 'atlas' ? 'pointer' : 'default';
    };

    const handleSelect = (event: PointerEvent) => {
      if (modeRef.current !== 'atlas') return;
      updatePointer(event);
      const hit = raycaster.intersectObjects(regionMeshes, false)[0]?.object as THREE.Mesh | undefined;
      const regionName = hit?.userData.regionName as string | undefined;
      if (regionName) onSelectRef.current(regionName);
    };
    canvas.addEventListener('pointermove', updatePointer);
    canvas.addEventListener('pointerdown', handleSelect);

    const handleVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const clock = new THREE.Clock();
    const projectedPosition = new THREE.Vector3();
    let previousElapsed = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      if (!visible) return;
      const elapsed = clock.getElapsedTime();
      const delta = Math.min(0.05, Math.max(0, elapsed - previousElapsed));
      previousElapsed = elapsed;
      const movement = reducedMotion ? 0 : 1;
      core.rotation.y = elapsed * 0.11 * movement;
      core.rotation.x = Math.sin(elapsed * 0.23) * 0.08 * movement;
      orbitGroup.rotation.z = elapsed * 0.018 * movement;
      ticks.rotation.z = -elapsed * 0.007 * movement;
      stars.rotation.y = elapsed * 0.0025 * movement;
      regionGroup.rotation.z += delta * (modeRef.current === 'atlas' ? 0.12 : 0.026) * movement;

      regionMeshes.forEach((mesh, index) => {
        const selected = mesh.userData.regionName === selectionRef.current;
        const targetScale = selected && modeRef.current === 'atlas' ? 1.34 : modeRef.current === 'atlas' ? 1 : 0.76;
        mesh.scale.setScalar(mesh.scale.x + (targetScale - mesh.scale.x) * 0.07);
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = selected && modeRef.current === 'atlas' ? 1.45 : 0.52;
        if (!reducedMotion) {
          mesh.rotation.z += 0.0018 + index * 0.00006;
          mesh.position.z = Number(mesh.userData.baseZ) + Math.sin(elapsed * 0.7 + index) * 0.045;
        }
      });

      if (!reducedMotion) {
        camera.position.x += (pointerX * 0.34 - camera.position.x) * 0.025;
        camera.position.y += (0.35 + pointerY * 0.2 - camera.position.y) * 0.025;
      }
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      world.updateMatrixWorld(true);
      regionMeshes.forEach((mesh, index) => {
        const button = nodeButtonRefs.current[index];
        if (!button) return;

        mesh.getWorldPosition(projectedPosition);
        const worldDepth = projectedPosition.z;
        projectedPosition.project(camera);
        const rawX = (projectedPosition.x * 0.5 + 0.5) * 100;
        const rawY = (-projectedPosition.y * 0.5 + 0.5) * 100;
        const nodeX = Math.max(8, Math.min(92, 50 + (rawX - 50) * 1.08));
        const nodeY = Math.max(9, Math.min(73, 43 + (rawY - 43) * 1.1));
        const depthScale = Math.max(0.88, Math.min(1.08, 0.98 + worldDepth * 0.07));

        button.style.setProperty('--node-x', `${nodeX}%`);
        button.style.setProperty('--node-y', `${nodeY}%`);
        button.style.setProperty('--node-depth-scale', depthScale.toFixed(3));
        button.style.zIndex = String(8 + Math.round((worldDepth + 1) * 3));
        button.style.opacity = String(Math.max(0.72, Math.min(1, 0.88 + worldDepth * 0.08)));
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', updatePointer);
      canvas.removeEventListener('pointerdown', handleSelect);
      document.removeEventListener('visibilitychange', handleVisibility);
      disposeScene(scene);
      renderer.dispose();
    };
  }, [quality, reducedMotion, regions]);

  return (
    <div className={`orrery-scene${fallback ? ' is-fallback' : ''}`} ref={containerRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="orrery-vignette" aria-hidden="true" />
      {mode === 'atlas' && (
        <div className="region-node-cloud" aria-label="七大区域星轨">
          {regions.map((region, index) => {
            const angle = (index / regions.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <button
                className={region.name === selectedRegionName ? 'is-selected' : ''}
                key={region.id}
                onClick={() => onSelectRegion(region.name)}
                ref={element => {
                  nodeButtonRefs.current[index] = element;
                }}
                style={
                  {
                    '--node-accent': region.accent,
                    '--node-depth-scale': 1,
                    '--node-x': `${50 + Math.cos(angle) * 35}%`,
                    '--node-y': `${43 + Math.sin(angle) * 27}%`,
                  } as React.CSSProperties
                }
                type="button"
              >
                <span>{region.shortName}</span>
                <small>{region.name}</small>
              </button>
            );
          })}
        </div>
      )}
      {fallback && (
        <div className="webgl-fallback" role="status">
          <span>星盘以静态模式显现</span>
          <small>所有卷宗与功能仍可正常使用</small>
        </div>
      )}
    </div>
  );
}
