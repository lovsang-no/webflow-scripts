console.log("song.component.js running");

const initSongComponent = () => {
  // CSS
  const ComponentCSS = () => {
    const styleTag = document.createElement("style");
    const ComponentCSS = `
      .dm-sp-dd-lst {
        display:block;
      }
      .hide {
        display: none;
      }
    `;

    styleTag.innerHTML = ComponentCSS;

    return styleTag;
  };
  document.head.appendChild(ComponentCSS());

  // Utils
  const handleClickOutsideElement = (element, onClickOutside) => {
    // source (2021-07-09): https://stackoverflow.com/questions/152975/how-do-i-detect-a-click-outside-an-element
    const outsideClickListener = (event) => {
      if (!element.contains(event.target) && isVisible(element)) {
        // or use: event.target.closest(selector) === null
        if (onClickOutside) onClickOutside();
        removeClickListener();
      }
    };

    const removeClickListener = () => {
      document.removeEventListener("click", outsideClickListener);
    };

    document.addEventListener("click", outsideClickListener);
  };

  const isVisible = (elem) =>
    !!elem &&
    !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length); // source (2018-03-11): https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js

  /**
   * Method for creating element of
   * @param {string} type
   * @param  {...string} classes
   * @returns
   */
  const E = (type, ...classes) => {
    const Element = document.createElement(type);
    for (const c of classes) {
      Element.classList.add(c);
    }
    return Element;
  };

  const ButtonE = ({ text }) => {
    const Button = E("button", "dm-button");
    Button.innerHTML = text ?? "";
    return { DOMElement: Button };
  };

  const DropdownMenuE = ({
    triggerText,
    items = [{ text: "", onClick: undefined }],
    openMenuOnHover = false,
  }) => {
    // Utils
    let isOpen = false;
    let timeout;

    const DropdownMenu = E("div");

    // Content
    const DropdownMenuContentE = E("div", "dm-sp-dd-lst", "hide");
    const DropdownMenuListE = E("div", "dm-sp-dd-list-items");
    DropdownMenuContentE.appendChild(DropdownMenuListE);

    items.forEach((item) => {
      console.log(item);
      const DropdownMenuListItemE = E("div", "dm-sp-dd-list-item");
      DropdownMenuListItemE.innerHTML = item.text ?? "";
      if (item.onClick)
        DropdownMenuListItemE.addEventListener("click", item.onClick);

      DropdownMenuListE.appendChild(DropdownMenuListItemE);
    });

    // Handle state
    const closeMenu = () => {
      DropdownMenuContentE.classList.add("hide");
      isOpen = false;
    };

    const openMenu = () => {
      DropdownMenuContentE.classList.remove("hide");
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(
        () => handleClickOutsideElement(DropdownMenuContentE, closeMenu),
        10
      );
      isOpen = true;
    };

    // Trigger
    const DropdownMenuTrigger = ButtonE({
      text: triggerText,
    });

    const DropdownMenuTriggerE = DropdownMenuTrigger.DOMElement;

    DropdownMenuTriggerE.addEventListener("click", () => {
      if (!isOpen) openMenu();
    });

    DropdownMenu.appendChild(DropdownMenuTriggerE);
    DropdownMenu.appendChild(DropdownMenuContentE);

    return { DOMElement: DropdownMenu };
  };

  const SongControlsE = () => {
    const SongControls = E("div");

    const TransposeDropdown = DropdownMenuE({
      triggerText: "Transponering",
      items: [
        { text: "Skriv ut" },
        { text: "Kopier ChordPro" },
        { text: "Last ned ChordPro" },
      ],
      openMenuOnHover: true,
    });
    SongControls.appendChild(TransposeDropdown.DOMElement);

    return { DOMElement: SongControls };
  };

  const SongComponentE = () => {
    const SongComponent = E("div");

    const SongControls = SongControlsE();

    SongComponent.appendChild(SongControls.DOMElement);

    return { DOMElement: SongComponent };
  };

  return SongComponentE().DOMElement;
};

document.querySelectorAll("Song").forEach((e) => {
  e.innerHTML = "";
  e.appendChild(initSongComponent());
});
