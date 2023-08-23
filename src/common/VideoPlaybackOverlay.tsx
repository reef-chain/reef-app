import { Components } from '@reef-defi/react-lib';
import React from 'react';
import './overlay-swap.css';

const { OverlayAction } = Components;

export interface VideoPlaybackOverlay {
  isOpen: boolean;
  src?: string;
  title?: string;
  onClose?: () => void;
}

const VideoPlaybackOverlay = ({
  isOpen,
  src,
  title,
  onClose,
}: VideoPlaybackOverlay): JSX.Element => (
  <OverlayAction
    isOpen={isOpen}
    title={title ?? 'NFT Playback'}
    onClose={onClose}
    className="overlay-swap"
  >
    <div className="uik-pool-actions pool-actions">
      <video className="nfts__item-video" autoPlay loop muted poster="">
        <source src={src} type="video/mp4" />
      </video>
    </div>
  </OverlayAction>
);

export default VideoPlaybackOverlay;
