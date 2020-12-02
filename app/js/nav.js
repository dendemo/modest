function Nav({
  menu,
  toggleBtnClass,
  actionClass,
  iSpreventDefaulted = false, 
  breakPoint
}) {

  let event = ('ontouchstart' in window ? 'touchend' : 'click'),
    isMenuClosed = true,
    body = document.body,
    currentOffsetY,
    linkContentEntries = new Map();

  function closeMenu() {
    unfreezeBody();

    body.classList.remove(actionClass);
    isMenuClosed = true;
  }

  function openMenu() {
    freezeBody();

    body.classList.add(actionClass);
    isMenuClosed = false;
  }

  function toggleMenu() {
    if (isMenuClosed) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  function freezeBody() {
    currentOffsetY = window.pageYOffset;

    body.style.position = 'fixed';
    body.style.top = `-${currentOffsetY}px`;
    body.style.left = 0;
    body.style.right =0;
  }

  function unfreezeBody() {
    body.style.position = '';
    window.scrollTo(0, currentOffsetY);
  }

  this.init = function() {

    body.addEventListener(event, function(e) {
      let target = e.target;
      //If toggleBtn is clicked, then toggle menu
      if (target.closest(`.${toggleBtnClass}`)) {

        toggleMenu();

        e.stopPropagation();
        return;
      }
      //If menu is closed and it's not a toggleButton, then do nothing
      if (isMenuClosed) return;
      //If menu is opened and clicked, and it's not a link, then ignore it too
      if (menu.contains(target) && !target.closest('a')) return; 
      //If it's a link then check preventDefault argument
      if (iSpreventDefaulted) e.preventDefault();

      closeMenu();
    })

    window.addEventListener('resize', function(e) {
      if (!isMenuClosed && window.innerWidth >= breakPoint) closeMenu();
    })
  }
}

export { Nav as default };