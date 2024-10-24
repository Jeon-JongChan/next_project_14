"use client";
import {useState, useEffect} from "react";
import {sleep} from "/_custom/scripts/common.js";

const defaultProps = {
  slides: [
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide%201",
    },
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide%202",
    },
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide%203",
    },
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide%204",
    },
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide%205",
    },
  ],
};

export default function Component(props) {
  if (Object.keys(props).length === 0) props = defaultProps;
  const slides = props?.slides.length ? props.slides : defaultProps.slides;
  // const thumbnail = props.thumbnail || false;
  const description = props.description || true;
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slideAnimation, setSlideAnimation] = useState(true);
  const slideCount = slides.length + 1; // 반복되는 슬라이드를 위해 1개를 추가 (마지막 슬라이드(첫번째위치)를 추가)
  const nextSlide = () => {
    if (!slideAnimation) setSlideAnimation(true);
    const nextIndex = (currentSlide + 1) % slideCount;
    setCurrentSlide(nextIndex);
    if (nextIndex === slideCount - 1) teleportSlide((nextIndex + 1) % slideCount);
  };

  const prevSlide = () => {
    if (!slideAnimation) setSlideAnimation(true);
    const prevIndex = (currentSlide - 1 + slideCount) % slideCount;
    setCurrentSlide(prevIndex);
    if (prevIndex === 0) teleportSlide((prevIndex - 1 + slideCount) % slideCount);
  };

  const teleportSlide = (index) => {
    let timer;
    timer = new Promise(() => {
      clearTimeout(timer);
      setTimeout(() => {
        console.log("teleportSlide", index);
        setSlideAnimation(false);
        setCurrentSlide(index);
      }, 600);
    });
  };

  useEffect(() => {
    const intervalId = setInterval(nextSlide, 100000); // 3초마다 다음 슬라이드로 이동
    return () => clearInterval(intervalId);
  }, [currentSlide]);

  function createSlide(slideInfo, index) {
    const hoverStyle = "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ";
    const slideDescStyle = "pl-16 ";
    return (
      <div key={index} className="relative w-full h-full group">
        <img src={slideInfo?.imageUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <>
      <div className="slide-banner w-full max-h-full overflow-hidden relative group" style={{height: "579px"}}>
        <div className="img-world-slide absolute w-full top-0" style={{height: "579px"}}>
          {/* <button className={"group-hover:opacity-100 transition-opacity duration-300 " + "absolute left-4 top-1/2 transform -translate-y-1/2 arrow-init arrow-world-left"} onClick={prevSlide}></button> */}
          {/* <button className={"group-hover:opacity-100 transition-opacity duration-300 " + "absolute right-4 top-1/2 transform -translate-y-1/2 arrow-init arrow-world-right"} onClick={nextSlide}></button> */}
        </div>
        <div className="overflow-hidden img-world-slidemask relative" style={{top: "12px"}}>
          <div className="flex flex-row h-full z-0 relative" style={{width: `${slideCount * 100}%`, transform: `translateX(-${currentSlide * (100 / slideCount)}%)`, transition: `${slideAnimation ? "transform 0.5s ease" : ""}`}}>
            {createSlide(slides[slides.length - 1], 1)}
            {slides.map((slide, index) => createSlide(slide, index + 1))}
          </div>
        </div>
      </div>
    </>
  );
}

/* 슬라이드 안에 dot 추가할 때
<div className="dots absolute bottom-4 left-0 w-full flex justify-center">
  {slides.map((_, index) => (
    <button key={index} onClick={() => setCurrentSlide(index)} className={`dot mx-1 w-4 h-4 rounded-full ${currentSlide === index ? "bg-black" : "bg-gray-300"}`}></button>
  ))}
</div>
*/
