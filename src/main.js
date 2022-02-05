/**
* Project: PAFE
* Author: @sen0rxol0
* Description: Gestionnaire d'encryptage.
*
* Copyright © 2022 @sen0rxol0
*/

/**
* CHANGELOGS: 27/12/2021
*/

const path = require('path');
const gui = require('../gui');
const {
  app,
  BrowserWindow,
  nativeImage,
  systemPreferences
} = require('electron');
const {
  Datastore,
  Storage
} = require('./core/'),
{
  log,
  getDefaultLocales,
  uuidGenerator,
  readFromCSV,
} = require('./util/');

process.on('uncaughtException', (error) => {
  console.error(error);
});
process.on('unhandledRejection', (error) => {
  console.error(error);
});

global.window = null;
global.view = null;
global.datastore = null;
global.storage = null;
global.entries = [];
global.entriesData = [];
// global.entriesData = [{
//   title: '',
//   type: '',
//   username: '',
//   password: '',
//   notes: '',
//   createdAt: '',
//   updatedAt: '',
//   url: '',
// }];
global.entryFields = [
  {
    name: 'type',
    label: 'Type',
    types: {
      password: 'Password',
      generic: 'Generic',
      card: 'Card'
    }
  },
  {
    name: 'title',
    label: 'Title',
    field: 'text'
  },
  {
    name: 'siteURL',
    label: 'Site URL',
    field: 'text'
  },
  {
    name: 'username',
    label: 'Username',
    field: 'text'
  },
  {
    name: 'password',
    label: 'Password',
    field: 'password'
  },
  {
    name: 'notes',
    label: 'Notes',
    field: 'textedit'
  }
];
// global.currentFormFields = {};
global.activeFields = {};
global.sidebarItems = [];
global.loginAttemptCount = 0;
// global.credentials = {}
// global.settings = {}
global.ka = []; //KEEP ALIVE

// SIZES
const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 640;
const BUTTON_WIDTH = 128;
const INPUT_WIDTH = 256;
const INPUT_MAX_WIDTH = 384;
const SIDEBAR_WIDTH = 92;
const ITEM_HEIGHT = 48;

// COLORS
const appearanceBasedColors = () => {
  let background = gui.Color.rgb(232,232,232),
  backgroundDarker = gui.Color.rgb(154,154,154),
  bgHover = gui.Color.rgb(252,252,252),
  text = gui.Color.rgb(0,0,0),
  textHover = gui.Color.rgb(15,15,15);
  if (process.platform === 'darwin') {
    if (systemPreferences.effectiveAppearance === 'dark') {
      background = gui.Color.rgb(37,37,37);
      backgroundDarker = gui.Color.rgb(8,8,8);
      bgHover = gui.Color.rgb(57,57,57);
      text = gui.Color.rgb(255,255,255);
      textHover = gui.Color.rgb(235,235,235);
    }
  }

  // if (process.platform !== 'linux') {
  //     bgHover = `#${systemPreferences.getAccentColor()}`;
  // }

  return {
    background,
    backgroundDarker,
    bgHover,
    text,
    textHover,
    textDefault: gui.Color.get('text'),
    hintDefault: '#8b0000',
    warningDefault: '#b71c1c'
  }
}
const COLORS = appearanceBasedColors();

// STYLES
const STYLES = {
  buttonDefault: {
    width: BUTTON_WIDTH,
    color: COLORS.textDefault,
    marginTop: 16,
    marginBottom: 16
  },
  buttonDefaultMini: {
    width: BUTTON_WIDTH / 2,
    color: COLORS.textDefault,
    // margin: 16/2
  },
  buttonDefaultBig: {
    width: BUTTON_WIDTH * 2,
    height: ITEM_HEIGHT,
    color: COLORS.textDefault,
    marginTop: 16,
    marginBottom: 16
  },
  buttonDefaultIcon: {
    width: BUTTON_WIDTH / 4,
    color: COLORS.textDefault
  },
  // buttonBgPrimary: '#d4d4d4',
  errorLabel: {
    width: '80%',
    paddingTop: 4,
    paddingBottom: 16,
    color: COLORS.warningDefault,
  },
  container: {

  },
  headers: {
    height: 32,
    color: COLORS.textDefault,
    marginTop: 8,
    marginBottom: 8
  }
};

// LANGUAGES
const LANG = app.getLocaleCountryCode().toLowerCase(); // fr,pt,es,en supported
const LOCALES = getDefaultLocales();
function localize(lang, str) {
  let localizedText = '';
  if (!lang in LOCALES) {
    lang = 'en';
  }
  for (const locale of Object.values(LOCALES)) {
    for (let i = 0; i < locale.length; i++) {
      if (str === locale[i]) {
        localizedText = LOCALES[lang][i];
      }
    }
  }
  return localizedText.length ? localizedText : str;
}

