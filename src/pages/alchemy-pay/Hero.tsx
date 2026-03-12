import React from 'react';
import './hero.css';
import Uik from '@reef-chain/ui-kit';

const { Bubbles } = Uik;

interface Props{
    title:string;
    subtitle:string;
    isLoading:boolean;
    imageAlt?:string;
}

function Hero({
  title,
  subtitle,
  isLoading,
  imageAlt = 'Reef x Alchemy Pay banner',
}: Props) {
  return (
    <div className='hero'>
      <div className='headline-wrapper'>
        <h1 className='hero-headline'>
          {title}
        </h1>
        
        <p className='hero-subtitle'>
        {isLoading? <>
            <Uik.FishAnimation />
        </>:<></>}
          {subtitle}
        </p> 
      </div>
      
      <Bubbles />
      <img className='hero-image' 
           src={'/img/buy.jpg'} 
           alt={imageAlt}
      />
    </div>
  );
}

export default Hero;
