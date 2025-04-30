import Image from "next/image";
import React from "react";

interface ReviewCardProps {
  profileImage?: string; // Opsional
  name: string;
  review: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ profileImage, name, review }) => {
  return (
    <div className="bg-white shadow-xl rounded-2xl px-8 py-10 max-w-xl mx-auto relative min-h-[300px] flex flex-col items-center justify-start text-center">
      {/* Foto Profil */}
      <div className="w-20 h-20 rounded-full overflow-hidden shadow-md mb-4">
        {profileImage ? (
          <Image
            src={profileImage}
            alt={`${name}'s profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
            👤
          </div>
        )}
      </div>

      {/* Nama Pengguna */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>

      {/* Kutipan & Review */}
      <div className="relative px-4 text-gray-700">
        <div className="absolute -left-4 top-0 text-4xl text-purple-200 font-serif">“</div>
        <p className="text-base leading-relaxed">
          {review}
        </p>
        <div className="absolute -right-4 bottom-0 text-4xl text-purple-200 font-serif rotate-180">“</div>
      </div>
    </div>
  );
};

export default ReviewCard;