import React, { useState, useEffect, useCallback } from "react";
import { toString } from '@helper'
import { useEmblaCarousel } from "embla-carousel/react";
import Image from "next/image";
import * as msg from '@msg'
function EmblaCarousel({ pathValue, slide = [], onChange }) {
  const [currentSelect, setCurrentSelect] = useState(0);
  const [slideData, setSlideData] = useState([]);
  const isCustomerPage = pathValue.type == "2";
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
          {slide.map((data, index) => (
            <div className="embla-slide address-slide" key={index}>
              <div style={{ padding: "1.5rem" }} className={"embla-slide-inner address-slide-inner" + (currentSelect == (index) ? " active" : "")}>
                <div className="pb-3">
                  <div className="header-card-address-custom">
                    {toString(data.addressFullName)}
                  </div>
                  <div className="row pt-3">
                    <div className="col-6 row justify-content-start">
                      <div className="icon-white">
                        <Image src="/img/icon/icon-phone.png" width="24" height="24" />
                      </div>
                      <div className="ml-2 d-flex align-items-center">
                        {toString(data.tellNo, true, true)}
                      </div>
                    </div>
                    <div className="col-6 row justify-content-start">
                      <div className="icon-white">
                        <Image src="/img/icon/icon-printer.png" width="24" height="24" />
                      </div>
                      <div className="ml-2 d-flex align-items-center">
                        {toString(data.faxNo, true, true)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row border-top-white pt-3">
                  <div className="col-4 row justify-content-start">
                    <div style={{ color: "rgba(255,255,255,.5)" }} className="ml-2 d-flex align-items-center">
                      {msg.shipTo}
                    </div>
                  </div>
                  <div className="col-4 row justify-content-start">
                    <div style={{ color: "rgba(255,255,255,.5)" }} className="ml-2 d-flex align-items-center">
                      {msg.billTo}
                    </div>
                  </div>
                  <div className="col-4 row justify-content-start">
                    <div style={{ color: "rgba(255,255,255,.5)" }} className="ml-2 d-flex align-items-center">
                      {msg.main}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-4 row justify-content-start">
                    <div className="ml-2 d-flex align-items-center">
                      {data.shiftToFlag == "1" ? "Yes" : "-"}
                    </div>
                  </div>
                  <div className="col-4 row justify-content-start">
                    <div className="ml-2 d-flex align-items-center">
                      {data.billToFlag == "1" ? "Yes" : "-"}
                    </div>
                  </div>
                  <div className="col-4 row justify-content-start">
                    <div className="ml-2 d-flex align-items-center">
                      {data.mainAddressFlag == "1" || !isCustomerPage ? "Yes" : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
