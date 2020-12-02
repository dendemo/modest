function ScrollThis({
  menu,
  linkClass,
  linkActiveClass,
  breakpoint
}) {

  let offsetY,
    centerY,
    currentActiveLink,
    topmostLink,
    menuHeight,
    isThrottled = false,
    event = ('ontouchstart' in window ? 'touchend' : 'click'),
    linkContentEntries = new Map();

  function setMenuHeight() {
    if (window.innerWidth >= breakpoint) {
      menuHeight = menu.offsetHeight;
      return;
    }

    menuHeight = 0;
    return;
  }

  function getIdFromHref(elem) {
    let href = elem.getAttribute('href');

    if (!href.startsWith('#')) return false;

    return href.slice(1);
  }

  function getContentBorders(content) {
    //If it's already calculated, there is no need to do it again
    if (!offsetY) offsetY = window.pageYOffset;

    let rect = content.getBoundingClientRect();

    return {
      top: rect.top + offsetY,
      bottom: rect.bottom + offsetY
    }
  }

  function listLinksContent() {
    let links = menu.querySelectorAll(`.${linkClass}`),
      i,
      j;

    for (let link of links) {

      let id = getIdFromHref(link);

      if (!id) continue;

      let content = document.getElementById(id),
        contentBorders = getContentBorders(content);
      //Find and save a link of the topmost content 
      if (!i || contentBorders.top < j) {
        i = link;
        j = contentBorders.top;
      }
      //Save all entries
      linkContentEntries.set(link, {
        'content': content,
        'contentBorders': contentBorders
      });
    }
    //Save topmost link out of scope
    topmostLink = i;
  }

  function getLinkFromPoint() {
    let offsetY = window.pageYOffset;
    //If it's start position, the very fisrt content should be highlighted whether it's at the center or not
    if (!offsetY) return topmostLink;
    //If centerY is already calculated, just get it and find currentCenter taking into account scrolling
    if (!centerY) centerY = window.innerHeight / 2;
    let currentCenterY = offsetY + centerY;
    //Find content that is in the center and return its link
    for (let entry of linkContentEntries) {
      let contentBorders = entry[1].contentBorders;

      if (contentBorders.top <= currentCenterY && contentBorders.bottom >= currentCenterY) return entry[0];
    }
  }

  function highlightLink() {
    if (document.body.style.position == 'fixed') return;

    let link = getLinkFromPoint();
    //If it's the same content or there is no any content at the point, so do nothing
    if (link == currentActiveLink || !link) return;

    if (currentActiveLink) currentActiveLink.classList.remove(linkActiveClass);

    link.classList.add(linkActiveClass);
    currentActiveLink = link;
  }
  //Function to decrease event frequency
  function throttleThis(func, ms) {
    if (isThrottled) return;

    func();
    isThrottled = true;

    setTimeout(() => {
      func();
      isThrottled = false;
    }, ms);
  }

  this.init = function() {
    listLinksContent();
    highlightLink();
    setMenuHeight();

    window.addEventListener('scroll', function(e) {
      //To prevent the topmost link from being highlighted
      throttleThis(highlightLink, 100);

    });

    menu.addEventListener(event, function(e) {
      let link = e.target.closest(`.${linkClass}`);

      if (!link) return;

      e.preventDefault();
      //Set time gap to get right offsetY after body unfrozen
      setTimeout(function() {
        let contentObj = linkContentEntries.get(link);

        let content = contentObj.content;

        // content.scrollIntoView({ behavior: 'smooth' });

        window.scrollTo({
          top: content.offsetTop - menuHeight,
          behavior: 'smooth'
        })
      }, 100)
    });
  }

  window.addEventListener('resize', () => {
    offsetY = centerY = null;
    
    setMenuHeight();
    listLinksContent();
    highlightLink();
  })
}

export { ScrollThis as default };