function appearanceBasedContainer() {
  let container = gui.Container.create();
  container.setBackgroundColor(COLORS.backgroundDarker);
  if (process.platform === 'darwin') {
    container = gui.Vibrant.create()
    container.setBlendingMode('behind-window');
    container.setMaterial('appearance-based');
  }
  return container;
}
/**
*  Creates imports view.
*/
class Imports {
  constructor() {
    this.view = appearanceBasedContainer();
    this.actionsContainer = gui.Container.create();
    const heading = gui.Label.createWithAttributedText(gui.AttributedText.create(localize(LANG, 'Importar'), {
        font: gui.Font.default().derive(0, 'extra-bold', 'normal'),
        align: 'center',
        valign: 'center',
        color: gui.Color.rgb(67,67,67)
    }));
    const goBackBtn = gui.Button.create(localize(LANG, 'Cancelar'));
    const goBackBtnIcon = gui.Image.createFromPath(path.join(__dirname, 'assets', 'back.png'));
    goBackBtn.setImage(goBackBtnIcon);
    const importBtn = gui.Button.create('Importar de CSV');
    importBtn.onClick = this.onImportFromFile.bind(this);
    goBackBtn.onClick = () => {
      setContentView(new DatastoreView().view);
    }
    // goBackBtn.onClick = this.onGoBack.bind(this);
    this.actionsContainer.addChildView(importBtn);
    this.actionsContainer.addChildView(goBackBtn);
    this.view.addChildView(heading);
    this.view.addChildView(this.actionsContainer);
    heading.setStyle(STYLES.headers);
    goBackBtn.setStyle(STYLES.buttonDefaultIcon);
    // goBackBtn.setBackgroundColor(gui.Color.argb(0, 0, 0,0));
    importBtn.setStyle(STYLES.buttonDefault);
    this.actionsContainer.setStyle({flexDirection: 'column-reverse', justifyContent: 'space-around', alignItems: 'center' });
    this.view.setStyle({ flex: 1, flexDirection: 'column' });
  }

