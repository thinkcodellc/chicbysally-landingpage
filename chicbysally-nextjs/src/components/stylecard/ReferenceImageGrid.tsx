"use client";

import { ReferenceImage } from "@/lib/data";
import { appendImageKitTransformations } from "@/lib/utils";

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
            onClick={() => {
              const transformedUrl = appendImageKitTransformations(image.url);
              console.log('Selected reference image URL with transformations:', transformedUrl);
              onImageSelect(image);
            }}
            className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
              selectedImageId === image.id
                ? 'ring-4 ring-pink-500 ring-opacity-50'
                : 'hover:ring-2 hover:ring-pink-300'
            }`}
          >
            {/* Fixed-size square tile with rounded corners */}
            <div className="relative bg-gray-100 overflow-hidden rounded-xl" style={{ aspectRatio: '1 / 1' }}>
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {/* Hide filename/title per request */}
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
