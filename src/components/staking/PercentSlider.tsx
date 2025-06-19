import React from 'react';
import Uik from '@reef-chain/ui-kit';

interface Props {
  max: number;
  value: number;
  onChange(value: number): void;
}

const PercentSlider = ({ max, value, onChange }: Props): JSX.Element => {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100);
  const handleChange = (p: number): void => {
    const newVal = Math.round((p / 100) * max);
    onChange(newVal);
  };
  return (
    <Uik.Slider
      value={percent}
      onChange={handleChange}
      tooltip={`${percent}%`}
      helpers={[
        { position: 0, text: '0%' },
        { position: 25, text: '25%' },
        { position: 50, text: '50%' },
        { position: 75, text: '75%' },
        { position: 100, text: '100%' },
      ]}
    />
  );
};

export default PercentSlider;
