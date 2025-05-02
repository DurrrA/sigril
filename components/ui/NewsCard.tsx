import Image from "next/image";
import React from "react";

interface NewsCardProps {
  image: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ image }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="relative w-full aspect-square"> {/* Membuat gambar persegi */}
        <Image
                  src={image}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-t-lg" alt={""}        />
      </div>
    </div>
  );
};

export default NewsCard;