  onImportFromFile() {
    this.importData = null;
    this.pickerCols = [];
    this.pickerContainer = gui.Container.create();
    const openFile = gui.FileOpenDialog.create();
    const pickerHeading = gui.Label.create('Escolha os campos correspondentes');
    const showResultsBtn = gui.Button.create(localize(LANG, 'Ver resultados'));
    showResultsBtn.onClick = this.onShowResults.bind(this);
    // const pickerCols = entryFields.map
    entryFields.forEach(entryField => {
      this.pickerCols.push({
        key: entryField.name,
        label: gui.Label.create(`${entryField.label}:`),
        picker: gui.Picker.create()
      });
    });
    if (openFile.runForWindow(window)) {
      readFromCSV(openFile.getResult()).then((data) => { // @TODO: test file for csv type
        this.importData = data;
        const item = data[0]; // @TODO: create an array of property names
        this.pickerCols.forEach((col, i) => {
          const pickerCol = gui.Container.create();
          pickerCol.addChildView(col.label);
          pickerCol.addChildView(col.picker);
          Object.getOwnPropertyNames(item).forEach(itemName => {
            col.picker.addItem(itemName);
          });

          col.picker.setStyle({width: 128});
          pickerCol.setStyle({ height: 32, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' });
          this.pickerContainer.addChildView(pickerCol);
        });

        this.actionsContainer.removeChildView(this.actionsContainer.childAt(0));
        this.actionsContainer.addChildViewAt(showResultsBtn, 0);
        this.view.addChildViewAt(this.pickerContainer, 1);
      }).catch(err => console.error(err));
    }

    this.pickerContainer.addChildView(pickerHeading);
    pickerHeading.setStyle(STYLES.headers);
    showResultsBtn.setStyle(STYLES.buttonDefault);
    this.pickerContainer.setStyle({ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' });
  }

  onShowResults() {
    this.results = [];
    const resultsContainer = gui.Container.create();
    const confirmBtn = gui.Button.create(localize(LANG, 'Confirmar'));
    const tableView = gui.Table.create();
    const tableModel = gui.SimpleTableModel.create(entryFields.length);
    confirmBtn.onClick = this.onConfirmImport.bind(this);
    this.importData.forEach((item, i) => {
      const tableRow = [];
      const row = [];
      this.pickerCols.forEach(({key, picker}, i) => {
        tableRow.push(item[picker.getSelectedItem()]);
        row.push({ key, value: item[picker.getSelectedItem()] });
      });
      tableModel.addRow(tableRow);
      this.results.push(this.parseEntry(row));
    });
    entryFields.forEach(entryField => {
      tableView.addColumn(entryField.label);
    });
    tableView.setModel(tableModel);
    resultsContainer.addChildView(tableView);
    this.view.removeChildView(this.pickerContainer);
    this.view.addChildViewAt(resultsContainer, 1);
    this.actionsContainer.removeChildView(this.actionsContainer.childAt(0));
    this.actionsContainer.addChildViewAt(confirmBtn, 0);
    tableView.setStyle({flex: 1});
    confirmBtn.setStyle(STYLES.buttonDefault);
    resultsContainer.setStyle({flex: 1});
  }

  onConfirmImport() {
    // Datastore.setEntries(this.results).then(entries => { entriesData = entries });
    storage.getData().then(({credentials}) => {
      datastore.encryptData(JSON.stringify(this.results), credentials.masterKey)
      .then((encrypted) => {
        storage.set({
          entries: encrypted
        }).then(() => {
          storage.getData().then(({entries}) => {
            datastore.decryptData(entries, credentials.masterKey).then((plain) => {
              entriesData = JSON.parse(plain);
              setContentView(new DatastoreView().view);
            });
          });
        });
      });
    });
  }

  parseEntry(row) {
    let entry = {};
    for (let col of row) {
      entry[col.key] = col.value;
      entry['createdAt'] = new Date(Date.now());
      entry['uuid'] = uuidGenerator();
      // entry['updatedAt'] = new Data(Date.now());
    }
    return entry;
  }
}
/**
*  Creates settings view.
*/
class Settings {
  constructor() {
    this.view = appearanceBasedContainer();
    this.view.setStyle({ flex: 1 });
  }
}
/**
*  Creates setup view.
*/
class Setup {
  constructor(type) {
    if (type === 'newDatastore') {
      this.view = this.newDatastoreView();
    } else {
      this.view = this.syncDatastoreView();
    }
  }

  newDatastoreView() {
    const container = gui.Container.create();
    const heading = createWelcomeHeading();
    const containerLabel = gui.Label.createWithAttributedText(gui.AttributedText.create(localize(LANG, 'Novo armazenamento de dados'), {
      font: gui.Font.default().derive(0, 'extra-bold', 'normal'),
      align: 'center',
      valign: 'center',
      color: gui.Color.rgb(67,67,67)
    }));
    const continueButton = gui.Button.create(localize(LANG, 'Continuar...'));
    continueButton.onClick = onContinue;
    const onPassFieldChange = () => passFieldValidate();
    const onPassFieldConfirmationChange = () => passFieldValidate();
    const onPassFieldConfirmationActivate = onContinue;
    const passContainer = gui.Container.create();
    const passError = gui.Label.create('');
    const footer = gui.Container.create();
    const footNoteText = (text) => {
    return gui.AttributedText.create(text, {
        font: gui.Font.default().derive(-3, 'semi-bold', 'normal'),
        align: 'center'
      });
    }
    const footerNote = gui.Label.createWithAttributedText(footNoteText(`Note: ${localize(LANG, 'Frase de acesso deve ser guardada em segredo e nunca esquecida.')}`));
    const footerNotice = gui.Label.createWithAttributedText(footNoteText(`NOTICE: ${localize(LANG, 'Criar um novo armazenamento de dados requer uma frase de acesso.')}`));
    const passField = createField(localize(LANG, 'Frase de acesso'), 'password', {
      textChange: onPassFieldChange,
      activate: onPassFieldChange,
    });
    const passFieldConfirmation = createField(localize(LANG, 'Confirmação da frase de acesso'), 'password', {
      textChange: onPassFieldConfirmationChange,
      activate: onPassFieldConfirmationActivate
    });

    function createField(title, type, on) {
      const field = gui.Container.create();
      const label = gui.Label.createWithAttributedText(gui.AttributedText.create(title, {
        font: gui.Font.default().derive(-3, 'medium', 'normal'),
        align: 'start'
      }));
      const input = gui.Entry.createType(type);
      if (Object.keys(on).length) {
        if ('textChange' in on) {
          input.onTextChange = on.textChange;
        }
        if ('activate' in on) {
          input.onActivate = on.activate;
        }
      }
      field.getText = () => input.getText();
      field.addChildView(label);
      field.addChildView(input);
      label.setStyle({ height: 16, marginBottom: 4, color: '#888' });
      input.setStyle({ width: INPUT_WIDTH });
      field.setStyle({ flex: 1, flexDirection: 'column' });
      return field;
    }

    function passFieldValidate() {
      let message = '';
      const setErrorMessage = () => {
        if (passField.getText().length < 6) {
          if (!passField.getText().length) {
            message = localize(LANG, 'É necessária uma frase de acesso.');
          } else {
            message = localize(LANG, 'A frase de acesso precisa ter 6 ou mais caracteres.');
          }
        } else {
          message = localize(LANG, 'A frase de acesso não corresponde.');
        }
        passError.setText(message);
        passError.setColor(COLORS.warningDefault);
      }

      if (passField.getText().length >= 6) {
        if (passField.getText() === passFieldConfirmation.getText()) {
          passError.setText('');
          return true;
        } else {
          setErrorMessage();
          return false;
        }
      } else {
        setErrorMessage();
        return false;
      }
    }

    function onContinue() {
      if (passFieldValidate()) {
        datastore.deriveMasterKey(passField.getText())
        .then(key => {
          storage.set({
            credentials: {
              masterKey: key
            }
          }).then(() => {
            setContentView(new DatastoreView().view);
          });
        });
      }
    }

    container.addChildView(heading);
    container.addChildView(containerLabel);
    passContainer.addChildView(passField);
    passContainer.addChildView(passFieldConfirmation);
    passContainer.addChildView(passError);
    container.addChildView(passContainer);
    container.addChildView(continueButton);
    footer.addChildView(footerNotice);
    footer.addChildView(footerNote);
    container.addChildView(footer);
    footerNote.setColor(COLORS.hintDefault);
    footerNotice.setColor(COLORS.warningDefault);
    footer.setStyle({ paddingTop: 16, flex: 1 });
    containerLabel.setStyle(STYLES.headers);
    passContainer.setStyle({flex: 1, alignItems: 'center'});
    passError.setStyle(STYLES.errorLabel);
    passError.setAlign('start');
    continueButton.setStyle({ alignSelf: 'center', ...STYLES.buttonDefaultBig });
    container.setStyle({ flex: 1, flexDirection: 'column' });
    container.setBackgroundColor(COLORS.background);
    return container;
  }

  syncDatastoreView() {
    const container = gui.Container.create();
    const heading = createWelcomeHeading();
    const containerLabel = gui.Label.create(localize(LANG, 'Sincronizar armazenamento de dados'));
    container.addChildView(heading);
    container.addChildView(containerLabel);
    containerLabel.setStyle(STYLES.headers);
    container.setStyle({ flex: 1 });
    container.setBackgroundColor(COLORS.background);
    return container;
  }
}
/**
*  Creates sidebar item view.
*/
class SidebarItem {
  constructor(title, dispatch) {
    this.view = gui.Container.create();
    this.view.onMouseEnter = this.onMouseEnter.bind(this);
    this.view.onMouseLeave = this.onMouseLeave.bind(this);
    this.view.onMouseUp = this.onMouseUp.bind(this);
    this.view.onDraw = this.onDraw.bind(this);
    this.hover = false;
    this.selected = false;
    this.dispatch = dispatch;
    this.text = {
      padding: 4,
      attributed: gui.AttributedText.create(title, {
        font: gui.Font.default().derive(-1, 'semi-bold', 'normal'),
        color: COLORS.textDefault,
        align: 'center',
        valign: 'center',
        // cursor: gui.Cursor.createWithType('hand')
      })
    };
    this.view.setStyle({ width: '100%', height: ITEM_HEIGHT });
  }

  onDraw(view, painter, dirty) {
    // const textBounds = this.text.attributed.getBoundsFor({ width: SIDEBAR_WIDTH, height: ITEM_HEIGHT });
    const viewBounds = Object.assign({}, view.getBounds(), {x: 0, y: 0});
    if (this.hover) {
      painter.setFillColor(COLORS.bgHover);
      painter.fillRect(viewBounds);
    }
    this.text.attributed.setColor(this.hover ? COLORS.textHover : COLORS.textDefault);
    // const textY = (ITEM_HEIGHT - this.text.padding - textBounds.height) / 2 + this.text.padding;
    painter.drawAttributedText(this.text.attributed, viewBounds);
    // Icon.
    // const iconAttributes = {
    //   x: (props.width - props.iconSize) / 2,
    //   y: (props.height - props.padding - item.textBounds.height - props.iconSize) / 2,
    //   width: props.iconSize,
    //   height: props.iconSize,
    // };
    // item.painter.drawImage(item.icon, iconAttributes);
  }

  onMouseEnter() {
   this.hover = true;
   this.view.schedulePaint();
  };

  onMouseLeave() {
    this.hover = false;
    this.view.schedulePaint();
  };

  onMouseUp(view, ev) {
    if (!this.hover) return;
    Sidebar.dispatchAction(this.dispatch);
   };
}
/**
*  Creates sidebar view used in datastore view.
*/
class Sidebar {
  constructor() {
    this.view = gui.Container.create();
    for (const item of this.getItems()) {
      const sidebarItem = new SidebarItem(item.title, item.dispatch);
      // const itemIcon = gui.Image.createFromPath(path.join(__dirname, 'assets', item.icon));
      this.view.addChildView(sidebarItem.view);
      sidebarItems.push(sidebarItem);
    };
    this.view.setStyle({ flexDirection: 'column', width: SIDEBAR_WIDTH });
  }

  getItems() {
    return [
      // { title: localize(LANG, 'Credenciais'), dispatch: 'credentials', icon: 'credentials.png' },
      // { title: localize(LANG, 'Gerar'), dispatch: 'generate', icon: 'generate.png' },
      { title: localize(LANG, 'Importar'), dispatch: 'import', icon: 'import.png' },
      { title: localize(LANG, 'Definições'), dispatch: 'settings', icon: 'settings.png' },
      { title: localize(LANG, 'Bloquear'), dispatch: 'lock', icon: 'lock.png' },
    ];
  }

  static dispatchAction(action) {
    log(`Dispatching action for ${action}`, log.INFO);
    switch (action) {
      case 'credentials':
        // setContentView(createCredentialsView());
        break;
      case 'generate':
        // setContentView(createCredentialsView());
        break;
      case 'import':
        setContentView(new Imports().view);
        break;
      case 'settings':
        setContentView(new Settings().view);
        break;
      case 'lock':
        onDatastoreLock();
        break;
      default:
      break;
    }
  }
}
/**
*  Creates activities page in datastore activity tab.
*/
// function createDatastoreActivity() {
//   const container = gui.Container.create();
//   return container;
// }
/**
*  Creates datastore entry resource,
*  which is either a form for editing or creating a entry.
*/
class DatastoreEntryResource {
  constructor(entryItem = null) {
    // const uuid, title, username, email, notes, password, createTime, modifyTime, url, autotype:bool
    this.createFields();
    this.view = gui.Container.create();
    const heading = gui.Label.createWithAttributedText(gui.AttributedText.create(localize(LANG, 'Adicionar uma nova entrada'), {
      font: gui.Font.default().derive(0, 'extra-bold', 'normal'),
      align: 'center',
      valign: 'center',
      color: gui.Color.rgb(67,67,67)
    }));
    this.submitBtn = gui.Button.create(localize(LANG, 'Guardar...'));
    this.submitBtn.onClick = this.onSubmitEntry.bind(this);
    this.view.addChildView(heading);
    this.view.addChildView(this.fieldsContainer);
    this.view.addChildView(this.submitBtn);
    heading.setStyle(STYLES.headers);
    this.submitBtn.setStyle(STYLES.buttonDefaultBig);
    this.view.setStyle({ paddingBottom: 24, flex: 1, flexDirection: 'column', alignItems: 'center' });
    // console.log(entryItem);
    if (entryItem !== null) {
      // console.log(activeFields);
      this.fieldsContainer.childAt(0).childAt(1).setText(entryItem.title);
      this.fieldsContainer.childAt(1).childAt(1).setText(entryItem.siteURL);
      this.fieldsContainer.childAt(2).childAt(1).setText(entryItem.username);
      this.fieldsContainer.childAt(3).childAt(0).childAt(1).setText(entryItem.password);
      const cancelBtn = gui.Button.create(localize(LANG, 'Cancelar'));
      cancelBtn.setStyle(STYLES.buttonDefaultMini);
      cancelBtn.onClick = () => {
        setContentView(new DatastoreView().view);
      }
      this.view.addChildView(cancelBtn);
    }
  }

  onSubmitEntry() {
    // console.log(activeFields);
    // console.log(this.fields.titleField.getEntry().getText());
    // console.log(this.fields.usernameField.getEntry().getText());
    // console.log(this.fields.passField.getEntry().getText());
  }

  onGeneratePassField(btn) {
    datastore.generatePassphrase().then(gen => {
      this.passFieldContainer.childAt(0).childAt(1).setText(gen);
    });
  }

  onViewPassField(btn) {
    const defaultTitle = localize(LANG, 'Mostrar'),
    currentValue = this.passFieldContainer.childAt(0).childAt(1).getText();
    if (btn.getTitle() == defaultTitle) {
      // this.passFieldContainer.childAt(0).removeChildView(activeFields.pass.childAt(1));
      // this.passFieldContainer.childAt(0).addChildViewAt(activeFields.passNormal.childAt(1), 1);
      // activeFields.passNormal.childAt(1).setText(currentValue);
      // this.passFieldContainer.addChildViewAt(activeFields.passNormal, 0);
      btn.setTitle('Cacher');
    } else {
      // this.passFieldContainer.childAt(0).removeChildView(activeFields.passNormal.childAt(1));
      // this.passFieldContainer.childAt(0).addChildViewAt(activeFields.pass.childAt(1), 1);
      // activeFields.pass.childAt(1).setText(currentValue);
      // this.passFieldContainer.addChildViewAt(activeFields.pass, 0);
      btn.setTitle(defaultTitle);
    }
  };

  createFields() {
    this.fieldsContainer = gui.Container.create();
    const pickType = gui.Picker.create();
    const pickTypeField = gui.Container.create();
    const pickTypeLabel = gui.Label.create('Tipo de entrada');
    pickType.addItem(localize(LANG, 'Palavra-passe'));
    pickType.addItem('Cartao');
    pickTypeField.addChildView(pickTypeLabel);
    pickTypeField.addChildView(pickType);
    this.passFieldContainer = gui.Container.create();
    const viewBtn = gui.Button.create(localize(LANG, 'Mostrar'));
    const generateBtn = gui.Button.create(localize(LANG, 'Gerar'));
    const passFieldEvents = {
      textChange: () => {
        if (passField.childAt(1).getText().length) {
          // passphrase = fieldPass.getText();
          // fieldPassView.setText(passphrase);
        } else {
          // passphrase = '';
        }
      },
      activate: () => { }
    };

    const passFieldNormal = createField(localize(LANG, 'Palavra-passe'), 'normal', passFieldEvents);
    const passField = createField(localize(LANG, 'Palavra-passe'), 'password', passFieldEvents);
    const titleField = createField(localize(LANG, 'Título'), 'normal');
    const siteField = createField('Site', 'normal');
    const usernameField = createField(localize(LANG, 'Nome do usuário'), 'normal');
    viewBtn.onClick  = this.onViewPassField.bind(this);
    generateBtn.onClick = this.onGeneratePassField.bind(this);
    this.passFieldContainer.addChildView(passField);
    this.passFieldContainer.addChildView(viewBtn);
    this.passFieldContainer.addChildView(generateBtn);
    this.fieldsContainer.addChildView(pickTypeField);
    this.fieldsContainer.addChildView(titleField);
    this.fieldsContainer.addChildView(siteField);
    this.fieldsContainer.addChildView(usernameField);
    this.fieldsContainer.addChildView(this.passFieldContainer);
    viewBtn.setStyle(STYLES.buttonDefaultMini);
    generateBtn.setStyle(STYLES.buttonDefaultMini);
    this.passFieldContainer.setStyle({ maxHeight: 56, flex: 1, flexDirection: 'row', alignItems: 'flex-end' });
    this.fieldsContainer.setStyle({ width: '100%', paddingLeft: 16, paddingRight: 16, flex: 1, flexDirection: 'column' });

    activeFields = Object.assign({
      type: pickTypeField,
      title: titleField,
      site: siteField,
      username: usernameField,
      pass: passField,
      passNormal: passFieldNormal,
      view: viewBtn,
      generate: generateBtn
    }, activeFields);

    function createField(title, type, on) {
      const field = gui.Container.create();
      const input = gui.Entry.createType(type);
      const label = gui.Label.createWithAttributedText(gui.AttributedText.create(title, {
        font: gui.Font.default().derive(-3, 'medium', 'normal'),
        align: 'start'
      }));
      field.addChildView(label);
      field.addChildView(input);
      label.setStyle({ marginBottom: 4, color: COLORS.textDefault });
      label.setAlign('start');
      input.setStyle({ width: '100%' });
      field.setStyle({ maxHeight: 56, flex: 1, flexDirection: 'column' });
      if (on && Object.keys(on).length) {
        if ('textChange' in on) {
          input.onTextChange = on.textChange;
        }
        if ('activate' in on) {
          input.onActivate = on.activate;
        }
      }
      return field;
    }
  }
}
/**
*  Creates entry list item view.
*/
class DatastoreEntriesListItem {
  constructor(title, item) {
    this.item = item;
    this.view = gui.Container.create();
    this.text = gui.AttributedText.create(title, {
      font: gui.Font.default().derive(9, 'bold', 'normal'),
      valign: 'center',
      // align: 'center'
    });
    this.view.onMouseEnter = this.onMouseEnter.bind(this);
    this.view.onMouseLeave = this.onMouseLeave.bind(this);
    this.view.onMouseUp = this.onShowEntry.bind(this);
    this.view.onDraw = this.onDraw.bind(this);
    this.view.setStyle({
      width: '100%',
      height: 64,
      marginBottom: 16,
      // borderRadius: 4,
      // cursor: gui.Cursor.createWithType('hand')
    });
    this.hover = false;
  }

  onDraw(view, painter, dirty) {
    const viewBounds = Object.assign({}, view.getBounds(), {x: 0, y: 0});
    if (this.hover) {
      painter.setFillColor(COLORS.bgHover);
      painter.fillRect(viewBounds);
    }

    viewBounds.x = 8;
    viewBounds.width -= 8;
    painter.drawAttributedText(this.text, viewBounds);
  }

  onMouseEnter(view) {
    this.hover = true;
    this.view.schedulePaint();
  }

  onMouseLeave() {
    this.hover = false;
    this.view.schedulePaint();
  }

  onShowEntry() {
    if (!this.hover) return;
    setContentView(new DatastoreEntryShow(this.item).view);
    // this.
  }
}
/**
*  Creates datastore entry list tab view.
*/
class DatastoreEntriesListTab {
  constructor() {
    this.view = gui.Scroll.create();
    this.entries = gui.Container.create();
    this.searchEntries = gui.Entry.create();
    this.searchEntries.onActivate = this.onEntriesSearch.bind(this);
    this.entries.addChildView(this.searchEntries);
    ka.push(this.searchEntries);
    entries = [];
    for (const entry of this.getEntries()) {
      const entryItem = new DatastoreEntriesListItem(entry.title, entry.uuid);
      this.entries.addChildView(entryItem.view);
      entries.push(entryItem);
    }
    this.entries.addChildView(gui.Label.create(`${entries.length} ${localize(LANG, 'Entradas')}`));
    this.searchEntries.setStyle({ marginTop: 16, marginBottom: 16 });
    this.entries.setStyle({ paddingLeft: 4, paddingRight: 4, flex: 1, flexDirection: 'column' });
    this.view.setContentSize(this.entries.getPreferredSize());
    this.view.setScrollbarPolicy('never', 'automatic');
    this.view.setContentView(this.entries);
    // this.view.setBackgroundColor(COLORS.backgroundDarker);
  }

  onEntriesSearch() {
    console.log(this.searchEntries.getText());
  }

  getEntries() {
    // if (!entriesData.length) {
      // return storage.getData().then(data => data.entries);
    // }
    return entriesData;
  }
}
/**
*  Creates datastore tabs, entry add tab view.
*/
class DatastoreEntriesAddTab {
  constructor() {
    this.view = new DatastoreEntryResource().view;
  }
}
/**
*  Creates datastore tabs view.
*/
class DatastoreTabs {
  constructor() {
    this.view = gui.Tab.create();
    this.view.addPage(localize(LANG, 'Entradas'), new DatastoreEntriesListTab().view);
    // this.view.addPage(localize(LANG, 'Atividades'), createDatastoreActivity());
    this.view.addPage(localize(LANG, 'Adicionar nova'), new DatastoreEntriesAddTab().view);
    this.view.setStyle({ flex: 1, alignItems: 'center', color: COLORS.text });
  }
}
/**
*  Creates datastore entry edit view.
*/
class DatastoreEntryEdit {
  constructor(entry) {
    this.view = new DatastoreEntryResource(entry).view;
  }
}
/**
*  Creates datastore entry show view.
*/
class DatastoreEntryShow {
  constructor(uuid) {
    this.view = appearanceBasedContainer();
    const entry = entriesData.find((entryItem) => entryItem.uuid === uuid);
    const heading = gui.Label.createWithAttributedText(gui.AttributedText.create('Entrada', {
      font: gui.Font.default().derive(0, 'extra-bold', 'normal'),
      align: 'center',
      valign: 'center',
      color: gui.Color.rgb(67,67,67)
    }));
    const entryActionsContainer = gui.Container.create();
    const goBackBtn = gui.Button.create('Regressar');
    const goBackBtnIcon = gui.Image.createFromPath(path.join(__dirname, 'assets', 'back.png'));
    goBackBtn.setImage(goBackBtnIcon);
    const editBtn = gui.Button.create('Editar');
    const removeBtn = gui.Button.create('Supprimer');
    entryActionsContainer.addChildView(goBackBtn);
    entryActionsContainer.addChildView(editBtn);
    entryActionsContainer.addChildView(removeBtn);
    goBackBtn.onClick = () => {
      setContentView(new DatastoreView().view);
    }
    editBtn.onClick = () => {
      setContentView(new DatastoreEntryEdit(entry).view);
    }
    this.view.addChildView(heading);
    Object.getOwnPropertyNames(entry).forEach((key, i) => {
      if (key === 'uuid' || key === 'createdAt') {
        return;
      }
      const entryContainer = gui.Container.create();
      const entryField = entryFields.find(field => field.name == key);
      let title = entryField ? entryField.label : key;
      const attributedText = gui.AttributedText.create(title, {
        font: gui.Font.default().derive(-1, 'semi-bold', 'normal'),
        color: COLORS.textDefault,
        align: 'center',
        valign: 'center'
      });
      const label = gui.Label.createWithAttributedText(attributedText);
      const value = gui.Label.create(entry[key]);
      entryContainer.addChildView(label);
      entryContainer.addChildView(value);
      this.view.addChildView(entryContainer);
      entryContainer.setStyle({maxHeight: 32, paddingLeft: 16, paddingRight: 16, marginTop: 16, flex: 1, flexDirection: 'row', justifyContent: 'space-between'});
      // entryContainer.setBackgroundColor(systemPreferences.getColor('control-background'));
    });
    this.view.addChildView(entryActionsContainer);
    heading.setStyle(Object.assign({}, STYLES.headers, {marginBottom: 64}));
    goBackBtn.setStyle(Object.assign({}, STYLES.buttonDefaultIcon, {marginBottom: 8}));
    editBtn.setStyle(Object.assign({}, STYLES.buttonDefaultMini, {marginBottom: 8}));
    removeBtn.setStyle(Object.assign({}, STYLES.buttonDefaultMini, {marginBottom: 8}));
    entryActionsContainer.setStyle({ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'});
    this.view.setStyle({paddingBottom: 24, flex: 1, flexDirection: 'column', justifyContent: 'flex-start'});
    // this.view.setBackgroundColor(COLORS.background);
  }
}
/**
*  Creates datastore view, which is composed of a sidebar and tabs.
*/
class DatastoreView {
  constructor() {
    this.view = appearanceBasedContainer();
    const main = gui.Container.create();
    this.view.addChildView(new Sidebar().view);
    main.addChildView(new DatastoreTabs().view);
    this.view.addChildView(main);
    main.setStyle({ flex: 1, paddingTop: 8 });
    // main.setBackgroundColor(COLORS.background);
    this.view.setStyle({flex: 1, flexDirection: 'row'});
  }
}
/**
* Creates Welcome view, presenting datastore setup for the user.
*/
class Welcome {
  constructor() {
    this.view = gui.Container.create();
    this.view.addChildView(createWelcomeHeading());
    this.view.addChildView(this.setupView());
    // this.view.addChildView(this.authenticationView());
    this.view.setStyle({ flex: 1, flexDirection: 'column' });
    this.view.setBackgroundColor(COLORS.background);
  }

  onLogin() {
    setContentView(new Authentication().view);
  }

  onSetupNew() {
    setContentView(new Setup('newDatastore').view);
  }

  onSetupSync() {
    setContentView(new Setup('syncDatastore').view);
  }

  setupSyncView() {
    const syncContainer = gui.Container.create();
    const syncHeading = gui.Label.create(localize(LANG, 'Configurar a sincronização'));
    const syncButton = gui.Button.create(localize(LANG, 'Iniciar a sincronização...'));
    syncContainer.addChildView(syncHeading);
    syncContainer.addChildView(syncButton);
    syncButton.onClick = this.onSetupSync;
    syncButton.setStyle(STYLES.buttonDefaultMini);
    syncHeading.setStyle(STYLES.headers);
    syncContainer.setStyle({ flex: 1, alignItems: 'center', marginTop: 16, marginBottom: 16 });
    return syncContainer;
  }

  setupNewView() {
    const newContainer = gui.Container.create();
    const newHeading = gui.Label.createWithAttributedText(gui.AttributedText.create(localize(LANG, 'Configurar nova'), {
      font: gui.Font.default().derive(0, 'extra-bold', 'normal'),
      color: gui.Color.rgb(67,67,67)
    }));
    const newButton = gui.Button.create(localize(LANG, 'Crie um novo...'));
    newContainer.addChildView(newHeading);
    newContainer.addChildView(newButton);
    newButton.onClick = this.onSetupNew;
    newButton.setStyle(STYLES.buttonDefaultMini);
    newHeading.setStyle(STYLES.headers);
    newContainer.setStyle({ flex: 1, alignItems: 'center', marginTop: 16, marginBottom: 16});
    return newContainer;
  }

  setupView() {
    const setupContainer = gui.Container.create();
    // setupContainer.addChildView(this.setupSyncView());
    setupContainer.addChildView(this.setupNewView());
    setupContainer.setStyle({ padding: 16, flex: 1, flexDirection: 'row' });
    return setupContainer;
  }

  authenticationView() {
    const authContainer = gui.Container.create();
    const continueBtn = gui.Button.create('Login...');
    continueBtn.onClick = this.onLogin;
    authContainer.addChildView(continueBtn);
    authContainer.setStyle({ flex: 1, alignItems: 'center' });
    continueBtn.setStyle(STYLES.buttonDefaultBig);
    return authContainer;
  }
}
/**
*  Creates main Authentication view
*/
class Authentication {
  constructor() {
    this.view = gui.Container.create();
    this.loginView = this.createLoginView();
    const heading = gui.Label.createWithAttributedText(gui.AttributedText.create('Login', {
      font: gui.Font.default().derive(0, 'extra-bold', 'normal'),
      align: 'center',
      valign: 'center',
      color: gui.Color.rgb(67,67,67)
    }));
    this.view.addChildView(createWelcomeHeading());
    this.view.addChildView(heading);
    this.view.addChildView(this.loginView);
    heading.setStyle(STYLES.headers);
    this.view.setStyle({ flex: 1, flexDirection: 'column' });
    this.view.setBackgroundColor(COLORS.background);
  }

  onAttemptLogin() {
    log('Attempting datastore authentication', log.INFO);
    loginAttemptCount++;
    // const passphrase = this.passphraseField.getText();
    const passphrase = 'Seguro@myFPasswordIsb1gL0n6';
    if (passphrase.length) {
      // loginAttemptCount = 0;
      onDatastoreUnlock(passphrase)
      // onDatastoreUnlock(this.passphraseField.getText())
      .then(() => {
        setContentView(new DatastoreView().view);
      }, () => {
        this.failed.setText('Frase de acesso incorrecto');
        this.failed.setColor(COLORS.warningDefault);
      });
    } else {
      log('Datastore authentication failed', log.INFO);
      this.failed.setText(localize(LANG, 'Por favor, preencha a sua frase de acesso.'));
      this.failed.setColor(COLORS.warningDefault);
    }
  }

  createLoginView() {
    const container = gui.Container.create();
    this.failed = gui.Label.create('');
    this.passphraseField = gui.Entry.createType('password');
    const login = gui.Button.create(localize(LANG, 'Continuar'));
    this.passphraseField.onActivate = this.onAttemptLogin.bind(this);
    login.onClick = this.onAttemptLogin.bind(this);
    container.addChildView(this.failed);
    container.addChildView(this.passphraseField);
    container.addChildView(login);
    this.failed.setStyle(STYLES.errorLabel);
    this.failed.setAlign('start');
    this.passphraseField.setStyle({ width: INPUT_MAX_WIDTH });
    login.setStyle(STYLES.buttonDefaultBig);
    container.setStyle({ paddingTop: 32, flex: 1, alignItems: 'center' });
    // container.setBackgroundColor(COLORS.backgroundDarker);
    return container;
  }
}

class PafeDelegate {
  constructor() {
    app.whenReady().then(this.onReadyLaunchGUI.bind(this));
    this.initLogs();
  }

  onReadyLaunchGUI() {
    const appIconPath = path.join(__dirname, 'assets', 'icon_512x512@1x.png');
    if (process.platform === 'darwin') {
      const appIcon = nativeImage.createFromPath(appIconPath);
      app.dock.setIcon(appIcon);
    }
    this.initDatastore();
    this.createMainWindow();
  }

  initLogs() {
    app.setAppLogsPath();
    log('Initializing application', log.LOG, app.getPath('logs'));
  }

  initDatastore() {
    const cryptoWin = new BrowserWindow({
      show: false,
      webPreferences: {
        javascript: true,
        plugins: false,
        nodeIntegration: false,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });
    cryptoWin.loadFile(path.join(__dirname, 'crypto.html')).then(() => {
      datastore = new Datastore(cryptoWin.webContents);
    });
    // cryptoWin.webContents.openDevTools();
    // cryptoWin.webContents.on('did-finish-load', () => {
    //   cryptoWin.webContents.executeJavaScript(`
    //     window.cryptoAPI.generator.alphaNumeric(12);
    //   `).then((res) => {
    //     console.log(res);
    //   });
    // });
  }

  checkDatastore() { // @TODO: fix credentials condition for when storage not created, on first run
    return storage.getData().then(storeData => {
      if ('credentials' in storeData) return true;
      return false;
    }, err => {
      console.log(err);
      if (err.code === 'ENOENT') {
        logger('Creating storage file with initial values', log.WARN);
        // storage.set({
          // settings: this.getInitialSettings()
        // });
      }
      return false;
    });
  }

  createMainWindow() {
    global.setContentView = this.onSetContentView;
    window = gui.Window.create({});

    const appIconPath = path.join(__dirname, 'assets', 'icon_512x512@1x.png');
    if (process.platform !== 'darwin') {
      const appIcon = gui.Image.createFromPath(appIconPath);
      window.setIcon(appIcon);
    }

    if (this.checkDatastore()) {
      setContentView(this.getAuthenticationView());
      // setContentView(this.getWelcomeView());
    } else {
      setContentView(this.getWelcomeView());
    }
    window.setContentSize({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });
    window.setTitle(app.name);
    window.onClose = () => {
      return app.quit()
    };
    window.center();
    window.activate();
  }

  createSettingsWindow() {

  }

  getWelcomeView() {
    return new Welcome().view;
  }

  getAuthenticationView() {
    return new Authentication().view;
  }

  onSetContentView(contentView) {
    // setTimeout(() => {
      view = contentView;
      window.setContentView(view);
    // }, 250);
    // window.setContentView(createLoadingIndicator());
  }
}

function onDatastoreUnlock(passphrase) {
  log('Unlocking datastore', log.INFO);
  return new Promise((resolve, reject) => {
    storage.getData()
    .then(({credentials}) => {
      datastore.verifyCrendentials(credentials.masterKey, passphrase)
      .then((validCredentials) => {
        if (validCredentials) {
          log('Datastore unlocked', log.INFO);
          storage.getData().then(({entries}) => {
            datastore.decryptData(entries, credentials.masterKey)
            .then((plain) => {
              entriesData = JSON.parse(plain);
              resolve();
            });
          });
        } else {
          log('Datastore login failed', log.INFO);
          reject();
        }
      });
    });
  });
}

function onDatastoreLock() {
  log('Locking datastore', log.INFO);
  entriesData = [];
  setContentView(new Authentication().view);
}

// Welcome to Pafe. heading, included in most views.
function createWelcomeHeading() {
  const welcome  = gui.AttributedText.create('Welcome to Pafe.', {
    font: gui.Font.default().derive(13, 'bold', 'normal'),
    align: 'center',
    valign: 'center'
  });
  const heading = gui.Label.createWithAttributedText(welcome);
  heading.setStyle({ height: 128, color: COLORS.text });
  return heading;
}

function createLoadingIndicator() {
  const container = gui.Container.create();
  const loading = gui.GifPlayer.create();
  container.addChildView(loading);
  loading.setStyle({ width: 40, height: 40 });
  // loading.setImage(gui.Image.createFromPath(path.join(__dirname, 'assets', 'loading.gif')));
  loading.setAnimating(true);
  container.setStyle({ flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 50, minHeight: 50 });
  return container;
}

function main() {
  new PafeDelegate();
  storage = new Storage();
  // storage.set({
  //   settings: {
  //     passwords: {
  //       autoGenerate: true,
  //     }
  //   },
  //   creadentials: {
  //     key: 'randompass33'
  //   },
  // }).then(() => {
  //   storage.getData().then(data => console.log(data));
  // });
}

main();

// function createCredentialsView() {
//   const container = gui.Container.create();
//   const sidebar = createSidebar();
//   const main = gui.Container.create();
//   const header = gui.Container.create();
//   // const backButton = gui.Button.create('Go back')
//   const heading = gui.Label.create(localize(LANG, 'Gerenciamento de credenciais'));
//   header.addChildView(heading);
//   main.addChildView(header);
//   container.addChildView(sidebar);
//   container.addChildView(main);
//   header.setStyle(STYLES.headers);
//   main.setStyle({ flex: 1 });
//   container.setStyle({ flex: 1, flexDirection: 'row'});
//   return container;
// }
