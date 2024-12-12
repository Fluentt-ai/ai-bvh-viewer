import { OverlayTriggerState } from 'react-stately';

interface DescriptionProps {
  state: OverlayTriggerState;
}
const Description = (props: DescriptionProps) => {
  const state = props.state;
  return (
    <div className="pb-40">
      <div className="pb-40 text-[32px] text-[--charcoal-brand] font-bold text-center">
        bvh to VRMA
      </div>
      <div className="text-center text-[14px] sm:text-[16px] pb-[6px]">
        Convert your bvh files to VRMA files.
      </div>
      <div className="text-center typography-14 sm:typography-16">
        Before using the service, please check the{' '}
        <button
          className="text-link1"
          onClick={() => {
            state.open();
          }}
        >
          terms of use
        </button>
        .
      </div>
    </div>
  );
};
export default Description;
