/**
 * ANIMATIONS
 */
const fadeIn = (element, miliseconds = 100) => {
  element.style.opacity = 0;
  const intervalId = setInterval(() => {
    let opacity = parseFloat(element.style.opacity);
    if (opacity < 1) {
      element.style.opacity = opacity + 0.01;
    } else {
      clearInterval(intervalId);
    }
  }, miliseconds / 100);
}

const slideUp = (element, miliseconds) => {
  element.style.position = 'relative';
  element.style.top = '30px';
  const intervalId = setInterval(() => {
    let top = parseInt(element.style.top);
    if (top > 0) {
      element.style.top = top - 1 + 'px';
    } else {
      clearInterval(intervalId);
    }
  }, miliseconds / 100);
}

const blink = (element, times) => {
  let counter = 0;
  let fadeOutComplete = false;
  element.style.opacity = 1;
  const animationIntervalId = setInterval(() => {
    disableTimeControlButtons();
    let opacity = parseFloat(element. style.opacity);
    if (opacity > 0 && !fadeOutComplete) {
      element.style.opacity = opacity - 0.01;
    } else {
      fadeOutComplete = true;
      if (opacity < 1) {
        element.style.opacity = opacity + 0.01;
      } else {
        fadeOutComplete = false;
        counter++;
      }
    }
    if (counter === times) {
      disableTimeControlButtons(false);
      clearInterval(animationIntervalId);
    }
  }, 1);
}

const horizontalSlideTo = (element, finalPosition) => {
  const initialPosition = element.offsetLeft;
  const movement = finalPosition - initialPosition;
  const movementDirection = Math.sign(movement); // Will return -1 for left and 1 for right
  const intervalId = setInterval(() => {
    element.style.left = element.offsetLeft + (5 * movementDirection) + 'px';
    if (movementDirection === 1 && element.offsetLeft > finalPosition ||
        movementDirection === -1 && element.offsetLeft < finalPosition) {
      element.style.left = finalPosition + 'px';
    }
    if (element.offsetLeft === finalPosition) {
      clearInterval(intervalId);
    }
  }, 1);
}
