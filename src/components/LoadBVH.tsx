import { convertBVHToVRMAnimation } from '@/lib/bvh-converter/convertBVHToVRMAnimation';
import { BVHLoader } from '@/lib/loaders/BVHLoader';
import { saveBlob } from '@/utils/saveBlob';
import { useState, DragEvent, useRef, Dispatch, SetStateAction, useEffect } from 'react';
import '@charcoal-ui/icons';
import { Button, LoadingSpinner } from '@charcoal-ui/react';

interface FileBlob {
  blob: Blob;
  name: string;
}
interface LoadBVHProps {
  setBlobURL: Dispatch<SetStateAction<string | null>>;
  setAudioURL: Dispatch<SetStateAction<string | null>>;
  armSpread: number;
}
const LoadBVH = (props: LoadBVHProps) => {
  const [error, setError] = useState('');
  const [nowConvert, setNowConvert] = useState(false);
  const [completed, setCompleted] = useState(false);
  const vrmaBlob = useRef<FileBlob | null>(null);
  const bvhLoader = new BVHLoader();
  const setBlobURL = props.setBlobURL;
  const [bvhFile, setBvhFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const setAudioURL = props.setAudioURL;

  const initializeState = () => {
    setError('');
    setNowConvert(false);
    setCompleted(false);
    vrmaBlob.current = null;
    setBlobURL(null);
    setBvhFile(null);
    setAudioFile(null);
    setAudioURL(null);
  };

  const changeExtension = (fileName: string, newExtension: string) => {
    const parts = fileName.split('.');
    parts[parts.length - 1] = newExtension;
    return parts.join('.');
  };

  const convertWrapper = async (file: File) => {
    setNowConvert(true);
    let isPropertyConverted = true;
    try {
      if (!file.name.toLowerCase().endsWith('.bvh')) {
        throw new Error('Uploaded file is not a BVH file.');
      }
      const fileText = await file.text();

      const bvh = bvhLoader.parse(fileText);
      const vrmaBuffer = await convertBVHToVRMAnimation(bvh, {
        scale: location.hash.includes('NO_SCALING') ? 1.0 : 0.01,
        armSpread: props.armSpread
      });

      const vrmaDict: FileBlob = { blob: new Blob([vrmaBuffer]), name: file.name };
      setBlobURL(URL.createObjectURL(vrmaDict.blob));
      vrmaBlob.current = vrmaDict;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        isPropertyConverted = false;
      }
    }
    setNowConvert(false);
    if (isPropertyConverted) {
      setCompleted(true);
    }
  };

  useEffect(() => {
    if (bvhFile) {
      convertWrapper(bvhFile);
    }
  }, [props.armSpread, bvhFile]);

  const dropHandler = (e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.dataTransfer.items) {
      [...e.dataTransfer.items].forEach((item: DataTransferItem) => {
        if (item.kind == 'file') {
          const file = item.getAsFile();
          if (file != null) {
            setBvhFile(file);
          }
        }
      });
    }
  };

  const fileDownload = () => {
    if (vrmaBlob.current) {
      const blob = vrmaBlob.current.blob;
      const fileName = vrmaBlob.current.name;
      saveBlob(blob, changeExtension(fileName, 'vrma'));
    }
  };

  const onClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bvh';

    input.addEventListener('change', () => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        setBvhFile(file);
      }
    });

    input.click();
  };

  const handleAudioUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';

    input.addEventListener('change', () => {
      if (input.files && input.files.length > 0 && vrmaBlob.current) {
        const file = input.files[0];
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setAudioURL(url);
        const currentBlobURL = URL.createObjectURL(vrmaBlob.current.blob);
        setBlobURL(null);
        setTimeout(() => setBlobURL(currentBlobURL), 0);
      }
    });

    input.click();
  };

  return (
    <div className="flex items-center justify-center h-full w-full border-dashed border-2 border-[--charcoal-text4] text-center rounded-16 typography-20">
      {nowConvert ? (
        <div>
          <div className="pb-16">
            <LoadingSpinner size={48} padding={16} transparent={false} />
          </div>
          <div className="font-bold text-text3">Converting to VRMA file...</div>
        </div>
      ) : completed ? (
        <div>
          <div className="flex justify-center pb-16">
            <pixiv-icon class="text-text4" name="24/Check" scale="2"></pixiv-icon>
          </div>
          <div className="text-center font-bold text-text3 pb-24">Conversion completed</div>
          <div className="pb-8">
            <Button onClick={fileDownload} variant="Primary">
              Download File
            </Button>
          </div>
          <div className="pb-8">
            <Button onClick={handleAudioUpload} variant="Default">
              {audioFile ? 'Change Audio' : 'Add Audio'}
            </Button>
          </div>
          <div className="flex justify-center">
            <button className="text-link1 typography-14" onClick={initializeState}>
              Convert another file
            </button>
          </div>
        </div>
      ) : (
        <>
          {error.length == 0 ? (
            <>
              <button className="h-full w-full" onClick={onClick}>
                <div
                  className="h-full w-full flex items-center justify-center"
                  onDrop={dropHandler}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div>
                    <div className="flex justify-center pb-16">
                      <pixiv-icon class="text-text4" name="24/File" scale="2"></pixiv-icon>
                    </div>
                    <div className="font-bold text-text3 sm:hidden">Select a file</div>
                    <div className="font-bold text-text3 max-sm:hidden">
                      Drag and drop a BVH file
                      <br />
                      or click to select a file
                    </div>
                  </div>
                </div>
              </button>
            </>
          ) : (
            <div>
              <div className="flex justify-center pb-16">
                <pixiv-icon class="text-text4" name="24/Error" scale="2"></pixiv-icon>
              </div>
              <div className="font-bold text-text3 pb-16">
                An error occurred.
                <br />
                {error}
                <br />
                Please try uploading again.
              </div>
              <Button onClick={initializeState}>Convert another file</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default LoadBVH;
