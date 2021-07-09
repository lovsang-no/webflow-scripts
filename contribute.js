// TODO: Should be removed!
const getCopyrightObject = (songObject) => {
  let album;
  let published;
  let web;
  let copyright;

  for (let [key, value] of songObject.metadata.extra.entries()) {
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

  if (songObject.metadata.album) album = songObject.metadata.album;
  if (songObject.metadata.copyright) copyright = songObject.metadata.copyright;
  if (songObject.metadata.published) published = songObject.metadata.published;

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

const initializeContributeForm = () => {
  /* Helpers */
  const TEXT = "TEXT";
  const TEXTAREA = "TEXTAREA";
  const DATE = "DATE";
  const RADIO = "RADIO";
  const NUMBER = "NUMBER";
  const MULTIPLE_CHOISE = "MULTIPLE_CHOISE";

  const removeHash = (url) => url.split("?")[0];

  /* State */
  const statePers = [
    {
      artist: {
        name: "",
        about: "",
        location: "",
        church: "",
        connectedArtists: "",
        linkAppleMusic: "",
        linkSpotify: "",
        linkYouTube: "",
        linkVimeo: "",
        linkFacebook: "",
        linkInstagram: "",
        linkWebpage: "",
      },
      album: {
        title: "",
        type: "",
        artist: "",
        releaseDate: "",
        producers: "",
        label: "",
        linkTracks: "",
        linkAppleMusic: "",
        linkSpotify: "",
      },
      currentSong: null,
      songs: [],
    },
  ];

  const getState = () => statePers[0];
  const setState = (state) => (statePers[0] = state);

  let autosaveTimeout;
  let autosaveTimeoutMs = 5000;

  const saveStateToLocalStorage = () => {
    localStorage.setItem("contribute-form-state", JSON.stringify(getState()));
  };

  const deleteLocalStorageState = () => {
    localStorage.removeItem("contribute-form-state");
  };

  const retrieveStateFromLocalStorage = () => {
    const item = localStorage.getItem("contribute-form-state");
    if (!item) return;
    setState(JSON.parse(item));
  };

  const clearState = () => {
    setState({
      artist: {
        name: "",
        location: "",
        church: "",
        connectedArtists: "",
        linkAppleMusic: "",
        linkSpotify: "",
        linkYouTube: "",
        linkVimeo: "",
        linkFacebook: "",
        linkInstagram: "",
        linkWebpage: "",
      },
      album: {
        title: "",
        artist: "",
        releaseDate: "",
        producers: "",
        label: "",
        linkTracks: "",
        linkAppleMusic: "",
        linkSpotify: "",
      },
      currentSong: null,
      songs: [],
    });
  };

  retrieveStateFromLocalStorage();

  const artistStateToCSVString = () => {
    const headings =
      "Navn," +
      "Slug," +
      "Tilhørighet," +
      "Egen nettside med ressurser," +
      "Eventuel beskrivelse av artist," +
      "Facebook," +
      "Instagram," +
      "iTunes / Apple Music," +
      "YouTube," +
      "Vimeo," +
      "Spotify," +
      "Tilknyttet artist," +
      "Sted,";

    const row = [];
    const a = getState().artist;
    row.push(a.name); // "Navn," +
    row.push(a.name.toLowerCase().replace(/ +/g, "-")); // "Slug," +
    row.push(a.church); // "Tilhørighet," +
    row.push(a.linkWebpage); // "Egen nettside med ressurser," +
    row.push(a.about); // "Eventuel beskrivelse av artist," +
    row.push(removeHash(a.linkFacebook)); // "Facebook," +
    row.push(removeHash(a.linkInstagram)); // "Instagram," +
    row.push(removeHash(a.linkAppleMusic)); // "iTunes / Apple Music," +
    row.push(removeHash(a.linkYouTube)); // "YouTube," +
    row.push(removeHash(a.linkVimeo)); // "Vimeo," +
    row.push(removeHash(a.linkSpotify)); // "Spotify," +
    row.push(removeHash(a.connectedArtists)); // "Tilknyttet artist," +
    row.push(removeHash(a.location)); // "Sted,"

    return headings + "\n" + row.join(",");
  };

  const albumStateToCSVString = () => {
    const headings =
      "Albumtittel - Artist," +
      "Slug," +
      "Albumtittel," +
      "Artist(er) - tekst," +
      "Utgivelsesdato," +
      "Produsent(er)," +
      "Ansvarlig utgiver," +
      "Tracks," +
      "Link til album på iTunes," +
      "Digital booklet," +
      "Spotify";

    const row = [];
    const a = getState().album;
    row.push(a.title + " - " + a.artist); // "Albumtittel - Artist," +
    row.push((a.title + " " + a.artist).toLowerCase().replace(/ +/g, "-")); // "Slug," +
    row.push(a.title); // "Albumtittel," +
    row.push(a.artist); // "Artist(er) - tekst," +
    row.push(a.releaseDate); // "Utgivelsesdato," +
    row.push(a.producers); // "Produsent(er)," +
    row.push(a.label); // "Ansvarlig utgiver," +
    row.push(removeHash(a.linkTracks)); // "Tracks," +
    row.push(removeHash(a.linkAppleMusic)); // "Link til album på iTunes," +
    row.push(removeHash(a.linkSpotify)); // "Spotify";

    return headings + "\n" + row.join(",");
  };

  const songsStateToCSVString = () => {
    const headings =
      "Sangtittel - Artist," +
      "Slug," +
      "Sangtittel," +
      "Artist(er) - tekst," +
      "Album," +
      "Utgivelsesdato," +
      "Type sang," +
      "Sangnummer," +
      "Tema," +
      "Om sangen," +
      "Anbefalte tonearter," +
      "Bibelreferanse(r)," +
      "Låtskrivere," +
      "Produsenter," +
      "Bidragsytere (tekst)," +
      "Link: Spotify," +
      "Link: Spotify II," +
      "iTunes / Apple Music," +
      "Original toneart," +
      "Tempo," +
      "Taktart," +
      "ChordPro-fil," +
      "Dagens refreng,";

    const rows = [];

    const artist = getState().artist;
    const album = getState().album;

    getState().songs.forEach((s) => {
      const row = [];
      row.push(s.title + " - " + s.artist); // "Sangtittel - Artist," +
      row.push((s.title + " " + s.artist).toLowerCase().replaceAll(/ +/g, "-")); // "Slug," +
      row.push(s.title); // "Sangtittel," +
      row.push(s.artist); // "Artist(er) - tekst," +
      row.push(album.title); // "Album," +
      row.push(album.releaseDate); // "Utgivelsesdato," +
      row.push(s.songType); // "Type sang," +
      row.push(s.songNumber); // "Sangnummer," +
      row.push(s.themes.join("-")); // "Tema," + // TODO: Implement themes
      row.push(s.aboutSong); // "Om sangen," +
      row.push(s.recommendedKeys); // "Anbefalte tonearter," +
      row.push(s.scripture); // "Bibelreferanse(r)," +
      row.push(s.writers); // "Låtskrivere," +
      row.push(s.producers); // "Produsenter," +
      row.push(s.contributors); // "Bidragsytere (tekst)," +
      row.push(removeHash(s.linkSpotify)); // "Link: Spotify," +
      row.push(removeHash(s.linkSpotify)); // "Link: Spotify II," +
      row.push(removeHash(s.linkAppleMusic)); // "iTunes / Apple Music," +
      row.push(s.chart.key); // "Original toneart," +
      row.push(s.chart.tempo); // "Tempo," +
      row.push(s.chart.time); // "Taktart," +
      row.push(s.chart.chordProSum.replaceAll("\n", "{(--)}")); // "ChordPro-fil," +
      row.push(""); // "Dagens refreng," + // TODO: implement

      rows.push(row.join(","));
    });

    console.log("\n" + rows.join(","));
    return headings + "\n" + rows.join(",");
  };

  const setWebflowFormValues = () => {
    const SubmissionId = document.getElementById("submission-id");
    const ArtistCsv = document.getElementById("artist-csv");
    const AlbumCsv = document.getElementById("album-csv");
    const SongsCsv = document.getElementById("songs-csv");

    if (!SubmissionId || !ArtistCsv || !AlbumCsv || !SongsCsv)
      alert(
        "Det skjedde en feil under innsendingen. Ta kontakt med sanger@lovsang.no."
      );

    SubmissionId.value =
      Date.now().valueOf() + getState().album.title.replace(/ +/g, "-");

    ArtistCsv.value = artistStateToCSVString();
    AlbumCsv.value = albumStateToCSVString();
    SongsCsv.value = songsStateToCSVString();
  };

  const updateOriginalChartCount = () => {
    const elements = document.querySelectorAll(
      ".js-contribute-form-original-chart"
    );

    elements.forEach((e, index) => {
      if (index > getState().songs.length - 1) {
        e.classList.add("hide");
      } else {
        e.classList.remove("hide");
      }
    });
  };

  const Element = (elementType, ...classes) => {
    const DOMElement = document.createElement(elementType);
    for (const c of classes) DOMElement.classList.add(c);
    return DOMElement;
  };

  const InputWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    required,
  }) => {
    const Wrapper = Element("div");

    const Label = Element("label", "dm-form__label");
    Label.setAttribute("for", id);
    Label.innerHTML = labelText + (required ? " *" : "");

    const Input = Element("input", "dm-form__input-field");
    Input.id = id;
    Input.name = name;
    Input.required = required ?? false;

    Wrapper.appendChild(Label);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    Wrapper.appendChild(Input);

    return Wrapper;
  };

  const NumberInputWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    required,
  }) => {
    const Wrapper = Element("div");

    const Label = Element("label", "dm-form__label");
    Label.setAttribute("for", id);
    Label.innerHTML = labelText + (required ? " *" : "");

    const Input = Element("input", "dm-form__input-field");
    Input.type = "number";
    Input.id = id;
    Input.name = name;
    Input.required = required ?? false;

    Wrapper.appendChild(Label);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    Wrapper.appendChild(Input);

    return Wrapper;
  };

  const DateInputWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    required,
  }) => {
    const Wrapper = Element("div");

    const Label = Element("label", "dm-form__label");
    Label.setAttribute("for", id);
    Label.innerHTML = labelText + (required ? " *" : "");

    const Input = Element("input", "dm-form__input-field");
    Input.type = "date";
    Input.id = id;
    Input.name = name;
    Input.required = required ?? false;

    Wrapper.appendChild(Label);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    Wrapper.appendChild(Input);

    return Wrapper;
  };

  const RadioInputWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    required,
  }) => {
    const Wrapper = Element("div");

    const Label = Element("label", "dm-form__label", "radio");
    Label.setAttribute("for", id);
    Label.innerHTML = labelText;

    const RadioInput = Element("input");
    RadioInput.type = "radio";
    RadioInput.id = id;
    RadioInput.value = labelText;
    RadioInput.name = name;
    RadioInput.required = required ?? false;

    Wrapper.appendChild(RadioInput);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    Wrapper.appendChild(Label);

    return { Wrapper: Wrapper, Input: RadioInput };
  };

  const RadioInputGroupWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    required,
    radioObjectList,
  }) => {
    const Wrapper = Element("div", "dm-form__radio-group");
    const LabelText = Element("div", "dm-form__label", "radio-title");
    LabelText.innerHTML = labelText + (required ? " *" : "");
    Wrapper.appendChild(LabelText);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    for (const radioObject of radioObjectList) {
      const radioInputObject = RadioInputWithLabel({
        name: name,
        id: id + radioObject.value,
        labelText: radioObject.labelText,
        required: required,
      });

      Wrapper.appendChild(radioInputObject.Wrapper);
    }

    return Wrapper;
  };

  const ChoiseInputWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    required,
  }) => {
    const Wrapper = Element("div");

    const Label = Element("label", "dm-form__label", "radio");
    Label.setAttribute("for", id);
    Label.innerHTML = labelText;

    const RadioInput = Element("input");
    RadioInput.type = "checkbox";
    RadioInput.id = id;
    RadioInput.value = labelText;
    RadioInput.name = name;
    RadioInput.required = required ?? false;

    Wrapper.appendChild(RadioInput);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    Wrapper.appendChild(Label);

    return { Wrapper: Wrapper, Input: RadioInput };
  };

  const MultipleChoiseGroupWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    required,
    radioObjectList,
  }) => {
    const Wrapper = Element("div", "dm-form__radio-group");
    const LabelText = Element("div", "dm-form__label", "radio-title");
    LabelText.innerHTML = labelText + (required ? " *" : "");
    Wrapper.appendChild(LabelText);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    for (const radioObject of radioObjectList) {
      const radioInputObject = ChoiseInputWithLabel({
        name: name,
        id: id + radioObject.value,
        labelText: radioObject.labelText,
        required: required,
      });

      Wrapper.appendChild(radioInputObject.Wrapper);
    }

    return Wrapper;
  };

  const TextareaWithLabel = ({
    name,
    id,
    labelText,
    detailesLabelText,
    rowsHight,
    required,
  }) => {
    const Wrapper = Element("div");

    const Label = Element("label", "dm-form__label");
    Label.setAttribute("for", id);
    Label.innerHTML = labelText + (required ? " *" : "");

    const Textarea = Element("textarea", "dm-form__input-field", "textarea");
    Textarea.id = id;
    Textarea.name = name;
    Textarea.style.minHeight = rowsHight ?? 6 + "em";
    Textarea.required = required ?? false;

    Textarea.addEventListener("input", () => {
      Textarea.style.height = "5px";
      Textarea.style.height = Textarea.scrollHeight + "px";
    });

    Wrapper.appendChild(Label);

    if (detailesLabelText) {
      const DetailedLabel = Element(
        "div",
        "dm-contribute-form__detailed-label"
      );
      DetailedLabel.innerHTML = detailesLabelText;
      Wrapper.appendChild(DetailedLabel);
    }

    Wrapper.appendChild(Textarea);

    return Wrapper;
  };

  const FormFieldsFromObject = ({ formFields, renderCallback }) => {
    const idPre = "s";

    const SongWrapper = Element("div");

    for (const [key, songFieldObject] of Object.entries(formFields)) {
      const elementInfo = {
        name: idPre + key,
        id: idPre + key,
        labelText: songFieldObject.labelText,
        detailesLabelText: songFieldObject.detailesLabelText,
        required: songFieldObject.required,
      };

      let Element;

      switch (songFieldObject.inputType) {
        case TEXT:
          Element = InputWithLabel({ ...elementInfo });
          SongWrapper.appendChild(Element);
          break;
        case TEXTAREA:
          Element = TextareaWithLabel({ ...elementInfo, rowsHight: 5 });
          SongWrapper.appendChild(Element);
          break;
        case DATE:
          Element = DateInputWithLabel({ ...elementInfo });
          SongWrapper.appendChild(Element);
          break;
        case RADIO:
          Element = RadioInputGroupWithLabel({
            ...elementInfo,
            radioObjectList: songFieldObject.radioObjectList,
          });
          SongWrapper.appendChild(Element);
          break;
        case MULTIPLE_CHOISE:
          Element = MultipleChoiseGroupWithLabel({
            ...elementInfo,
            radioObjectList: songFieldObject.choiseObjectList,
          });
          SongWrapper.appendChild(Element);
          break;
        case NUMBER:
          Element = NumberInputWithLabel({ ...elementInfo });
          SongWrapper.appendChild(Element);
          break;
        default:
          console.error('inputType not set for "' + key + '"');
      }

      if (songFieldObject.reRenderSongList || songFieldObject.required) {
        Element.addEventListener(
          songFieldObject.triggerOnInput ? "input" : "change",
          renderCallback
        ); // ERROR: correct?
      }

      Element.addEventListener("change", () => {
        if (autosaveTimeout) clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(() => {
          saveStateToLocalStorage();
        }, autosaveTimeoutMs);
      });
      /* i.addEventListener("change", () => {
          /* if (songFieldObject.inputType === RADIO && i.checked) {
            songFieldObject.value === i.value;
            console.log(songFieldObject);
          } else {
            Input.value = value;
          } *

          songFieldObject.value = i.value;
        }) */

      songFieldObject.DOMElement = Element;
    }

    /* Input state validation */
    const validate = () => {
      let hasValidState = true;
      for (const [key, songFieldObject] of Object.entries(formFields)) {
        if (
          songFieldObject.required &&
          songFieldObject.DOMElement.querySelector(
            songFieldObject === TEXTAREA ? "textarea" : "input"
          ) &&
          !songFieldObject.DOMElement.querySelector(
            songFieldObject === TEXTAREA ? "textarea" : "input"
          )?.value?.trim()?.length
        ) {
          hasValidState = false;
          songFieldObject.DOMElement.querySelectorAll("input").forEach((i) =>
            i.classList?.add("error")
          );
        } else {
          songFieldObject.DOMElement.querySelectorAll("input").forEach((i) =>
            i.classList?.remove("error")
          );
        }
      }

      return hasValidState;
    };

    return {
      DOMElement: SongWrapper,
      formFields: formFields,
      validate: validate,
    };
  };

  const newSong = (renderCallback) => {
    /* Patch song to inputs */

    const newSong = {
      validState: false,
      title: "Ny sang",
      songNumber: getState().songs.length
        ? parseInt(
            getState().songs[getState().songs.length - 1].songNumber || "0"
          ) + 1
        : 1,
      artist: "",
      songType: "",
      themes: [],
      aboutSong: "",
      recommendedKeys: "",
      scripture: "",
      writers: "",
      producers: "",
      contributors: "",
      linkSpotify: "",
      linkAppleMusic: "",
      chart: {
        validState: false,
        key: "",
        tempo: "",
        time: "",
        copyright: "",
        chordProBody: "",
        chordProSum: "",
      },
    };

    getState().songs.push(newSong);

    getState().currentSong = getState().songs[getState().songs.length - 1];

    renderCallback();
  };

  const deleteSong = (renderCallback) => {
    if (
      confirm(
        'Er du sikker på at du vil slette sangen "' +
          getState().currentSong.title +
          '"? Alt du har skrevet inn om sangen slettes. \n\nDenne handlingen kan ikke angres.'
      )
    ) {
      /* Patch song to inputs */
      getState().songs = getState().songs.filter(
        (song) => song !== getState().currentSong
      );

      getState().currentSong = getState().songs.length
        ? getState().songs[0]
        : null;

      renderCallback();
    }
  };

  const generateTemplateFromSong = () => {
    const song = getState().currentSong;

    if (!song || !song.title.length || !song.artist || !song.chart.key.length)
      return "";

    const buffer = [];

    buffer.push(`${song.title}`);
    buffer.push(`${song.artist}`);
    buffer.push(`Key: ${song.chart.key ?? ""}`);
    if (song.chart.tempo.length) buffer.push(`Tempo: ${song.chart.tempo}`);
    if (song.chart.time.length) buffer.push(`Time: ${song.chart.time}`);
    if (getState().album.title.length)
      buffer.push(`Album: ${getState().album.title}`);
    if (song.chart.copyright.length)
      buffer.push(`Copyright: ${song.chart.copyright}`);
    if (getState().artist.web) buffer.push(`Web: ${getState().artist.web}`);
    if (getState().album.releaseDate.length)
      buffer.push(
        `Published: ${new Date(getState().album.releaseDate).getFullYear()}`
      );
    buffer.push(` `);
    if (song.chart.chordProBody.length) buffer.push(song.chart.chordProBody);

    song.chart.chordProSum = buffer.join("\n");

    return buffer.join("\n");
  };

  const patchObjectStateObjectToFormFragment = (
    objectStateObject,
    objectFormFields,
    validateCallback = undefined,
    type
  ) => {
    if (!objectStateObject) throw new Error("songStateObject not set");

    for (const [key, value] of Object.entries(objectStateObject)) {
      if (key in objectFormFields) {
        const Inputs =
          objectFormFields[key].inputType === TEXTAREA
            ? objectFormFields[key].DOMElement.querySelectorAll("textarea")
            : objectFormFields[key].DOMElement.querySelectorAll("input");

        if (!Inputs)
          console.error("InputElement could not be found for key " + key);

        for (const Input of Inputs) {
          if (objectFormFields[key].inputType === RADIO) {
            Input.checked = Input.value === value;
          } else if (objectFormFields[key].inputType === MULTIPLE_CHOISE) {
            Input.checked = value.indexOf(Input.value) !== -1;
          } else {
            Input.value = value;
          }

          if (objectFormFields[key].triggerOnInput) {
            Input.oninput = () => {
              objectStateObject[key] = Input.value;
            };
          } else {
            if (objectFormFields[key].inputType === MULTIPLE_CHOISE) {
              Input.onchange = () => {
                if (Input.checked) objectStateObject[key].push(Input.value);
                else
                  objectStateObject[key] = objectStateObject[key].filter(
                    (x) => x !== Input.value
                  );
                console.log(getState());
              };
            } else {
              Input.onchange = () => {
                objectStateObject[key] = Input.value;
              };
            }
          }
        }
      }
    }

    if (validateCallback) {
      if (type === "CHART") {
        getState().currentSong.chart.validState = validateCallback();
      } else if (validateCallback && getState().currentSong) {
        getState().currentSong.validState = validateCallback();
      }
    }
  };

  const SongList = (renderCallback, hideControls = false) => {
    const SongListWrapper = Element("div");

    const ButtonWrapper = Element(
      "div",
      "dm-contribute-form__song-tab-buttons-wrapper"
    );
    if (!hideControls) SongListWrapper.appendChild(ButtonWrapper);

    const NewSongButton = Element("a", "dm-button");
    NewSongButton.innerHTML = "+ legg til sang";
    NewSongButton.onclick = () => {
      newSong(renderCallback);
    };
    ButtonWrapper.appendChild(NewSongButton);

    const DeleteSongButton = Element("a", "dm-button");
    DeleteSongButton.innerHTML = "- slett sang";
    DeleteSongButton.onclick = () => {
      deleteSong(renderCallback);
    };
    ButtonWrapper.appendChild(DeleteSongButton);

    const Ul = Element("ul", "dm-contribute-form__song-list");
    SongListWrapper.appendChild(Ul);

    getState().songs.forEach((songStateObject) => {
      const Li = Element(
        "li",
        "dm-song-list-item-wrapper",
        "dm-contribute-form__song-list-item"
      );
      console.log(getState().currentSong === songStateObject);
      if (getState().currentSong === songStateObject)
        Li.classList.add("selected");
      if (!songStateObject.validState) Li.classList.add("error");

      const content = `
        <div class='l-bold'>${songStateObject.songNumber}</div>
        <div class='l-bold'>${songStateObject.title}</div>
      `;

      Li.innerHTML = content;

      /* Set clicked song as current song */
      Li.onclick = () => {
        getState().currentSong = songStateObject;

        renderCallback();
      };

      Ul.appendChild(Li);
    });

    return SongListWrapper;
  };

  const ArtistTab = () => {
    let tabRenderCallback = undefined;

    const setTabRenderCallback = (callback) => (tabRenderCallback = callback);

    const TabWrapper = Element("div");

    const renderCallback = () => {
      Fields.validate();
      if (tabRenderCallback) tabRenderCallback();
    };

    /* Create Album Form Elements */
    const formFields = {
      name: {
        labelText: "Navn",
        detailesLabelText: null,
        inputType: TEXT,
        required: true,
        DOMElement: null,
        reRenderSongList: false,
      },
      location: {
        labelText: "By / sted",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      church: {
        labelText: "Kirketilhørighet / sammenheng",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      about: {
        labelText: "Om",
        detailesLabelText: null,
        inputType: TEXTAREA,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      connectedArtists: {
        labelText: "Tilknyttet artist",
        detailesLabelText: "For eksempel IMI-kirken og Impuls",
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkAppleMusic: {
        labelText: "Link til artistsiden på Apple Music",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkSpotify: {
        labelText: "Link til artistsiden på Spotify",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkYouTube: {
        labelText: "Link til YouTube",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkVimeo: {
        labelText: "Link til Vimeo",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkFacebook: {
        labelText: "Link til Facebook",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkInstagram: {
        labelText: "Link til Instagram",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkWebpage: {
        labelText: "Link til egen nettside",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
    };

    const Fields = FormFieldsFromObject({
      formFields: formFields,
      renderCallback: renderCallback,
    });

    patchObjectStateObjectToFormFragment(
      getState().artist,
      Fields.formFields,
      Fields.validate
    );

    TabWrapper.appendChild(Fields.DOMElement);

    renderCallback();

    return {
      TabWrapper: TabWrapper,
      hasValidState: Fields.validate,
      setTabRenderCallback,
    };
  };

  const AlbumTab = () => {
    let tabRenderCallback = undefined;

    const setTabRenderCallback = (callback) => (tabRenderCallback = callback);

    const TabWrapper = Element("div");

    const renderCallback = () => {
      Fields.validate();
      if (tabRenderCallback) tabRenderCallback();
    };

    /* Create Album Form Elements */
    const formFields = {
      title: {
        labelText: "Navn på utgivelse",
        detailesLabelText: null,
        inputType: TEXT,
        required: true,
        DOMElement: null,
        reRenderSongList: false,
      },
      type: {
        labelText: "Type utgivelse",
        detailesLabelText: null,
        inputType: RADIO,
        required: true,
        DOMElement: null,
        radioObjectList: [
          { value: "Album", labelText: "Album (flere sanger)" },
          { value: "Singel", labelText: "Singel (kun én sang)" },
        ],
      },
      artist: {
        labelText: "Artist(er)",
        detailesLabelText: null,
        inputType: TEXT,
        required: true,
        DOMElement: null,
        reRenderSongList: false,
      },
      releaseDate: {
        labelText: "Utgivelsesdato",
        detailesLabelText: null,
        inputType: DATE,
        required: true,
        DOMElement: null,
        reRenderSongList: false,
      },
      producers: {
        labelText: "Produsent(er)",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      label: {
        labelText: "Ansvarlig utgiver / label / plateselskap",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkTracks: {
        labelText: "Link til tracks",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkAppleMusic: {
        labelText: "Link til albumet på Apple Music",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
      linkSpotify: {
        labelText: "Link til albumet på Spotify",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: false,
      },
    };

    const Fields = FormFieldsFromObject({
      formFields: formFields,
      renderCallback: renderCallback,
    });

    patchObjectStateObjectToFormFragment(
      getState().album,
      Fields.formFields,
      Fields.validate
    );

    TabWrapper.appendChild(Fields.DOMElement);

    renderCallback();

    return {
      TabWrapper: TabWrapper,
      hasValidState: Fields.validate,
      setTabRenderCallback,
    };
  };

  const SongsTab = () => {
    let tabRenderCallback = undefined;

    const setTabRenderCallback = (callback) => (tabRenderCallback = callback);

    const TabWrapper = Element("div");

    /* Rerender start */
    const SongListElementRenderWrapper = Element("div");

    const renderCallback = () => {
      if (getState().currentSong !== null) {
        Fields.DOMElement.classList.remove("hide");
        patchObjectStateObjectToFormFragment(
          getState().currentSong,
          Fields.formFields,
          Fields.validate
        );
      } else {
        Fields.DOMElement.classList.add("hide");
      }

      SongListElementRenderWrapper.innerHTML = "";

      getState().songs.sort((a, b) => a.songNumber - b.songNumber);

      SongListElementRenderWrapper.appendChild(SongList(renderCallback));

      if (tabRenderCallback) tabRenderCallback();
    };

    /* Rerender end */

    SongListElementRenderWrapper.appendChild(SongList(renderCallback));

    TabWrapper.appendChild(SongListElementRenderWrapper);

    /* Create Song Form Elements */
    const songFormFields = {
      title: {
        labelText: "Tittel",
        detailesLabelText: null,
        inputType: TEXT,
        required: true,
        DOMElement: null,
        reRenderSongList: true,
      },
      songNumber: {
        labelText: "Spornummer",
        detailesLabelText: null,
        inputType: NUMBER,
        required: true,
        DOMElement: null,
        reRenderSongList: true,
      },
      artist: {
        labelText: "Artist(er)",
        detailesLabelText: null,
        inputType: TEXT,
        required: true,
        DOMElement: null,
      },
      songType: {
        labelText: "Type sang",
        detailesLabelText: null,
        inputType: RADIO,
        required: true,
        DOMElement: null,
        radioObjectList: [
          { value: "Lovsang", labelText: "Lovsang" },
          { value: "Formidlingssang", labelText: "Formidlingssang" },
          { value: "FungerereSomBegge", labelText: "Fungerer som begge" },
        ],
      },
      themes: {
        labelText: "Tema",
        detailesLabelText: "Max 4 tema",
        inputType: MULTIPLE_CHOISE,
        required: true,
        DOMElement: null,
        choiseObjectList: [
          { value: "GudsNærvær", labelText: "Guds nærvær" },
          { value: "Identitet", labelText: "Identitet" },
          { value: "NådeOgKors", labelText: "Nåde og kors" },
          { value: "Jul", labelText: "Jul" },
          { value: "Fornyelse", labelText: "Fornyelse" },
          { value: "Overgivelse", labelText: "Overgivelse" },
          { value: "Respons", labelText: "Respons og innbydelse" },
          { value: "Bønn", labelText: "Bønn" },
          { value: "TroTillit", labelText: "Tro og tillit" },
          { value: "Proklamasjon", labelText: "Proklamasjon" },
          { value: "Tilbedelse", labelText: "Tilbedelse" },
          { value: "TakkLovpris", labelText: "Takk og lovprisning" },
        ],
      },
      aboutSong: {
        labelText: "Om sangen",
        detailesLabelText:
          "F.eks hvordan den ble til, tips til bruk, vitnesbyrd etc",
        inputType: TEXTAREA,
        required: false,
        DOMElement: null,
      },
      recommendedKeys: {
        labelText: "Anbefalte tonearter",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
      },
      scripture: {
        labelText: "Skriftsteder",
        detailesLabelText: "Separer med komma - <i>Joh 3,16; Jes 6,2</i>",
        inputType: TEXT,
        required: false,
        DOMElement: null,
      },
      writers: {
        labelText: "Låtskriver(e)",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
      },
      producers: {
        labelText: "Produsent(er)",
        detailesLabelText:
          "Du kan skrive rolle i parantes - <i>Ola Nordmann (produsent) Kari Nordmann (medprodusent)</i>",
        inputType: TEXT,
        required: false,
        DOMElement: null,
      },
      contributors: {
        labelText: "Bidragsytere",
        detailesLabelText:
          "Du kan skrive rolle i parantes - <i>Ola Nordmann (keys og vokal) Kari Nordmann (bass)</i>",
        inputType: TEXTAREA,
        required: false,
        DOMElement: null,
      },
      CCLI: {
        labelText: "CCLI-nummer",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: true,
      },
      linkSpotify: {
        labelText: "Link til sangen på Spotify",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
      },
      linkAppleMusic: {
        labelText: "Link til sangen på Apple Music",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
      },
    };

    const Fields = FormFieldsFromObject({
      formFields: songFormFields,
      renderCallback: renderCallback,
    });

    TabWrapper.appendChild(Fields.DOMElement);

    renderCallback();

    return {
      TabWrapper: TabWrapper,
      hasValidState: Fields.validate,
      setTabRenderCallback,
    };
  };

  const ChartsTab = () => {
    let tabRenderCallback = undefined;
    let song = undefined;
    const setTabRenderCallback = (callback) => (tabRenderCallback = callback);

    const TabWrapper = Element("div");

    /* Rerender start */
    const SongListElementRenderWrapper = Element("div");
    const ChartRenderWrapper = Element("div");

    const renderCallback = () => {
      if (getState().currentSong?.chart) {
        Fields.DOMElement.classList.remove("hide");
        patchObjectStateObjectToFormFragment(
          getState().currentSong.chart,
          Fields.formFields,
          Fields.validate,
          "CHART"
        );
      } else {
        Fields.DOMElement.classList.add("hide");
      }
      SongListElementRenderWrapper.innerHTML = "";

      getState().songs.sort((a, b) => a.songNumber - b.songNumber);

      SongListElementRenderWrapper.appendChild(SongList(renderCallback, true));

      ChartRenderWrapper.innerHTML = "";

      if (getState().currentSong)
        song = newSongObjectFromTemplate(sheetToCp(generateTemplateFromSong()));

      try {
        ChartRenderWrapper.innerHTML += songObjectToHtmlTable(song) ?? "";
        ChartRenderWrapper.innerHTML += displayCopyrightPart(song) ?? "";
      } catch (e) {
        console.error(e);
      }

      if (tabRenderCallback) tabRenderCallback();
    };

    /* Rerender end */

    SongListElementRenderWrapper.appendChild(SongList(renderCallback, true));

    TabWrapper.appendChild(SongListElementRenderWrapper);
    const ColumnsGrid = Element("div", "dm-contribute-chart__columns-wrapper");
    const LeftColumn = Element("div");
    const RightColumn = Element("div", "dm-content-box");
    RightColumn.appendChild(ChartRenderWrapper);
    ColumnsGrid.appendChild(LeftColumn);
    ColumnsGrid.appendChild(RightColumn);
    TabWrapper.appendChild(ColumnsGrid);

    /* Create Song Form Elements */
    const formFields = {
      key: {
        labelText: "Toneart",
        detailesLabelText: null,
        inputType: TEXT,
        required: true,
        DOMElement: null,
        reRenderSongList: true,
        triggerOnInput: true,
      },
      tempo: {
        labelText: "Tempo",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: true,
        triggerOnInput: true,
      },
      time: {
        labelText: "Taktart",
        detailesLabelText: null,
        inputType: TEXT,
        required: false,
        DOMElement: null,
        reRenderSongList: true,
        triggerOnInput: true,
      },
      copyright: {
        labelText: "Copyright",
        detailesLabelText: null,
        inputType: TEXT,
        required: true,
        DOMElement: null,
        reRenderSongList: true,
        triggerOnInput: true,
      },
      chordProBody: {
        labelText: "Sang",
        detailesLabelText: "Se videoen over dersom du står fast.",
        inputType: TEXTAREA,
        required: true,
        DOMElement: null,
        reRenderSongList: true,
        triggerOnInput: true,
      },
    };

    const Fields = FormFieldsFromObject({
      formFields: formFields,
      renderCallback: renderCallback,
    });

    LeftColumn.appendChild(Fields.DOMElement);

    renderCallback();

    return {
      TabWrapper: TabWrapper,
      hasValidState: Fields.validate,
      setTabRenderCallback,
      rerenderFromParent: () => {
        SongListElementRenderWrapper.innerHTML = "";

        SongListElementRenderWrapper.appendChild(
          SongList(renderCallback, true)
        );
      },
    };
  };

  const Tabs = () => {
    const TabsWrapper = Element("div");
    const TabButtonsWrapper = Element(
      "div",
      "dm-contribute-form__tab-buttons-wrapper"
    );
    TabsWrapper.appendChild(TabButtonsWrapper);

    const ArtistTabButtonWrapper = Element(
      "div",
      "dm-contribute-form__tab-button-wrapper"
    );
    ArtistTabButtonWrapper.innerHTML = "Steg 1";
    const ArtistTabButton = Element("a", "dm-button");
    ArtistTabButton.innerHTML = "Artist";
    ArtistTabButtonWrapper.appendChild(ArtistTabButton);
    TabButtonsWrapper.appendChild(ArtistTabButtonWrapper);

    const AlbumTabButtonWrapper = Element(
      "div",
      "dm-contribute-form__tab-button-wrapper"
    );
    AlbumTabButtonWrapper.innerHTML = "Steg 2";
    const AlbumTabButton = Element("a", "dm-button");
    AlbumTabButton.innerHTML = "Album";
    AlbumTabButtonWrapper.appendChild(AlbumTabButton);
    TabButtonsWrapper.appendChild(AlbumTabButtonWrapper);

    const SongsTabButtonWrapper = Element(
      "div",
      "dm-contribute-form__tab-button-wrapper"
    );
    SongsTabButtonWrapper.innerHTML = "Steg 3";
    const SongsTabButton = Element("a", "dm-button");
    SongsTabButton.innerHTML = "Sanger";
    SongsTabButtonWrapper.appendChild(SongsTabButton);
    TabButtonsWrapper.appendChild(SongsTabButtonWrapper);

    const ChartsTabButtonWrapper = Element(
      "div",
      "dm-contribute-form__tab-button-wrapper"
    );
    ChartsTabButtonWrapper.innerHTML = "Steg 4";
    const ChartTabButton = Element("a", "dm-button");
    ChartTabButton.innerHTML = "Blekker";
    ChartsTabButtonWrapper.appendChild(ChartTabButton);
    TabButtonsWrapper.appendChild(ChartsTabButtonWrapper);

    const AttatchmentsTabButtonWrapper = Element(
      "div",
      "dm-contribute-form__tab-button-wrapper"
    );
    AttatchmentsTabButtonWrapper.innerHTML = "Steg 5";
    const AttatchmentsTabButton = Element("a", "dm-button");
    AttatchmentsTabButton.innerHTML = "Vedlegg og fullfør";
    AttatchmentsTabButton.addEventListener("click", () => {
      setWebflowFormValues();
      updateOriginalChartCount();
    });
    AttatchmentsTabButtonWrapper.appendChild(AttatchmentsTabButton);
    TabButtonsWrapper.appendChild(AttatchmentsTabButtonWrapper);

    const RightButtonWraper = Element(
      "div",
      "dm-contribute-form__tab-buttons-wrapper",
      "dm-contribute-form__tab-button-wrapper"
    );

    RightButtonWraper.style.marginLeft = "auto";
    TabButtonsWrapper.appendChild(RightButtonWraper);

    const ClearAllDataButton = Element("a", "dm-button");
    RightButtonWraper.appendChild(ClearAllDataButton);
    ClearAllDataButton.innerHTML = "Nullstill skjema";
    ClearAllDataButton.onclick = () => {
      if (
        confirm(
          "Er du sikker på at du vil nullstille og slette alle dataene i dette skjemaet. Dette kan ikke angres."
        )
      ) {
        clearState();
        deleteLocalStorageState();
        document.getElementById("contribute-root").innerHTML = "";
        document.getElementById("contribute-root").appendChild(Form());
      }
    };

    const TabContentWrapper = Element(
      "div",
      "dm-contribute-form__tab-content-wrapper"
    );
    TabsWrapper.appendChild(TabContentWrapper);

    const artistTabContent = ArtistTab();
    TabContentWrapper.appendChild(artistTabContent.TabWrapper);
    const albumTabContent = AlbumTab();
    TabContentWrapper.appendChild(albumTabContent.TabWrapper);
    const songsTabContent = SongsTab();
    TabContentWrapper.appendChild(songsTabContent.TabWrapper);
    const chartsTabContent = ChartsTab();
    TabContentWrapper.appendChild(chartsTabContent.TabWrapper);
    const AttatchmentsTabContent = document.getElementById(
      "js-contribute-form-attatchments-tab"
    );
    AttatchmentsTabContent.parentNode = TabContentWrapper;
    AttatchmentsTabContent.classList.remove("hide");

    const tabState = {
      currentTabIndex: 1,
      tabs: [
        {
          index: 0,
          DOMButton: ArtistTabButton,
          DOMContent: artistTabContent.TabWrapper,
          hasValidState: artistTabContent.hasValidState,
          setCallback: artistTabContent.setTabRenderCallback,
        },
        {
          index: 1,
          DOMButton: AlbumTabButton,
          DOMContent: albumTabContent.TabWrapper,
          hasValidState: albumTabContent.hasValidState,
          setCallback: albumTabContent.setTabRenderCallback,
        },
        {
          index: 2,
          DOMButton: SongsTabButton,
          DOMContent: songsTabContent.TabWrapper,
          hasValidState: () => {
            let validState = true;
            getState().songs.forEach((song) => {
              if (!song.validState) {
                validState = false;
                return;
              }
            });
            return validState;
          },
          setCallback: songsTabContent.setTabRenderCallback,
        },
        {
          index: 3,
          DOMButton: ChartTabButton,
          DOMContent: chartsTabContent.TabWrapper,
          hasValidState: () => {
            let validState = true;
            getState().songs.forEach((song) => {
              if (!song.chart.validState) {
                validState = false;
                return;
              }
            });
            return validState;
          },
          setCallback: chartsTabContent.setTabRenderCallback,
          rerenderChild: chartsTabContent.rerenderFromParent,
        },
        {
          index: 4,
          DOMButton: AttatchmentsTabButton,
          DOMContent: AttatchmentsTabContent,
          hasValidState: () => true,
        },
      ],
    };

    const renderState = () => {
      tabState.tabs.forEach((tab) => {
        if (tab.index === tabState.currentTabIndex) {
          tab.DOMButton.classList.add("selected");
          tab.DOMContent.classList.remove("display-none");
          if (tab.hasValidState && tab.hasValidState()) {
            tab.DOMButton.classList.remove("error");
          } else {
            tab.DOMButton.classList.add("error");
          }
        } else {
          tab.DOMButton.classList.remove("selected");
          tab.DOMContent.classList.add("display-none");
          if (tab.hasValidState && tab.hasValidState()) {
            tab.DOMButton.classList.remove("error");
          } else {
            tab.DOMButton.classList.add("error");
          }
        }

        if (tab.rerenderChild) tab.rerenderChild();
      });
    };

    tabState.tabs.forEach((tabObject) => {
      tabObject.DOMButton.addEventListener("click", () => {
        tabState.currentTabIndex = tabObject.index;
        renderState();
      });

      if (tabObject.setCallback) tabObject.setCallback(renderState);
    });

    renderState();

    return TabsWrapper;
  };

  const Form = () => {
    const Form = Element("form");
    Form.id = "contribution-form-helper";
    Form.name = "contribution-form-helper";
    Form.action = "/";

    const Content = Tabs();

    Form.appendChild(Content);

    return Form;
  };

  document.getElementById("contribute-root").appendChild(Form());
};

initializeContributeForm();
