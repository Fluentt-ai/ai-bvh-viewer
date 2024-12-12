import LoadBVH from '@/components/LoadBVH';
import Description from '@/components/Description';
import Modal from '@/components/Modal';
import VrmViewer from '@/components/VrmViewer';
import { useState } from 'react';
import { useOverlayTriggerState } from 'react-stately';

export default function Home() {
  const [blobURL, setBlobURL] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [armSpread, setArmSpread] = useState<number>(0);
  const [tempArmSpread, setTempArmSpread] = useState<number>(0);
  const modalState = useOverlayTriggerState({});

  const handleArmSpreadChange = (value: number) => {
    setTempArmSpread(value);
  };

  const handleArmSpreadRelease = () => {
    setArmSpread(tempArmSpread);
  };

  return (
    <main className={`h-screen flex justify-center lg:items-center font-sans`}>
      <Modal state={modalState} />
      <div className="rounded-24 lg:h-[80vh] lg:w-[80vw] flex justify-center lg:items-center lg:bg-[--charcoal-background1] lg:mt-0 mt-40">
        <div className="lg:w-[60vw] lg:flex lg:flex-row-reverse lg:justify-around items-center gap-32">
          {blobURL ? (
            <>
              <div>
                <Description state={modalState} />
                <div className="flex justify-center">
                  <div className="w-full lg:h-[296px] h-[268px]">
                    <LoadBVH 
                      setBlobURL={setBlobURL} 
                      setAudioURL={setAudioURL}
                      armSpread={armSpread} 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="armSpread" className="block mb-2">Arm Spread: {tempArmSpread}</label>
                  <input
                    type="range"
                    id="armSpread"
                    min="-180"
                    max="180"
                    step="1"
                    value={tempArmSpread}
                    onChange={(e) => handleArmSpreadChange(parseFloat(e.target.value))}
                    onMouseUp={handleArmSpreadRelease}
                    onTouchEnd={handleArmSpreadRelease}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="max-lg:py-24 flex justify-center">
                <VrmViewer blobURL={blobURL} audioURL={audioURL} />
              </div>
            </>
          ) : (
            <>
              <div className="">
                <Description state={modalState} />
                <div className="flex justify-center">
                  <div className="lg:w-[600px] lg:h-[296px] h-[268px] w-[358px] sm:w-[60vw]">
                    <LoadBVH 
                      setBlobURL={setBlobURL} 
                      setAudioURL={setAudioURL}
                      armSpread={armSpread} 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="armSpread" className="block mb-2">Arm Spread: {tempArmSpread}</label>
                  <input
                    type="range"
                    id="armSpread"
                    min="-180"
                    max="180"
                    step="1"
                    value={tempArmSpread}
                    onChange={(e) => handleArmSpreadChange(parseFloat(e.target.value))}
                    onMouseUp={handleArmSpreadRelease}
                    onTouchEnd={handleArmSpreadRelease}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
