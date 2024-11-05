import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { BVH } from "three/examples/jsm/loaders/BVHLoader";
import { getRootBone } from "./getRootBone";
import { mapSkeletonToVRM } from "./mapSkeletonToVRM";
import { VRMAnimationExporterPlugin } from "./VRMAnimationExporterPlugin";

const _v3A = new THREE.Vector3();

function createSkeletonBoundingBox(skeleton: THREE.Skeleton): THREE.Box3 {
  const boundingBox = new THREE.Box3();
  for (const bone of skeleton.bones) {
    boundingBox.expandByPoint(bone.getWorldPosition(_v3A));
  }
  return boundingBox;
}

export async function convertBVHToVRMAnimation(
  bvh: BVH,
  options?: {
    scale?: number;
    armSpread?: number;
  }
): Promise<ArrayBuffer> {
  const scale = options?.scale ?? 0.01;

  const skeleton = bvh.skeleton.clone();

  const clip = bvh.clip.clone();

  // find root bone of the skeleton
  const rootBone = getRootBone(skeleton);

  // scale the entire tree by 0.01
  rootBone.traverse((bone) => {
    bone.position.multiplyScalar(scale);
  });
  rootBone.updateWorldMatrix(false, true);

  // create a map from vrm bone names to bones
  const vrmBoneMap = mapSkeletonToVRM(rootBone);
  rootBone.userData.vrmBoneMap = vrmBoneMap;

  const hipsBone = vrmBoneMap.get("hips")!;
  const hipsBoneName = hipsBone.name;
  let hipsPositionTrack: THREE.VectorKeyframeTrack | null = null;

  const spineBone = vrmBoneMap.get("spine")!;
  const spineBoneName = spineBone.name;
  let spinePositionTrack: THREE.VectorKeyframeTrack | null = null;

  // rename tracks + remove translation tracks other than hips + pickup spine track
  const filteredTracks: THREE.KeyframeTrack[] = [];

  for (const origTrack of bvh.clip.tracks) {
    const track = origTrack.clone();
    track.name = track.name.replace(/\.bones\[(.*)\]/, "$1");

    if (track.name.endsWith(".quaternion")) {
      // Push arms apart by 20 degrees for shoulder joints
      if (track.name.includes("LeftShoulder") || track.name.includes("RightShoulder")) {
        const values = track.values as Float32Array;
        const rotationAngle = THREE.MathUtils.degToRad(options?.armSpread ?? 0);
        const rotationAxis = new THREE.Vector3(0, 0, track.name.includes("LeftShoulder") ? 1 : -1);
        const rotation = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle);
        
        for (let i = 0; i < values.length; i += 4) {
          const q = new THREE.Quaternion(values[i], values[i+1], values[i+2], values[i+3]);
          q.premultiply(rotation);
          values[i] = q.x;
          values[i+1] = q.y;
          values[i+2] = q.z;
          values[i+3] = q.w;
        }
      }
      filteredTracks.push(track);
    }

    if (track.name === `${hipsBoneName}.position`) {
      const newTrack = track.clone();
      newTrack.values = track.values.map((v) => v * (scale));

      hipsPositionTrack = newTrack;
      filteredTracks.push(newTrack);
    }

    if (track.name === `${spineBoneName}.position`) {
      const newTrack = track.clone();
      newTrack.values = track.values.map((v) => v * (scale));

      spinePositionTrack = newTrack;
    }
  }

  clip.tracks = filteredTracks;

  // Remove offsets contained in hips position track
  if (hipsPositionTrack != null) {
    const offset = hipsBone.position.toArray();

    for (let i = 0; i < hipsPositionTrack.values.length; i ++) {
      hipsPositionTrack.values[i] -= offset[i % 3];
    }
  }

  // some BVHs does not ground correctly
  const boundingBox = createSkeletonBoundingBox(skeleton);
  if (boundingBox.min.y < 0) {
    rootBone.position.y -= boundingBox.min.y;
  }

  // export as a gltf
  const exporter = new GLTFExporter();
  exporter.register((writer) => new VRMAnimationExporterPlugin(writer));

  const gltf = await exporter.parseAsync(rootBone, {
    animations: [clip],
    binary: true,
  });
  return gltf as ArrayBuffer;
}
