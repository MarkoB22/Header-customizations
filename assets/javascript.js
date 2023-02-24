class Header extends HTMLElement {
  constructor() {
    super();
    this.element = this;
    this.delegateElement = new Delegate(this.element);
    this.options = JSON.parse(this.getAttribute("data-settings"));
    this.carousel = this.element.querySelectorAll(".MenuSlideshow");
    var selectBoxes = this.element.querySelectorAll(".RevolutionDropdown");
    if (selectBoxes.length > 0) {
      selectBoxes.forEach((item, i) => {
        new RevolutionSelectbox(item);
      }); 
    }

    this.domHelper = new DomHelper();

    if (this.options.sticky) {
      this.toggleSticky();
    }
    this.bindEvents();
    this.menuOverlapHandler();

  }

  menuOverlapHandler() {
    var currentClientWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );

    var menuItems = this.element.querySelector(".Header--MenuItems"),
      overlapping = false,
      menuWrapper = this.element.querySelector(".HeaderWrapper"),
      allHeights = [],
      _this = this;
    if (menuItems) {
      var desiredHeight = _this.element.querySelectorAll(".mainLinks");
      desiredHeight.forEach((item, i) => {
        allHeights.push(item.offsetHeight);
      });
      var maxHeight = Math.max.apply(null, allHeights);
      var minHeight = Math.min.apply(null, allHeights);
      if (maxHeight > minHeight) {
        overlapping = true;
        if (
          window.theme.menuBreakpoint == 0 ||
          window.theme.menuBreakpoint == undefined
        ) {
          window.theme.menuBreakpoint = currentClientWidth;
        }
      }
    }
    if (currentClientWidth > window.theme.menuBreakpoint) {
      menuItems.classList.remove("mt-m");
      menuItems.classList.remove("flexWrap");
      menuWrapper.querySelector(".mainMenuItems").prepend(menuItems);
      window.theme.menuBreakpoint = 0;
    } else if (overlapping) {
      menuItems.classList.add("mt-m");
      menuItems.classList.add("flexWrap");
      menuItems.closest(".header").appendChild(menuItems);
    }
    document.documentElement.style.setProperty(
      "--header-height",
      _this.element.clientHeight + "px"
    );
  }

  toggleSticky() {
    this.element.parentElement.classList.add("Header--Sticky");
    this.element.parentElement.classList.remove("Header--Transparent");
  }

  bindEvents() {
    const _this = this;
    document.addEventListener("shopify:section:load", function() {
      _this.menuOverlapHandlerListener();
    });
    window.addEventListener("resize", this.menuOverlapHandlerListener);
    this.toggleColorListener = this.toggleColor.bind(this);
    this.menuOverlapHandlerListener = this.menuOverlapHandler.bind(this);
    window.addEventListener("scroll", this.toggleColorListener);

    this.delegateElement.on(
      "mouseenter",
      "[aria-hasMenu='true']",
      this.openMenu.bind(this), true
    );

    this.delegateElement.on(
      "focusin",
      "[aria-hasMenu='true']",
      this.openMenu.bind(this), true
    );

    this.delegateElement.on(
      "mouseleave",
      "[aria-submenu]",
      this.closeMenu.bind(this), true
    );

    this.delegateElement.on(
      "mouseenter",
      "[aria-singlemenu]",
      this.closeMenu.bind(this), true
    );

    this.delegateElement.on(
      "focusin",
      "[aria-singleMenu], .mainLinks",
      this.closeMenu.bind(this), true
    );

    this.delegateElement.on(
      "mouseenter",
      ".mainMenu--MultipleItems_subLink",
      this.showImage.bind(this), true
    );
  }

  openMenu(event, target) {
    
    this.element.dispatchEvent(
      new CustomEvent("menu:open", { bubbles: true })
    );

    if (event.type === "mouseenter" && target !== event.target) {return;}

    this.element.classList.add("Header--BigWhite");
    target.setAttribute("aria-expanded", "true");

    this.domHelper
      .getSiblings(target, '[aria-expanded="true"]')
      .forEach(function (item) {
        item.setAttribute("aria-expanded", "false");
      });
      
      bodyScrollLock.disableBodyScroll(
        this.element.querySelector("[data-scrollable]"), bodyScrollLockOptions
        );
  }

  closeMenu(event, target) {

    if (event.type === "mouseleave" && target !== event.target){return;}
    if (this.options["transparent"]) {
      this.element.classList.remove("Header--BigWhite");
    }

    const allOpen = this.element.querySelectorAll('[aria-expanded="true"]');
    allOpen.forEach(function (item) {
        item.setAttribute("aria-expanded", "false");
    });
    this.toggleColor();
    bodyScrollLock.clearAllBodyScrollLocks();
  }

  toggleColor() {
    if (this.options.transparent) {
      if (window.pageYOffset >= 25 && this.options.sticky) {
        this.element.classList.remove("Header--Transparent");
      } else {
        this.element.classList.add("Header--Transparent");
      }
    }
  }

  showImage(event) {
    const key = event.target.dataset.image;
    const image = this.element.querySelector(`#${key}`);
    if (!image) {
      return;
    }
    const images = this.element.querySelector('.megaMenu--showImage');
    if (images) {
      images.classList.remove('megaMenu--showImage');
    }
    image.classList.add('megaMenu--showImage');
  }
}
customElements.define("header-component", Header);