import React from 'react';
import './hero.css';
import Uik from '@reef-chain/ui-kit';

const { Bubbles } = Uik;

interface Props{
    title:string;
    subtitle:string;
    isLoading:boolean;
}

function Hero({title,subtitle,isLoading}:Props) {
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
           alt="Reef x Alchemy Pay banner" 
      />
    </div>
  );
}

export default Hero;