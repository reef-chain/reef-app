import React from 'react';
import Uik from '@reef-chain/ui-kit';

interface SliderWithLabelProps {
  max: number;
  value: number;
  onChange(value: number): void;
}

const SliderWithLabel = ({ max, value, onChange }: SliderWithLabelProps): JSX.Element => {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100);
  const handleChange = (p: number): void => {
    const newVal = Math.round((p / 100) * max);
    onChange(newVal);
  };
  return (
    <Uik.Slider
      value={percent}
      onChange={handleChange}
      tooltip={`${value}`}
      helpers={[{ position: 0, text: '0' }, { position: 100, text: `${max}` }]}
    />
  );
};

export default SliderWithLabel;
