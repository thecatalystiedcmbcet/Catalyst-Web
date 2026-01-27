import React from "react";
const Card = () => {
  return (
    <div className="text-white">
      <div>
        <img
          src="
      /agni.png"
          alt=""
        />
      </div>
      <div>
        <h1 className="font-primary text-3xl mt-2">2025</h1>
        <p className="font-secondary text-lg mt-[-10]">
          Catalyst TRIBE x Permute 2025
        </p>
        <p className="font-secondary text-sm mt-3 text-left">
          The creative team of Catalyst IEDC - TRIBE was the official design
          partner of India’s largest skill festival, Permute 2025 where MBCET
          witnessed history by receiving the µButton for being the first campus
          to hit 2 Million Karma Points.
        </p>
      </div>
    </div>
  );
};
const Team = () => {
  const stats = [1, 2];
  return (
    <div className="">
      <div className="relative h-[50vh] flex items-center justify-center font-primary text-white overflow-hidden">
        {/* Background text */}
        <h1 className="absolute text-5xl  opacity-10 select-none">CATALYST</h1>

        {/* Foreground text */}
        <p className="relative text-lg tracking-wide">ACHIEVEMENTS</p>
      </div>
      <div className="mx-7 grid grid-cols-1 gap-10 mt-[-60] mb-10">
        {stats.map((item, key) => (
          <Card key={key} />
        ))}
      </div>
    </div>
  );
};

export default Team;
