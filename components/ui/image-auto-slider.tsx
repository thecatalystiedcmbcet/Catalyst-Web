import React from "react";
import Image from "next/image";

export const Component = () => {
  const images = [
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=2152&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2126&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=1965&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1673264933212-d78737f38e48?q=80&w=1974&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1711434824963-ca894373272e?q=80&w=2030&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1675705721263-0bbeec261c49?q=80&w=1940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524799526615-766a9833dec0?q=80&w=1935&auto=format&fit=crop",
  ];

  const duplicatedImages = [...images, ...images];

  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: scroll-left 90s linear infinite;
          will-change: transform;
        }

        .scroll-mask {
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        .image-item {
          transition: transform 0.4s ease, filter 0.4s ease;
        }

        .image-item:hover {
          transform: scale(1.03);
          filter: brightness(1.08);
        }
      `}</style>

      <div className="relative w-full overflow-hidden">
        <div className="scroll-mask w-full">
          <div className="infinite-scroll flex w-max">
            {duplicatedImages.map((image, index) => (
              <div
                key={index}
                className="
                  image-item
                  flex-shrink-0
                  relative
                  w-[320px] md:w-[420px] lg:w-[520px]
                  aspect-[16/9]
                  overflow-hidden
                "
              >
                <Image
                  src={image}
                  alt={`Gallery image ${(index % images.length) + 1}`}
                  fill
                  sizes="(max-width: 768px) 320px, (max-width: 1024px) 420px, 520px"
                  className="object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </>
  );
};
