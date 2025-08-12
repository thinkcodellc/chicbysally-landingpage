// Simple test runner for URL utility functions
import { sanitizeImageUrl, isImageKitUrl } from './utils';

function assertEquals(actual: string | boolean, expected: string | boolean, testName: string) {
  if (actual === expected) {
    console.log(`✅ ${testName}`);
    return true;
  } else {
    console.log(`❌ ${testName}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
    return false;
  }
}

let totalTests = 0;
let passedTests = 0;

console.log('Testing URL Utility Functions...\n');

// Test isImageKitUrl function
console.log('=== Testing isImageKitUrl ===');

totalTests++;
passedTests += assertEquals(
  isImageKitUrl('https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg?updatedAt=1752706312359'),
  true,
  'should return true for ImageKit URLs'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  isImageKitUrl('https://example.com/image.jpg'),
  false,
  'should return false for non-ImageKit URLs'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  isImageKitUrl(''),
  false,
  'should return false for empty string'
) ? 1 : 0;

// Test sanitizeImageUrl function
console.log('\n=== Testing sanitizeImageUrl ===');

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl('https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg?updatedAt=1752706312359&param=value'),
  'https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg',
  'should remove query parameters from ImageKit URLs'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl('https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg'),
  'https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg',
  'should handle ImageKit URLs without query parameters'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl('https://example.com/image.jpg?param=value'),
  'https://example.com/image.jpg',
  'should handle non-ImageKit URLs with query parameters'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl('https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg?updatedAt=1752706312359&width=600&height=800'),
  'https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg',
  'should handle URLs with multiple query parameters'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl('https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg?updatedAt=1752706312359#section'),
  'https://ik.imagekit.io/fr4dwpsz7/Reference/berlook-workout_0018.jpg#section',
  'should handle URLs with fragments'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl('not-a-valid-url'),
  'not-a-valid-url',
  'should handle malformed URLs gracefully'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl(''),
  '',
  'should handle empty string'
) ? 1 : 0;

totalTests++;
passedTests += assertEquals(
  sanitizeImageUrl('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='),
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'should handle data URLs'
) ? 1 : 0;

// Summary
console.log('\n=== Test Summary ===');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
}
