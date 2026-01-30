import Slider from "./simpleSlider.js";

document.addEventListener('DOMContentLoaded', () => {
    const sliderSet = {
        wrapper: '.gallery',
        // prev: '.arrow-left',
        // next: '.arrow-rigth',
        // interval: 2,
        centralItem: 3,
        swipe: false,

    };
    const exampleSlider = new Slider(sliderSet);
    window.addEventListener("resize", () => exampleSlider.setState());
    // document.querySelector('.gallery').addEventListener('click', () => {
    //     exampleSlider.destroy();
    // })
});