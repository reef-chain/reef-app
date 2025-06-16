import React, { useState } from 'react';
import Uik from '@reef-chain/ui-kit';
import { useHistory } from 'react-router-dom';
import { localizedStrings as strings } from '../../l10n/l10n';
import { VALIDATORS_URL } from '../../urls';
import Active from './Active';
import Actions from './Actions';
import './validators.css';

const Validators = (): JSX.Element => {
  const history = useHistory();
  const [tab, setTab] = useState<'active' | 'actions'>('active');

  return (
    <div className="validators-page">
      <Uik.Text type="headline" className="validators-page__title">
        {strings.validators}
      </Uik.Text>
      <div className="validators-page__filter">
        <Uik.Tabs
          value={tab}
          onChange={(val) => {
            const t = val as 'active' | 'actions';
            setTab(t);
            if (t === 'active') history.push(VALIDATORS_URL);
          }}
          options={[
            { value: 'active', text: 'Active' },
            { value: 'actions', text: 'Actions' },
          ]}
        />
      </div>
      {tab === 'active' ? <Active /> : <Actions />}
    </div>
  );
};

export default Validators;
