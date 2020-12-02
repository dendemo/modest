function AddOnScroll({
  actionClass,
  actionElement,
  threshold
}) {
  let flag = false;

  function addClass() {
    actionElement.classList.add(actionClass);
    flag = true;
  }

  function removeClass() {
    actionElement.classList.remove(actionClass);
    flag = false;
  }

  function chooseState() {
    let offset = window.pageYOffset;

    if (offset >= threshold && !flag) {
      addClass();
      return;
    }

    if (offset < threshold && flag) removeClass();    
  }

  this.init = function() {
    chooseState();

    window.addEventListener('scroll', chooseState);
  }

  window.addEventListener('resize', chooseState);
}

export { AddOnScroll as default };