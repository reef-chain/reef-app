import React from 'react';
import './confirm-token.css';
import Uik from '@reef-chain/ui-kit';
import { localizedStrings as strings } from '../../l10n/l10n';

export interface SummaryItemProps {
  label?: string
  value?: string | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action?: (...args: any[]) => any
  className?: string
}

export const SummaryItem = ({
  label,
  value,
  action,
  className,
}: SummaryItemProps): JSX.Element => (
  <div
    className={`
      confirm-token-summary-item
      ${className || ''}
    `}
  >
    <div className="confirm-token-summary-item-label">{ label }</div>
    {
      action
        ? (
          <button
            type="button"
            className="confirm-token-summary-item-value"
            onClick={action}
          >
            { value }

          </button>
        )
        : <div className="confirm-token-summary-item-value">{ value }</div>
    }
  </div>
);

export interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  name?: string
  symbol?: string
  supply?: string
  icon?: string
  isBurnable?: boolean
  isMintable?: boolean
}

const openIcon = (src?: string, name?: string): void => {
  if (!src) return;

  const image = new Image();
  image.src = src;

  const tab = window.open('');
  if (tab) {
    tab.document.write(image.outerHTML);
    tab.document.title = `${name} ${strings.logo}`;
  }
};

const ConfirmToken = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  symbol,
  icon,
  supply,
  isBurnable,
  isMintable,
}: Props): JSX.Element => (
  <Uik.Modal
    className="confirm-token"
    title={strings.confirm_your_token}
    isOpen={isOpen}
    onClose={onClose}
    footer={(
      <Uik.Button
        text={strings.create_token}
        fill
        size="large"
        onClick={() => {
          if (onConfirm) onConfirm();
          if (onClose) onClose();
        }}
      />
  )}
  >
    <div className="confirm-token__container">
      <div className="confirm-token-summary">
        <SummaryItem
          label={strings.token_name}
          value={name}
        />
        <SummaryItem
          label={strings.token_symbol}
          value={(symbol || '').toUpperCase()}
        />
        <SummaryItem
          label={strings.initial_supply}
          value={Uik.utils.formatAmount(supply || '')}
        />
        <SummaryItem
          label={strings.burnable}
          value={isBurnable ? strings.yes : strings.no}
        />
        <SummaryItem
          label={strings.mintable}
          value={isMintable ? strings.yes : strings.no}
        />
        <SummaryItem
          label={strings.token_logo}
          value={icon ? strings.custom : strings.generated}
          action={icon ? () => openIcon(icon, name) : undefined}
          className={!icon ? 'confirm-token-summary-item--faded' : ''}
        />
      </div>
    </div>
  </Uik.Modal>
);

export default ConfirmToken;
