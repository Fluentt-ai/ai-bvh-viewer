import { Button, Modal, ModalBody, ModalButtons, OverlayProvider } from '@charcoal-ui/react';
import { useEffect } from 'react';
import { OverlayTriggerState } from 'react-stately';

interface ModalWrapperProps {
  state: OverlayTriggerState;
}
const ModalWrapper = (props: ModalWrapperProps) => {
  const state = props.state;
  useEffect(() => {
    state.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <OverlayProvider>
      <Modal size="L" title="" isOpen={state.isOpen} onClose={() => state.close()}>
        {/* <ModalHeader /> */}
        <ModalBody className="py-32 mx-64 typography-14">
          <div className="py-24 text-brand typography-20">About this Application</div>
          <div>
            <ul className="list-disc pl-24">
              <li>This is an application that converts BVH files to VRM animation files (VRMA).</li>
              <li>
                For more details about VRM animation files, please visit the
                <a
                  className="text-link1"
                  href="https://vrm.dev/vrma/"
                  target="_blank"
                  rel="noreferrer"
                >
                  website
                </a>
                .
              </li>
              <li>This site does not upload the input BVH files to any server.</li>
              <li>
                This site is licensed under MIT. The repository link is
                <a
                  className="text-link1"
                  href="https://github.com/vrm-c/bvh2vrma"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </li>
            </ul>
          </div>
          <div className="py-24 text-brand typography-20">Usage Notes</div>
          <ul className="pl-24 list-disc">
            <li>
              For detailed specifications of VRM animation files (VRMA), please refer to
              <a
                className="text-link1"
                href="https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </li>
            <li>
              We do not guarantee the conversion results. The conversion may fail depending on the input BVH file.
            </li>
          </ul>
          <ModalButtons>
            <Button variant="Primary" onClick={() => state.close()}>
              Use
            </Button>
          </ModalButtons>
        </ModalBody>
      </Modal>
    </OverlayProvider>
  );
};
export default ModalWrapper;
