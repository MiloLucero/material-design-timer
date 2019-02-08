// TODO: Bug - Timer stops when browser tab is changed. Web workers / Set a real time reference and recalculate (alarm won't work if document is not active).
// TODO: Instead of having a diferent stop button, make the Start button toggle to Stop.
// TODO: Make a progress bar that indicates the elapsed time. (https://jsfiddle.net/vd6z0rjw/1/)?
// TODO: Lap animation to fadeIn new laps.
// TODO: Make alarm functionality.
// TODO: In stopwatch - While running, lower the opacity of the time blocks that are 00 (but be careful with bug at times like 1:00:00).

/**
 * DOM selectors
 */
const boxWrapper        = document.getElementById('box-wrapper');
// Mode selection
const modeSelectionContainer = document.getElementById('mode-selection-container');
const timerModeBtn      = document.getElementById('timer-mode-btn');
const stopwatchModeBtn  = document.getElementById('stopwatch-mode-btn');
const alarmModeBtn      = document.getElementById('alarm-mode-btn');
const selectionBar      = document.getElementById('selection-bar');
// Timer display
const timerContainer    = document.getElementById('timer-container');
const timerHours        = document.getElementById('timer-hours');
const timerMinutes      = document.getElementById('timer-minutes');
const timerSeconds      = document.getElementById('timer-seconds');
const timerCentiseconds = document.getElementById('timer-centiseconds');
// Timer controls
const timerControls     = document.querySelectorAll('.time-control-btn');
const increaseHourBtn   = document.getElementById('increase-hour');
const increaseMinuteBtn = document.getElementById('increase-minute');
const increaseSecondBtn = document.getElementById('increase-second');
const decreaseHourBtn   = document.getElementById('decrease-hour');
const decreaseMinuteBtn = document.getElementById('decrease-minute');
const decreaseSecondBtn = document.getElementById('decrease-second');
// Stopwatch display
const stopwatchContainer = document.getElementById('stopwatch-container');
const lapsContainer     = document.getElementById('laps-container');
// Timer actions
const timerActions      = document.getElementById('timer-actions');
const startBtn          = document.getElementById('start-btn');
const stopBtn           = document.getElementById('stop-btn');     
const resetBtn          = document.getElementById('reset-btn');
const alarmBtn          = document.getElementById('alarm-btn');
const lapBtn            = document.getElementById('lap-btn');


/**
 * Global objects
 */
const Time = {
  timerMode: null,
  targetCentiseconds: 0,
  hours: '00',
  minutes: '00',
  seconds: '00',
  centiseconds: '00',
  isRunning: false,
  intervalId: null,
  Alarm: {
    sound: new Audio('media/alarm/alarm.mp3'),
    isOn: true
  }
}

/**
 * Helper functions
 */

/**
 * Displays corresponding time mode interface.
 * @param {string}  mode  timer/stopwatch/alarm
 */
const displayMode = (mode) => {
  if (Time.timerMode !== mode) {
    Time.timerMode = mode;
    boxWrapper.classList.remove('timer-mode', 'stopwatch-mode', 'alarm-mode');
    boxWrapper.classList.add(`${mode}-mode`); // CSS styles of each mode vary depending on bloxWrapper class 
    changeTime(0);
    changeModeSelectionBar(mode);
    toggleComponents(mode);
  }
}

/**
 * Shows or hides components based on the active mode
 * @param {string}  mode  timer/stopwatch/alarm
 */
const toggleComponents = () => {
  const timerComponents     = [timerContainer, timerControls, alarmBtn];
  const stopwatchComponents = [stopwatchContainer, lapBtn, lapsContainer];
  const alarmComponents = [];
  
  if (Time.timerMode === 'timer') {
    hide(...stopwatchComponents);
    hide(...alarmComponents);
    show(...timerComponents);
  }
  else if (Time.timerMode === 'stopwatch') {
    hide(...timerComponents);
    hide(...alarmComponents);
    show(...stopwatchComponents);
    enable(startBtn);
  }
  else if (Time.timerMode === 'alarm') {
    hide(...timerComponents);
    hide(...stopwatchComponents);
    show(...alarmComponents);
  }
}

/**
 * Adjusts selection bar according to the selected mode.
 * @param {string}  mode  timer/stopwatch/alarm
 */
const changeModeSelectionBar = (mode) => {
  const buttons = [timerModeBtn, stopwatchModeBtn, alarmModeBtn];
  const targetButton = buttons.find((button) => button.value === mode);
  for (let button of buttons) {
    button.classList.remove('active');
  }
  targetButton.classList.add('active');
  horizontalSlideTo(selectionBar, targetButton.offsetLeft); // Moves selection bar
  resetTimer();
}

