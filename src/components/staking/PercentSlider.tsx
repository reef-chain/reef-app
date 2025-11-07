import React from 'react';
import Uik from '@reef-chain/ui-kit';

interface Props {
  max: number;
  value: number;
  onChange(value: number): void;
}

const PercentSlider = ({ max, value, onChange }: Props): JSX.Element => {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const percent = safeMax === 0
    ? 0
    : Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)));
  const handleChange = (p: number): void => {
    if (safeMax === 0) {
      onChange(0);
      return;
    }
    const newVal = (p / 100) * safeMax;
    onChange(Number.isFinite(newVal) ? newVal : 0);
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
