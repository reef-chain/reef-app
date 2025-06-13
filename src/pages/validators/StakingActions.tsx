import React, { useState } from 'react';
import Uik from '@reef-chain/ui-kit';

interface Props {
  validators: { address: string; identity?: string }[];
}

const StakingActions = ({ validators }: Props): JSX.Element => {
  const [bondAmount, setBondAmount] = useState('');
  const [bondPercent, setBondPercent] = useState(0);
  const [selectedVals, setSelectedVals] = useState<string[]>([]);
  const [stakePercent, setStakePercent] = useState(0);
  const [unbondPercent, setUnbondPercent] = useState(0);

  const validatorOptions = validators.map((v) => ({ value: v.address, text: v.identity || v.address }));

  return (
    <div className="staking-actions">
      <Uik.Text type="title">Staking actions</Uik.Text>
      <Uik.Form>
        <Uik.Input
          label="Bond"
          placeholder="0"
          value={bondAmount}
          onInput={(e) => setBondAmount((e.target as HTMLInputElement).value)}
        />
        <Uik.Slider value={bondPercent} onChange={(val) => setBondPercent(val as number)} />
        <Uik.Select
          label="Choose your validators"
          multiple
          options={validatorOptions}
          value={selectedVals}
          onChange={(val) => setSelectedVals(val as string[])}
        />
        <Uik.Slider value={stakePercent} onChange={(val) => setStakePercent(val as number)} />
        <Uik.Button text="Validate & Sign" fill />
      </Uik.Form>
      <Uik.Container vertical className="unbond-section">
        <Uik.Text type="title">Unbond</Uik.Text>
        <Uik.Slider value={unbondPercent} onChange={(val) => setUnbondPercent(val as number)} />
        <Uik.Button text="Unbond" fill />
      </Uik.Container>
    </div>
  );
};

export default StakingActions;
