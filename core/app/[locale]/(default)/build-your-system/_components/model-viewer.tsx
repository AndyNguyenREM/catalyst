'use client';

import { Bounds, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

/**
 * 3D preview for the configurator. Loads .glb models (converted from Ultradyne's
 * STEP files) and lets the customer rotate/zoom.
 *
 * Fully self-contained: uses simple scene lights (no remote HDR/environment
 * fetch) so it works offline and behind strict CSP. `Bounds` auto-frames the
 * camera so the model fills the view on load and refits when parts change.
 */

// Local Draco decoder (served from /public/models/draco) so Draco-compressed
// .glb files load without any external CDN fetch.
const DRACO_DECODER_PATH = '/models/draco/';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO_DECODER_PATH);

  return <primitive object={scene} />;
}

export function ModelViewer({ urls }: { urls: string[] }) {
  return (
    <Canvas camera={{ position: [2.5, 1.5, 3], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.8} />
      <directionalLight intensity={1.5} position={[5, 8, 5]} />
      <directionalLight intensity={0.6} position={[-5, -3, -5]} />
      <Suspense fallback={null}>
        {/* key forces a re-fit whenever the set of parts changes */}
        <Bounds clip fit key={urls.join('|')} margin={1.1} observe>
          {urls.map((url) => (
            <Model key={url} url={url} />
          ))}
        </Bounds>
      </Suspense>
      <OrbitControls autoRotate autoRotateSpeed={1.1} enablePan={false} makeDefault />
    </Canvas>
  );
}
