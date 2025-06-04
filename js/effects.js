// This file will contain JavaScript for visual effects
// such as parallax scrolling and typewriter animations.

document.addEventListener('DOMContentLoaded', function () {
    // Initialize simpleParallax.js
    // Ensure the image element has the ID 'hero-parallax-image'
    var heroImage = document.querySelector('#hero-parallax-image'); 
    if (heroImage) {
        new simpleParallax(heroImage, {
            scale: 1.5, // Image will be 50% larger and will have a more noticeable parallax effect
            orientation: 'down', // Parallax effect will be downwards on scroll
            delay: 0.4,       // Delay in seconds before the effect starts
            transition: 'cubic-bezier(0,0,0,1)', // Smooth transition
            overflow: false   // Set to true if you want to see the overflow of the image
        });
    }

    // Initialize TypeIt.js
    // Ensure the heading element has the ID 'hero-heading'
    var heroHeading = document.querySelector('#hero-heading');
    if (heroHeading) {
        // Clear existing text content before starting animation to prevent FOUC
        heroHeading.textContent = ''; 
        new TypeIt('#hero-heading', {
            strings: "Welcome to ChicBySally",
            speed: 75, // Speed of typing in milliseconds
            waitUntilVisible: true, // Start animation when element is visible
            cursor: false, // Show a blinking cursor (can be true or a custom char)
            lifeLike: true // More natural typing
        }).go();
    }
});
