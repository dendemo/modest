import Smoothscroll from 'smoothscroll-polyfill';
import Nav from './nav';
import ScrollThis from './scrollThis';
import Slider from './slider';
import AddOnScroll from './addOnScroll';
import waitFor from './waitFor';

//Kickoff the polyfill
Smoothscroll.polyfill();

const menu = document.querySelector('.nav');

const breakpoints = {
  tablet: 768,
  desktop: 1280
}

const nav = new Nav({
  toggleBtnClass: 'menu-toggle',
  actionClass: 'parent_is-menu-visible',
  menu: menu,
  iSpreventDefaulted: true,
  breakPoint: breakpoints.desktop
});

const scrollThis = new ScrollThis({
  menu: menu,
  linkClass: 'nav__link',
  linkActiveClass: 'nav__link_active',
  breakpoint: breakpoints.desktop
});

const slider = new Slider({
  slider: document.querySelector('.slider'),
  screen: document.querySelector('.slider__page'),
  slideClass: 'slider__item',
  controlContainer: document.querySelector('.slider__control-container'),
  controlClass: 'slider__control',
  autoplay: true,
  playInterval: 10000
});

const addOnScroll = new AddOnScroll({
  actionClass: 'parent_is-scrolled',
  actionElement: document.querySelector('.parent'),
  threshold: 80
});

const logo = document.querySelector('.logo'),
  navList = document.querySelector('.nav__list'),
  header = document.querySelector('.header');

let isLogoRemoved = false;

function replaceLogo(where, from) {
  if (window.innerWidth >= breakpoints.desktop) {
    if (isLogoRemoved) return;

    where.before(logo);
    isLogoRemoved = true;

    return;
  }

  if (!isLogoRemoved) return;

  from.prepend(logo);
  isLogoRemoved = false;
}

window.addEventListener('resize', () => replaceLogo(navList, header));

waitFor({
  assets: document.querySelectorAll('img'),
  callback: [nav.init, scrollThis.init]
});

slider.init();
addOnScroll.init();
replaceLogo(navList, header);