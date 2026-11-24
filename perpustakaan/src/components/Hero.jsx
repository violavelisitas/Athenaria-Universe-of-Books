"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// All banner files must have the same proportions (about 3.2 : 1,
// for example 1600x500). Slides with different ratios make the page jump.
const BANNERS = ["/main_banner.png", "/coklat.jpeg", "/navy.png", "ungu2.jpg"];

export default function Hero({ nama, slogan, lokasi, jamBuka }) {
  const hasManySlides = BANNERS.length > 1;

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden -mt-8">
      {/* The banners already contain the brand text, so the title is
          only kept for screen readers. */}
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
            {/* h-auto keeps the full image visible, nothing is cropped */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Banner Athenaria ${index + 1}`}
              className="block h-auto w-full translate-y-0.5"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}