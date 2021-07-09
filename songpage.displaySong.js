const initializeSongPage = (songTemplate) => {
  const chartWrapper = document.getElementById("js-chart-wrapper");
  const chartOpenButton = document.getElementById("js-chart-fullscreen-open");
  const chartCloseButton = document.getElementById("js-chart-fullscreen-close");
  const chartNormalSettingsWrapper = document.getElementById(
    "js-cart-normal-settings"
  );
  const chartFullScreenSettingsWrapper = document.getElementById(
    "js-cart-fullscreen-settings"
  );

  let fullScreenChartOpen = false;

  const fullScreenChartCallback = () => {
    if (fullScreenChartOpen) {
      chartWrapper.classList.add("open");
      chartNormalSettingsWrapper.classList.add("hide");
      chartFullScreenSettingsWrapper.classList.remove("hide");
    } else {
      chartWrapper.classList.remove("open");
      chartNormalSettingsWrapper.classList.remove("hide");
      chartFullScreenSettingsWrapper.classList.add("hide");
    }
  };

  chartOpenButton.addEventListener("click", () => {
    fullScreenChartOpen = true;
    fullScreenChartCallback();
  });
  chartCloseButton.addEventListener("click", () => {
    fullScreenChartOpen = false;
    fullScreenChartCallback();
  });

  fullScreenChartCallback();

  const readTextFile = (file) => {
    const rawFile = new XMLHttpRequest();
    let allText = "Problem ved lasting av fil, prøv annen nettleser";
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          allText = rawFile.responseText;
        }
      }
    };
    rawFile.send(null);
    return allText;
  };

  const text = songTemplate ? readTextFile(songTemplate) : "";

  const getCopyrightObject = (songObject) => {
    let album;
    let published;
    let web;
    let copyright;

    for (let [key, value] of songObject.metadata.extra.entries()) {
      console.log(key, value);
      switch ((key || "").toUpperCase()) {
        case "ALBUM":
          album = value;
          break;
        case "PUBLISHED":
          published = value;
          break;
        case "WEB":
          web = value;
          break;
        case "COPYRIGHT":
          copyright = value;
          break;
      }
    }

    return {
      album,
      published,
      web,
      copyright,
      complete: copyright && published && album,
    };
  };

  const displayCopyrightPart = (songObject) => {
    const copyrightBuffer = [];

    const copyrightObject = getCopyrightObject(songObject);

    if (!copyrightObject.complete) return;

    if (copyrightObject.published && copyrightObject.copyright) {
      copyrightBuffer.push(
        lang.copyright.main
          .replaceAll(PUBLISH_YEAR, copyrightObject.published)
          .replaceAll(COPYRIGHT, copyrightObject.copyright)
          .replaceAll(SONG_TITLE, songObject.metadata.title)
          .replaceAll(
            ARTIST_NAME,
            songObject.metadata.artist.trim().endsWith("s")
              ? songObject.metadata.artist.trim()
              : songObject.metadata.artist.trim() + "s"
          )
          .replaceAll(
            ALBUM_NAME,
            copyrightObject.album
              ? copyrightObject.album
              : songObject.metadata.title
          )
          .replaceAll(ALBUM, copyrightObject.album ? ALBUM : "singel")
          .replaceAll("\n", "</br>")
      );
    }
    /*if (copyrightObject.web) {
      copyrightBuffer.push('</br>');
      copyrightBuffer.push(lang.copyright.moreInfo.replaceAll(WEB_PAGE, copyrightObject.web));
    }*/

    return copyrightBuffer.join("\n").wrapHTML("DIV", "cp-copyright-wrapper");
  };

  const target = document.getElementById("cp-target");
  const cpPrintTarget = document.getElementById("print-target");

  const song = newSongObjectFromTemplate(text);

  const callback = () => {
    target.innerHTML = songObjectToHtmlTable(song);
    target.innerHTML += displayCopyrightPart(song) ?? "";

    cpPrintTarget.innerHTML = songObjectToHtmlTable(song);
    cpPrintTarget.innerHTML += displayCopyrightPart(song) ?? "";
  };

  song.setRenderCallback(callback);

  const noColumns = () => {
    target.classList.remove("cp-two-columns");
    target.classList.remove("cp-three-columns");
  };

  const twoColumns = () => {
    target.classList.remove("cp-three-columns");
    setTimeout(() => {
      target.classList.add("cp-two-columns");
    }, 5);
  };

  const threeColumns = () => {
    target.classList.remove("cp-two-columns");
    setTimeout(() => {
      target.classList.add("cp-three-columns");
    }, 5);
  };

  /* Regular view */
  document.querySelector("#one-column").onclick = noColumns;
  document.querySelector("#two-columns").onclick = twoColumns;
  document.querySelector("#chords").onclick = () => {
    song.displayChords();
  };
  document.querySelector("#lyrics").onclick = () => {
    song.displayLyrics();
  };
  document.querySelector("#nashville").onclick = () => {
    song.displayNashville();
  };
  document.querySelector("#transpose-down").onclick = () => {
    song.transposeDown();
  };
  document.querySelector("#transpose-up").onclick = () => {
    song.transposeUp();
  };
  document.querySelector("#transpose-reset").onclick = () => {
    song.transposeReset();
  };
  /* Full screen */
  document
    .getElementById("js-chart-fullscreen-open")
    .addEventListener("click", () => {
      document.body.style.overflow = "hidden";
    });
  document
    .getElementById("js-chart-fullscreen-close")
    .addEventListener("click", () => {
      document.body.style.overflow = "auto";
    });

  document.querySelector("#fs-one-column").onclick = noColumns;
  document.querySelector("#fs-two-columns").onclick = twoColumns;
  document.querySelector("#fs-three-columns").onclick = threeColumns;
  document.querySelector("#fs-chords").onclick = () => {
    song.displayChords();
  };
  document.querySelector("#fs-lyrics").onclick = () => {
    song.displayLyrics();
  };
  document.querySelector("#fs-nashville").onclick = () => {
    song.displayNashville();
  };
  document.querySelector("#fs-transpose-down").onclick = () => {
    song.transposeDown();
  };
  document.querySelector("#fs-transpose-up").onclick = () => {
    song.transposeUp();
  };
  document.querySelector("#fs-transpose-reset").onclick = () => {
    song.transposeReset();
  };

  /* S H A R E  -  E X P O R T */

  /* Print */
  const printSong = () => window.print();

  document
    .querySelectorAll(".js-print-chart")
    .forEach((e) => (e.onclick = printSong));

  /* Copy link */
  const getSongLinkWithQuery = () => {
    const transpose = song?.transposeWrapper?.transposeStep;
    const mode = song?.displayType?.type;
    const useH = song?.displayType?.useH;

    var queryParams = new URLSearchParams(window.location.search);
    if (mode) queryParams.set("m", mode);
    else if (queryParams.has("m")) queryParams.delete("m");

    if (transpose) queryParams.set("t", transpose);
    else if (queryParams.has("t")) queryParams.delete("t");

    if (useH !== undefined) queryParams.set("h", useH);
    else if (queryParams.has("h")) queryParams.delete("h");
    return "" + window.location.toString() + "?" + queryParams.toString();
  };

  const copySongLinkWithQuery = () => {
    const copyText = document.createElement("input");
    document.body.appendChild(copyText);
    copyText.style.display = "block";
    copyText.value = getSongLinkWithQuery();
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    copyText.style.display = "none";

    copyText.parentNode.removeChild(copyText);
  };

  document.querySelectorAll(".js-copy-query-link").forEach(
    (e) =>
      (e.onclick = () => {
        copySongLinkWithQuery();
        e.innerHTML = "<div>Kopiert!</div>";
      })
  );

  /* Open in OnSong */

  const isIos =
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);

  const handleOpenInOnSongButtonClick = () => {
    const chordPro = songObjectToChordPro(song, false, false, true, [
      "COPYRIGHT",
    ]);

    const base64 = btoa(chordPro);

    const openInOnSongUrl =
      "onsong://ImportData/" +
      chordPro.split("\n")[0].trim().replace(" ", "%20") +
      ".onsong?" +
      base64;
    window.location = openInOnSongUrl;
  };

  document.querySelectorAll(".js-open-in-onsong").forEach((e) => {
    if (isIos) {
      e.onclick = handleOpenInOnSongButtonClick;
    } else {
      e.style.display = "none";
    }
  });

  /* Copy ChordPro */
  const getChordProString = () =>
    songObjectToChordPro(song, true, false, true, ["COPYRIGHT"]);

  const copyChordPro = () => {
    const copyText = document.createElement("input");
    document.body.appendChild(copyText);
    copyText.style.display = "block";
    copyText.value = getChordProString();
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    copyText.style.display = "none";
    copyText.parentNode.removeChild(copyText);
  };

  document.querySelectorAll(".js-copy-chordpro").forEach(
    (e) =>
      (e.onclick = () => {
        copyChordPro();
        e.innerHTML = "<div>Kopiert!</div>";
      })
  );

  /* Download ChordPro */
  const generateFilename = (noHash = false) =>
    (song.metadata.title ?? "") +
    " - " +
    (song.metadata.artist ?? "") +
    " (" +
    (noHash
      ? (song.transposeLogic.getDisplayKey() ?? "").replace("#", "iss")
      : song.transposeLogic.getDisplayKey() ?? "") +
    ")";

  const saveChordPro = () => {
    const chordPro = getChordProString() || "";
    const blob = new Blob([chordPro], { type: "text/plain" });
    const filename = generateFilename() + ".txt";

    const link = document.createElement("a");
    link.download = filename;
    link.innerHTML = "Download File";
    if (window.webkitURL !== null) {
      // Chrome allows the link to be clicked without actually adding it to the DOM.
      link.href = window.webkitURL.createObjectURL(blob);
    } else {
      // Firefox requires the link to be added to the DOM before it can be clicked.
      link.href = window.URL.createObjectURL(blob);
      link.onclick = destroyClickedElement;
      link.style.display = "none";
      document.body.appendChild(link);
    }
    link.click();
  };

  document
    .querySelectorAll(".js-download-chordpro")
    .forEach((e) => (e.onclick = saveChordPro));

  /* U T I L S  */

  /* Apply song query */
  const fetchAndApplySongQuery = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    console.log(params);
    if (params["m"])
      switch (params["m"]) {
        case DISPLAY_CHORDS:
          song.displayChords();
          break;
        case DISPLAY_LYRICS:
          song.displayLyrics();
          break;
        case DISPLAY_NASHVILLE:
          song.displayNashville();
          break;
      }
  };
};
