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
                    {slide.map((data, index) => (
                        <div className="embla-slide salesData-slide" key={index}>
                            <div className={"embla-slide-inner salesData-slide-inner" + (currentSelect == (index) ? " active" : "")}>
                                <div className="row">
                                    <span className="header-card-font-size">
                                        {toString(data.orgNameTh)}
                                    </span>
                                </div>
                                {data.channelNameTh ?
                                    <div className="row pb-2">
                                        <div className="icon-white">
                                            <Image src="/img/icon/icon-podium.png" width="24" height="24" />
                                        </div>
                                        <span className="ml-2 d-flex align-items-center">
                                            {toString(data.channelNameTh)}
                                        </span>
                                    </div>
                                    : "-"}
                                <div className="row border-top-white pt-2">
                                    <div className="col-4 row justify-content-start">
                                        <div style={{ color: "rgba(255,255,255,.5)" }} className="ml-2 d-flex align-items-center">
                                            {msg.divisionLabel}
                                        </div>
                                    </div>
                                    <div className="col-4 row justify-content-start">
                                        <div style={{ color: "rgba(255,255,255,.5)" }} className="ml-2 d-flex align-items-center">
                                            {msg.saleOfficeLabel}
                                        </div>
                                    </div>
                                    <div className="col-4 row justify-content-start">
                                        <div style={{ color: "rgba(255,255,255,.5)" }} className="ml-2 d-flex align-items-center">
                                            {msg.saleGroupLabel}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-4 row justify-content-start">
                                        <div className="ml-2 d-flex align-items-center">
                                            {toString(data.divisionNameTh, true, true)}
                                        </div>
                                    </div>
                                    <div className="col-4 row justify-content-start">
                                        <div className="ml-2 d-flex align-items-center">
                                            {toString(data.officeNameTh, true, true)}
                                        </div>
                                    </div>
                                    <div className="col-4 row justify-content-start">
                                        <div className="ml-2 d-flex align-items-center">
                                            {toString(data.groupNameTh, true, true)}
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