// Increases or decreases time in the given amount of centiseconds.
const changeTime = (centiseconds) => {
  Time.targetCentiseconds += centiseconds;
  validateTimeControlButtons();
  toggleActionButtons('timeChange');
  displayTime();
}

// Sets time to zero
const resetTime = () => {
  changeTime(-Time.targetCentiseconds);
}

// Sets centiseconds to zero (e.g. If Time.targetCentiseconds is 9512 => 9500)
const resetCentiseconds = () => {
  changeTime(-Time.targetCentiseconds % 100);
}

// Calculates the time variables (hours, minutes, seconds), based on the time value.
const calcTimeToDisplay = () => {
  // Calculate numeric time
  const hours = Math.floor(Time.targetCentiseconds / (60 * 60 * 100));
  const minutes = Math.floor(Time.targetCentiseconds / (60 * 100)) % 60;
  const seconds = Math.floor(Time.targetCentiseconds / 100) % 60;
  const centiseconds = Time.targetCentiseconds % 100;

  // Convert time to padded strings and assign as Time properties ('00')
  Time.hours = hours.toString().padStart(2, 0);
  Time.minutes = minutes.toString().padStart(2, 0);
  Time.seconds = seconds.toString().padStart(2, 0);
  Time.centiseconds = centiseconds.toString().padStart(2, 0);
}

const displayTime = () => {
  calcTimeToDisplay();
  const hours = Time.hours.toString().padStart(2, 0);
  const minutes = Time.minutes.toString().padStart(2, 0);
  const seconds = Time.seconds.toString().padStart(2, 0);
  const centiseconds = Time.centiseconds.toString().padStart(2, 0);

  if (Time.timerMode === 'timer') {
    timerHours.textContent   = hours;
    timerMinutes.textContent = minutes;
    timerSeconds.textContent = seconds;
  }
  else if (Time.timerMode === 'stopwatch') {
    stopwatchContainer.innerHTML = `
      <div id="stopwatch-display">
        ${hours}:${minutes}:${seconds}.<span class="stopwatch-centiseconds">${centiseconds}</span>
      </div>
    `;
  }
}

/**
 * Timer functionality
 */
const startCountdown = () => {
  if (Time.targetCentiseconds !== 100) { // 100 because the timer is based on centiseconds, so the last second is displayed as zero, but there are still centiseconds left. The 100 makes the timer end one second earlier, so it ends as soon as it reaches zero.
    changeTime(-100);
  } else {
    // Block to execute when time runs out
    resetTime();
    blink(timerContainer, 3);
    if (Time.Alarm.isOn) {
      Time.Alarm.sound.play();
    }
    resetTimer();
  }
}

const toggleAlarm = () => {
  const alarmBtnIcon = alarmBtn.getElementsByTagName('I')[0];
  if (Time.Alarm.isOn) {
    alarmBtnIcon.classList.remove('fa-volume-up');
    alarmBtnIcon.classList.add('fa-volume-mute');
    Time.Alarm.isOn = false;
    // Stop alarm sound if it is playing
    if (!Time.Alarm.sound.paused) {
      Time.Alarm.sound.pause();
      Time.Alarm.sound.currentTime = 0;
    }
  } else {
    alarmBtnIcon.classList.remove('fa-volume-mute');
    alarmBtnIcon.classList.add('fa-volume-up');
    Time.Alarm.isOn = true;
  }
}

/**
 * Stopwatch functionality
 */
const startCountup = () => {
  changeTime(1);
}

const addNewLap = () => {
  lapsContainer.innerHTML += `
    <div>
      <span>Lap ${lapsContainer.childElementCount + 1}</span>
      <span class="lap-time">${Time.hours}:${Time.minutes}:${Time.seconds}.${Time.centiseconds}</span>
    </div>
  `;
  // fadeIn(lapsContainer.lastElementChild); // Buggy animation: Pressing laps too fast will cause animations to be incomplete.
}

const resetLaps = () => {
  lapsContainer.innerHTML = '';
}

/**
 * Alarm functionality
 */
const setAlarm = () => {
  // Sets an alarm at the selected time.
}

const startTimer = () => {
  Time.isRunning = true;
  toggleActionButtons('start');
  disableTimeControlButtons();
  if (Time.timerMode === 'timer') {
    Time.intervalId = setInterval(startCountdown, 1000);
  }
  else if (Time.timerMode === 'stopwatch') {
    Time.intervalId = setInterval(startCountup, 10);
  }
  else if (Time.timerMode === 'alarm') {
    // To execute on start in alarm-mode.
    // setAlarm();
  }
}

