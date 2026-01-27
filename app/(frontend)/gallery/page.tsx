import React from "react";
import Masonry from "@/components/Masonry";

const items = [
  {
    id: "1",
    img: "https://picsum.photos/id/1015/800/600",
    url: "https://picsum.photos/",
    height: 200,
  },
  {
    id: "2",
    img: "https://picsum.photos/id/1024/800/900",
    url: "https://picsum.photos/",
    height: 300,
  },
  {
    id: "3",
    img: "https://picsum.photos/id/1035/800/700",
    url: "https://picsum.photos/",
    height: 250,
  },
  {
    id: "4",
    img: "https://picsum.photos/id/1043/800/1000",
    url: "https://picsum.photos/",
    height: 350,
  },
  {
    id: "5",
    img: "https://picsum.photos/id/1050/800/800",
    url: "https://picsum.photos/",
    height: 280,
  },
  {
    id: "6",
    img: "https://picsum.photos/id/1062/800/900",
    url: "https://picsum.photos/",
    height: 320,
  },
  {
    id: "7",
    img: "https://picsum.photos/id/1074/800/650",
    url: "https://picsum.photos/",
    height: 220,
  },
  {
    id: "8",
    img: "https://picsum.photos/id/1084/800/850",
    url: "https://picsum.photos/",
    height: 290,
  },
  {
    id: "9",
    img: "https://picsum.photos/id/1080/800/920",
    url: "https://picsum.photos/",
    height: 310,
  },
  {
    id: "10",
    img: "https://picsum.photos/id/109/800/780",
    url: "https://picsum.photos/",
    height: 260,
  },
];

export default function Page() {
  return (
    <div className="mb-5 ">
      <div className="relative h-[50vh] flex items-center justify-center font-primary text-white overflow-hidden ">
        <h1 className="absolute text-5xl opacity-10 select-none">CATALYST</h1>
        <p className="relative text-xl tracking-wide">GALLERY</p>
      </div>

      <div className="mx-5">
        <Masonry
          items={items}
          ease="power3.out"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover
          hoverScale={0.95}
          blurToFocus
          colorShiftOnHover
        />
      </div>
    </div>
  );
}
