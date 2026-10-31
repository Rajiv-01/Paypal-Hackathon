import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSecurityBadgeProps {
  status?: string;
  size?: number;
}

export const ThreeSecurityBadge: React.FC<ThreeSecurityBadgeProps> = ({
  status = 'PENDING_APPROVAL',
  size = 140
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. Geometry & Materials based on status
    const isSettled = status === 'SETTLED';
    const mainColor = isSettled ? 0x10b981 : 0x3b82f6; // emerald for settled, azure blue for pending
    const accentColor = isSettled ? 0x34d399 : 0x60a5fa;

    // Central 3D Torus Knot / Shield Gem (matching reference image emblem)
    const geometry = new THREE.TorusKnotGeometry(0.7, 0.22, 90, 16, 2, 3);
    const material = new THREE.MeshPhysicalMaterial({
      color: mainColor,
      emissive: accentColor,
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Outer wireframe floating halo ring
    const ringGeo = new THREE.TorusGeometry(1.25, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.5, 10);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const fillLight = new THREE.PointLight(accentColor, 1.8, 8);
    fillLight.position.set(-2, -2, 2);
    scene.add(fillLight);

    // 4. Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      mesh.rotation.x = elapsed * 0.45;
      mesh.rotation.y = elapsed * 0.65;
      mesh.position.y = Math.sin(elapsed * 1.5) * 0.08; // subtle floating bob

      ring.rotation.z = -elapsed * 0.25;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 5. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [status, size]);

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    />
  );
};
