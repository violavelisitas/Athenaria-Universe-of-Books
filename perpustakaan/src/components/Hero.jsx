"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const BANNERS = ["/main_banner.png", "/navy.png", "ungu2.jpg"];

export default function Hero({ nama, slogan, lokasi, jamBuka }) {
  const hasManySlides = BANNERS.length > 1;

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden -mt-1">

      <h1 className="sr-only">
        {nama}: {slogan}
      </h1>

      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop={hasManySlides}
        autoplay={
          hasManySlides ? { delay: 5000, disableOnInteraction: false } : false
        }
        pagination={{ clickable: true }}
        className="w-full"
      >
        {BANNERS.map((src, index) => (
          <SwiperSlide key={src}>
            <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Banner Athenaria ${index + 1}`} className="block h-auto w-full object-cover object-center sm:h-auto" />
              {/* Fade into the page background so there is no hard edge */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0b1a] to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}