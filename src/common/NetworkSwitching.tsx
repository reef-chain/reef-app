import React, { useContext, useMemo, useRef } from 'react';
import './network-switching.css';
import Uik from '@reef-chain/ui-kit';
import { CSSTransition } from 'react-transition-group';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import ReefSigners from '../context/ReefSigners';

export interface Props {
  isOpen?: boolean
}

const NetworkSwitching = ({ isOpen }: Props):JSX.Element => {
  const container = useRef(null);
  const {
    network,
  } = useContext(ReefSigners);

  const name = useMemo(() => {
    if (network?.name) {
      return network.name.charAt(0).toUpperCase() + network.name.slice(1);
    }

    return '';
  }, [network]);

  const text = useMemo(() => {
    if (isOpen) return `Switching to ${name}`;
    return `Connected to ${name}`;
  }, [isOpen, name]);

  const onExited = (): void => {
    document.body.style.overflow = '';
  };

  return (
    <CSSTransition
      in={isOpen}
      className="network-switching"
      nodeRef={container}
      timeout={{
        enter: 0,
        exit: 1500,
      }}
      unmountOnExit
      onExited={onExited}
    >

      <div ref={container} className="network-switching">
        {
          isOpen
            ? <Uik.Loading />
            : <Uik.Icon icon={faCircleCheck} />
        }
        <Uik.Text key={String(isOpen)}>{ text }</Uik.Text>
      </div>
    </CSSTransition>
  );
};

export default NetworkSwitching;
