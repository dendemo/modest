function Slider({
  slider,
  screen,
  slideClass,
  autoplay = false,
  playInterval = 2000,
  controlContainer = false,
  controlClass
}) {
  let start,
    diff = 0,
    isInTransit = false,
    allSlides,
    slideRect,
    direction,
    offset = 0,
    timerId,
    controlActiveClass,
    controls,
    oldWidth,
    focusable = [],
    currentIndex = 0,
    isTouchable = false;

  let events = {
    mousedown: 'mousedown',
    mousemove: 'mousemove',
    click: 'click',
    mouseup: 'mouseup'
  }
  //Find all elems inside parent that have tabindex >= 0 and store it in array
  function findAllFocusable(index, elem) {
    let children = elem.children;

    if (!focusable[index]) focusable[index] = [];

    if (children.length == 0) return;

    Array.prototype.forEach.call(children, child => {

      if (child.tabIndex >= 0) {

        focusable[index].push(child);
      }

      findAllFocusable(index, child);
    })
  }

  function resetAllTabindex() {
    focusable.forEach(item => {
      item.forEach(item => {
        item.tabIndex = -1;
      })
    })
  }

  function addTabindex(index) {
    if (focusable[index].length == 0) return;

    focusable[index].forEach(item => {
      item.tabIndex = 0;
    })
  }
  //Move slider on a given distance
  function moveSlider(diff) {
    //Switch off transition property
    screen.style.transition = 'none';

    let x = -((currentIndex + offset) * 100) + '%';

    screen.style.transform = `translateX(calc(${x} + ${diff}px)`;
  }

  function getNewIndex(direction) {
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      newIndex = allSlides.length - 1;
    } else if (newIndex > allSlides.length - 1) {
      newIndex = 0;
    }

    return newIndex;
  }
  //Take back slide to the old position
  function clearMove() {
    isInTransit = true;
    //Switch on transition property
    screen.style.transition = '';

    let x = -((currentIndex + offset) * 100) + '%';

    screen.style.transform = `translateX(${x})`;

    start = 0;
    diff = 0;
  }

  function getSlideRect() {
    let prop = slider.getBoundingClientRect(),
      xOffset = window.pageXOffset,
      yOffset = window.pageYOffset;

    let slideRect = {
      x: prop.x + xOffset,
      y: prop.y + yOffset,
      right: prop.right + xOffset,
      bottom: prop.bottom + yOffset,
      width: prop.width
    };

    return slideRect;
  }
  //If escape event fired, return a slide or show a new one
  function handleMove() {
    if (!diff) {
      start = 0;
      return;
    }

    if (Math.abs(diff) < slideRect.width / 4) {
      clearMove();
      return;
    }

    let newIndex = getNewIndex(direction);
    showNextSlide(newIndex);
  }
  //Find value for transform property and show a new slide 
  function showNextSlide(index) {
    isInTransit = true;
    //Switch on transition property
    screen.style.transition = '';

    let x;

    if (index == allSlides.length - 1 && offset == 1) {
      x = 0;
    } else if (index == 0 && offset == -1) {
      x = -(allSlides.length - 1) * 100 + "%";
    } else {
      x = -(index * 100) + '%';
    }

    screen.style.transform = `translateX(${x})`;

    start = 0;
    diff = 0;
    //Add tabindex only to the current slider's children
    resetAllTabindex();
    addTabindex(index);

    if (controlContainer) highlightControl(index);

    currentIndex = index;
  }
  //Add last slide to the start and set an offset to show it correctly
  function addLastToStart() {
    allSlides[allSlides.length - 1].style.order = '-1';
    allSlides[0].style.order = '';
    offset = 1;
  }
  //Add first slide to the end
  function addFirstToEnd() {
    allSlides[0].style.order = '1';
    allSlides[allSlides.length - 1].style.order = '';
    offset = -1;
  }

  function highlightControl(index) {
    //If it's the first call, so there is no control to remove highlight state
    if (index != currentIndex) controls[currentIndex].classList.remove(controlActiveClass);

    controls[index].classList.add(controlActiveClass);
  }

  this.init = function() {
    allSlides = document.getElementsByClassName(slideClass);
    //Just one slide = no need to kick of all stuff
    if (!allSlides[1]) return;
    //Get the coords of the slide container
    slideRect = getSlideRect();
    oldWidth = window.innerWidth;
    //Find all elems that have tabindex >= 0
    Array.prototype.forEach.call(allSlides, (item, index) => {
      findAllFocusable(index, item);
    })
    //Add tabindex only to the first seen slider
    resetAllTabindex();
    addTabindex(0);
    //Check on touchscreen and change events
    if ('ontouchstart' in window) {
      events = {
        mousedown: 'touchstart',
        mousemove: 'touchmove',
        click: 'touchend',
        mouseup: 'touchend'
      }

      isTouchable = true;
    }
    //If controls is on
    if (controlContainer) {
      controlActiveClass = controlClass + "_highlighted";
      //One control for each slide
      controls = Array.prototype.map.call(allSlides, () => {
        let control = document.createElement('button');
        control.classList.add(controlClass);

        return control;
      });

      controlContainer.append(...controls);
      //Highlight current control on init
      highlightControl(currentIndex);
      //Change slides on click
      controlContainer.addEventListener(events.click, function(e) {
        if (isInTransit) return;

        let target = e.target;
        if (!target.closest('button') || target == controls[currentIndex]) return;
        //If slide changing is scheduled, then cancel it
        if (timerId) clearTimeout(timerId);
        //Find index and show corresponding slide
        let index = controls.indexOf(target);
        showNextSlide(index);
      })
    }
    //Find and remember start position of event so as to calculate trace on mousemove or touchmove event later on
    slider.addEventListener(events.mousedown, function(e) {
      //Disable text selection when moving slide with mouse control
      if (!isTouchable) e.preventDefault();
      if (isInTransit) return;

      start = isTouchable ? e.touches[0].pageX : e.pageX;
    });

    slider.addEventListener(events.mousemove, function(e) {
      if (!start || isInTransit) return;

      let pageX = isTouchable ? e.touches[0].pageX : e.pageX;

      diff = pageX - start;

      if (diff == 0) return;

      if (timerId) clearTimeout(timerId);

      direction = diff < 0 ? 1 : -1;
      //If it's the first slide and right swipe detected, so add the last slide to the start
      if (direction == -1 && currentIndex == 0) addLastToStart();
      //If it's the last slide and left swipe detected, so add the first slide
      if (direction == 1 && currentIndex == allSlides.length - 1) addFirstToEnd();
      //Move slide with mousepointer
      moveSlider(diff);

      //Emulate mouseout behaviour
      if (isTouchable) {
        let pageY = e.touches[0].pageY;


        if (pageX < slideRect.x ||
          pageX > slideRect.right ||
          pageY < slideRect.y ||
          pageY > slideRect.bottom) {

          handleMove();
        }
      }
    });

    screen.addEventListener('transitionend', function(e) {
      isInTransit = false;
      //If autoplay is true, schedule to change slide
      if (autoplay) {

        if (timerId) clearTimeout(timerId);

        timerId = setTimeout(() => {
          direction = 1;
          let index = getNewIndex(direction);

          if (index == 0) {
            addFirstToEnd();
            moveSlider(0);
          }
          //Set a small time gap between two transition states
          setTimeout(showNextSlide, 50, index);
        }, playInterval)
      };

      if (currentIndex < allSlides.length - 1 && currentIndex > 0) return;
      //If order property of last or first slide was changed, so take it back 
      let x = -currentIndex * 100 + '%';

      allSlides[allSlides.length - 1].style.order = '';
      allSlides[0].style.order = '';
      screen.style.transition = 'none';
      screen.style.transform = `translate(${x})`;

      offset = 0;
    });
    //Change slide with mouse control or touchmove
    slider.addEventListener(events.mouseup, handleMove);
    slider.addEventListener('mouseout', handleMove);
    //Kickoff first slide in case of autoplay
    if (autoplay) {
      timerId = setTimeout(showNextSlide, playInterval, 1);
    }

    window.addEventListener('resize', function() {
      //Is it really resizing or just horizont scrolling
      if (window.innerWidth == oldWidth) return;

      oldWidth = window.innerWidth;

      slideRect = getSlideRect();
    })
  }
}

export { Slider as default };