const stopTimer = () => {
  Time.isRunning = false;
  toggleActionButtons('stop');
  disableTimeControlButtons(false);
  validateTimeControlButtons();
  clearInterval(Time.intervalId)
}

const resetTimer = () => {
  stopTimer();
  toggleActionButtons('reset');
  resetTime();
  if (Time.timerMode === 'stopwatch') {
    resetLaps();
  }
}


/**
 * Enables or disables action buttons based on an action (usually but not necessarily the button pressed).
 * @param {string}  action  'timeChange'/'start'/'stop'/'reset'
 */
const toggleActionButtons = (action) => {
    if (action === 'timeChange') {
      Time.targetCentiseconds === 0 ? disable(resetBtn) : enable(resetBtn);
      if (Time.timerMode === 'timer') {
        Time.targetCentiseconds === 0 ? disable(startBtn) : enable(startBtn);
      }
    }
    else if (action === 'start') {
      hide(startBtn);
      disable(startBtn);
      show(stopBtn);
      enable(stopBtn, resetBtn, lapBtn);
      if (Time.timerMode === 'stopwatch') {
        enable(lapBtn);
      }
    }
    else if (action === 'stop') {
      hide(stopBtn);
      disable(stopBtn, lapBtn);
      show(startBtn);
      enable(startBtn);
    }
    else if (action === 'reset') {
      disable(startBtn, stopBtn, resetBtn, lapBtn);
      if (Time.timerMode === 'stopwatch') {
        enable(startBtn);
      }
    }
}
 
/**
 * Enables or disables timer-mode control buttons (increase or decrease time) based on timer values.
 */
const validateTimeControlButtons = () => {
  // Disable increase buttons when they would result in 100 hours or more.
  increaseHourBtn.disabled   = Time.targetCentiseconds >= (99 * 60 * 60) * 100 ? true : false;
  increaseMinuteBtn.disabled = Time.targetCentiseconds >= ((99 * 60 * 60) + (60 * 59)) * 100 ? true : false;
  increaseSecondBtn.disabled = Time.targetCentiseconds >= ((99 * 60 * 60) + (60 * 59) + (59)) * 100 ? true : false;
  
  // Disable decrease buttons when they would result in a negative time.
  decreaseHourBtn.disabled   = Time.targetCentiseconds < 60 * 60 * 100 ? true : false;
  decreaseMinuteBtn.disabled = Time.targetCentiseconds < 60 * 100 ? true : false;
  decreaseSecondBtn.disabled = Time.targetCentiseconds < 100 ? true : false;

  // Disable increase and decrease buttons if time is running.
  if (Time.isRunning) {
    disableTimeControlButtons();
  }
}

/**
 * Enables or disables timer-mode control buttons (increase or decrease time) based on boolean parameter.
 * @param  {boolean}  bool  true (default) to enable controls, false to disable them.
 */
const disableTimeControlButtons = (bool = true) => {
  const buttons = [increaseHourBtn, decreaseHourBtn, increaseMinuteBtn, decreaseMinuteBtn, increaseSecondBtn, decreaseSecondBtn];
  if (bool) {
    for (let button of buttons) {
      button.disabled = true;
    }
  } else {
    validateTimeControlButtons();
  }
}

/**
 * Event listeners
 */
timerActions.addEventListener('click', (e) => {
  if (e.target === startBtn) {
    startTimer();
  }
  if (e.target === stopBtn) {
    stopTimer();
  }
  if (e.target === resetBtn) {
    resetTimer();
  }
  if (e.target === alarmBtn) {
    toggleAlarm();
  }
  if (e.target === lapBtn) {
    addNewLap();
  }
});

// Recalculates target time based on time control clicks.
timerContainer.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    if      (e.target === increaseHourBtn)   { changeTime(60 * 60 * 100) }
    else if (e.target === decreaseHourBtn)   { changeTime(- 60 * 60 * 100) }
    else if (e.target === increaseMinuteBtn) { changeTime(60 * 100) }
    else if (e.target === decreaseMinuteBtn) { changeTime(- 60 * 100) }
    else if (e.target === increaseSecondBtn) { changeTime(1 * 100) }
    else if (e.target === decreaseSecondBtn) { changeTime(- 1 * 100) }
    resetCentiseconds();
  }
});

// Changes between timer modes
modeSelectionContainer.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    displayMode(e.target.value);
  }
});

/**
 * ON LOAD
 */
const start = () => {
  displayMode('timer');
  // Hide at load
  hide(stopBtn, lapsContainer);
  // Animations
  fadeIn(boxWrapper, 100);
  slideUp(boxWrapper, 1000);
}
start();
