"use client";

import { ReferenceImage } from "@/lib/data";

interface ReferenceImageGridProps {
  images: ReferenceImage[];
  selectedImageId: string | null;
  onImageSelect: (image: ReferenceImage) => void;
}

export default function ReferenceImageGrid({ 
  images, 
  selectedImageId, 
  onImageSelect
}: ReferenceImageGridProps) {
  return (
    <div className="w-full">
      {/* Horizontal scrollable container with enhanced styling */}
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-pink-100">
        {images.map((image) => (
          <div 
            key={image.id}
            onClick={() => onImageSelect(image)}
            className={`flex-shrink-0 w-1/3 group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform ${
              selectedImageId === image.id
                ? 'ring-4 ring-pink-500 ring-offset-2 ring-offset-white scale-105 shadow-lg'
                : 'hover:ring-2 hover:ring-pink-300 hover:scale-105 hover:shadow-md'
            }`}
            style={{ flexBasis: 'calc(33.333% - 1rem)' }}
          >
            {/* Fixed-size square tile with rounded corners */}
            <div className="relative bg-gray-100 overflow-hidden rounded-xl" style={{ aspectRatio: '1 / 1' }}>
              <img 
                src={image.url} 
                alt={image.title}
                className={`w-full h-full object-cover object-top object-center transition-all duration-300 ${
                  selectedImageId === image.id 
                    ? 'brightness-110' 
                    : 'group-hover:brightness-105'
                }`}
              />
              {/* Selection indicator overlay */}
              {selectedImageId === image.id && (
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent flex items-end justify-center pb-2">
                  <div className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Selected
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-image text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No reference images available.</p>
        </div>
      )}
    </div>
  );
}
