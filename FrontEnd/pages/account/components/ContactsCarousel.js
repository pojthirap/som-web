import React, { useState, useEffect, useCallback } from "react";
import { toString } from '@helper'
import { useEmblaCarousel } from "embla-carousel/react";
import Image from "next/image";
import * as msg from '@msg'

function EmblaCarousel({ slide = [], onChange }) {
  const [currentSelect, setCurrentSelect] = useState(0);
  const [slideData, setSlideData] = useState([]);
  const [viewportRef, embla] = useEmblaCarousel({
    align: "center",
    skipSnaps: false,
    loop: true
  });

  useEffect(() => {
    if (embla) {
      embla.reInit({
        loop: true
      })
      setCurrentSelect(0)
      embla.scrollTo(0);
      if (onChange instanceof Function) {
        onChange(0)
      }
    }
  }, [slide]);


  const onSelect = useCallback(() => {
    if (!embla) return;
    setCurrentSelect(embla.selectedScrollSnap())
    if (onChange instanceof Function) {
      onChange(embla.selectedScrollSnap())
    }
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
  }, [embla, onSelect]);

  return (
    <div className="embla">
      <div className="embla-viewport" ref={viewportRef}>
        <div className="embla-container">
          {slide && slide.length ? slide.map((data, index) => (
            <div className="embla-slide contact-slide" key={index}>
              <div className={"embla-slide-inner contact-slide-inner" + (currentSelect == (index) ? " active" : "")}>
                <div className="py-3">
                  <span className="header-card-font-size">
                    {toString(data.firstName)} {toString(data.lastName)}
                  </span>
                </div>
                <div className="row border-top-white pt-3">
                  <div className="col-3 row justify-content-center">
                    <div className="icon-white">
                      <Image src="/img/icon/icon-phone.png" width="24" height="24" />
                    </div>
                    <div className="carousel-text">
                      {toString(data.phoneNo, true, true)}
                    </div>
                  </div>
                  <div className="col-3 row justify-content-center">
                    <div className="icon-white">
                      <Image src="/img/icon/icon-printer.png" width="24" height="24" />
                    </div>
                    <div className="carousel-text">
                      {toString(data.faxNo, true, true)}
                    </div>
                  </div>
                  <div className="col-3 row justify-content-center">
                    <div className="icon-white">
                      <Image src="/img/icon/icon-mobile.png" width="15" height="24" />
                    </div>
                    <div className="carousel-text">
                      {toString(data.mobileNo, true, true)}
                    </div>
                  </div>
                  <div className="col-3 row justify-content-center">
                    <div className="icon-white">
                      <Image src="/img/icon/icon-email.png" width="24" height="24" />
                    </div>
                    <div className="carousel-text">
                      {toString(data.email, true, true)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) :
            <div className="h1">
              {msg.tableNoData}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
