import React from 'react';
import Uik from '@reef-chain/ui-kit';
import { localizedStrings as strings } from '../../l10n/l10n';
import Active from './Active';
import Actions from './Actions';
import './validators.css';

const Validators = (): JSX.Element => {
  return (
    <div className="validators-page">
      <Uik.Text type="headline" className="validators-page__title">
        {strings.validators}
      </Uik.Text>
      <Actions />
      <Active />
    </div>
  );
};

export default Validators;
