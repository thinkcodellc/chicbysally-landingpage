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
      {/* Image Grid - 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div 
            key={image.id}
            onClick={() => onImageSelect(image)}
            className={`group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
              selectedImageId === image.id
                ? 'ring-4 ring-pink-500 ring-opacity-50'
                : 'hover:ring-2 hover:ring-pink-300'
            }`}
          >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-xs font-medium truncate">{image.title}</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm font-medium text-gray-800 truncate">{image.title}</div>
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
