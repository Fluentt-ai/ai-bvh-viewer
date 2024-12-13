import { useCallback, useEffect, useRef, useState } from 'react';
import { Viewer } from '@/features/vrmViewer/viewer';
import AvatarSample_A from '../assets/AvatarSample_A.vrm';
import { IconButton } from '@charcoal-ui/react';
import '@/icons';
import { useAnimationFrame } from '@/utils/useAnimationFrame';
import { loadVRMAnimation } from '@/lib/VRMAnimation/loadVRMAnimation';

interface VRMViewerProps {
  blobURL: string | null;
  audioURL: string | null;
}

export default function VrmViewer(props: VRMViewerProps) {
  const [viewer] = useState<Viewer>(new Viewer());
  const [loadFlag, setLoadFlag] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const refDivProgress = useRef<HTMLDivElement>(null);
  const blobURL = props.blobURL;
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioURL = props.audioURL;

  const canvasRef = useCallback(
    async (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        await viewer.loadVrm(AvatarSample_A);
        setLoadFlag(true);
      }
    },
    [viewer]
  );

  const pauseAnimation = useCallback(() => {
    if (viewer.model) {
      viewer.model.pauseAction();
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, []);

  const playAnimation = useCallback(() => {
    if (viewer.model) {
      viewer.model.playAction();
      if (audioRef.current && !isNaN(audioRef.current.duration)) {
        const progress = viewer.model.progress;
        audioRef.current.currentTime = progress * audioRef.current.duration;
        audioRef.current.play();
      }
      setPlaying(true);
    }
  }, []);

  const handlePointerDownProgress = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.nativeEvent.target as HTMLDivElement;
    const rect = target.getBoundingClientRect();

    const u = (event.clientX - rect.left) / rect.width;
    viewer.model?.setProgress(u);
    
    if (audioRef.current) {
      audioRef.current.currentTime = u * audioRef.current.duration;
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (blobURL) {
        const VRMAnimation = await loadVRMAnimation(blobURL);
        if (VRMAnimation && loadFlag && viewer.model) {
          await viewer.model.loadAnimation(VRMAnimation);
          playAnimation();
        }
      }
    })();
  }, [blobURL, loadFlag, viewer.model]);

  useAnimationFrame(() => {
    const divProgress = refDivProgress.current;
    if (divProgress != null) {
      divProgress.style.width = `${100.0 * (viewer.model?.progress ?? 0.0)}%`;
    }
  }, []);

  useEffect(() => {
    if (viewer.model) {
      viewer.model.onLoopStart = () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, [viewer.model]);

  return (
    <div className="flex flex-col">
      <div className={'sm:w-[390px] w-[60vw] sm:h-[480px] h-[583px]'}>
        <canvas ref={canvasRef} className={'h-full w-full rounded-24 bg-[--charcoal-surface3]'}></canvas>
      </div>
      <audio ref={audioRef} src={audioURL || undefined} loop />
      <div className="mt-[16px] flex gap-[16px] grow-0 w-full">
        <IconButton
          icon={isPlaying ? '24/PauseAlt' : '24/PlayAlt'}
          onClick={isPlaying ? pauseAnimation : playAnimation}
          className="grow-0 shrink-0"
        />
        <div
          className="flex w-full h-full grow items-center cursor-pointer"
          onPointerDown={handlePointerDownProgress}
        >
          <div className="bg-text3-disabled w-full h-[8px] rounded-4 pointer-events-none">
            <div ref={refDivProgress} className="bg-brand h-full rounded-4 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
