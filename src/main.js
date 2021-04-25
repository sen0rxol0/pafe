/**
* Project: PAFE
* Author: @sen0rxol0
* Description: Gestionnaire d'encryptage.
*
* Copyright © 2021 BAIEFLOW
*/

/**
* CHANGELOGS: 25/04/2021
*/

const path = require('path');
const gui = require('../gui');
const {
  app,
  BrowserWindow,
  nativeImage
} = require('electron');

const {
  Datastore,
  Storage
} = require('./core/'),
{
  log,
  logType,
  getDefaultLocales,
  uuidGenerator,
  readFromCSV,
} = require('./util/');

// buttonStyles = { // more at https://libyue.com/docs/latest/js/api/button_style.html
//   circular: 'circular', // circle
//   roundRect: 'round-rect',
//   incline: 'inline',
//   recessed: 'recessed',
//   rounded: 'rounded',
//   texturedRounded: 'textured-rounded',
//   squareRegular: 'regular-square',
//   squareThicker: 'thicker-square',
//   squareThick: 'thick-square',
//   squareShadowless: 'shadowless-square',
//   squareTextured: 'textured-square',
//   squareSmall: 'small-square'
// }

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
    field: 'text'
  },
  {
    name: 'type',
    label: 'Type',
    types: {
      password: 'Password',
      generic: 'Generic',
      card: 'Card'
    }
  }
];
global.sidebarItems = [];
global.loginAttemptCount = 0;
global.credentials = {}
// global.settings = {}

// SIZES
const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 640;
const BUTTON_WIDTH = 128;
const INPUT_WIDTH = 256;
const INPUT_MAX_WIDTH = 384;
const SIDEBAR_WIDTH = 92;
const ITEM_HEIGHT = 48;

// COLORS
const COLORS = {
  background: '#eceff1',
  backgroundDarker: '#cfd8dc',
  bgHover: '#b0bec5',
  bgSelected: '#e2e2f4',
  text: '#000',
  textHover: '#424242',
  textDefault: '#fff',
  hintDefault: '#8b0000',
  warningDefault: '#b71c1c'
}

// STYLES
const STYLES = {
  buttonDefault: {
    width: BUTTON_WIDTH,
    color: '#000',
    marginTop: 16,
    marginBottom: 16
  },
  buttonDefaultMini: {
    width: BUTTON_WIDTH / 2,
    color: '#000',
    // margin: 16/2
  },
  buttonDefaultBig: {
    width: BUTTON_WIDTH * 2,
    height: ITEM_HEIGHT,
    color: '#000',
    marginTop: 16,
    marginBottom: 16
  },
  buttonBgPrimary: '#d4d4d4',
  errorLabel: {
    width: '80%',
    paddingTop: 4,
    paddingBottom: 16,
    color: '#b71c1c',
  },
  container: {

  },
  headers: {
    height: 32,
    color: '#424242',
    marginTop: 8,
    marginBottom: 8
  }
};

// LANGUAGES
const LANG = app.getLocaleCountryCode().toLowerCase(); // fr,pt,es,en
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

// Welcome to Pafe. heading, included in most views.
function createWelcomeHeading() {
  const heading = gui.Label.create('Welcome to Pafe.');
  heading.setStyle({ height: 128, color: COLORS.text, backgroundColor: COLORS.background });
  return heading;
}

/**
* ==================
*  Credentials
*    Say YOURCompany has all sorts of passwords and informations that are often shared
*     between members of YOURCompany, credentials allows sharing those passwords
*     and informations as a single syncronized stack of information.
*
*    A credential record is keeped and shared as:
*      CompanyName:
*        Records:
*          - hostname1,login1,password1,note1
*          - hostname2,login2,password2,note2
*
*   Keeping track of logins, passwords, addresses, documents, etc, is still hard so
*   Pafe Credentials helps you keeping track and sharing with ease and safety.
* ==================
*/
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

class Imports {
  constructor() {
    this.view = gui.Container.create();
    this.actionsContainer = gui.Container.create();
    const heading = gui.Label.create(localize(LANG, 'Importar'));
    const returnBtn = gui.Button.create(localize(LANG, 'Cancelar'));
    const importBtn = gui.Button.create('Importar de CSV');
    importBtn.onClick = this.onImportFromFile.bind(this);
    this.actionsContainer.addChildView(importBtn);
    this.actionsContainer.addChildView(returnBtn)
    this.view.addChildView(heading);
    this.view.addChildView(this.actionsContainer);
    heading.setStyle(STYLES.headers);
    returnBtn.setStyle(STYLES.buttonDefaultMini);
    importBtn.setStyle(STYLES.buttonDefault);
    this.actionsContainer.setStyle({ flex: 1, alignItems: 'center' });
    this.view.setStyle({ flex: 1, flexDirection: 'column', backgroundColor: COLORS.backgroundDarker });
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
*  Creates main Authentication view
*/
class Authentication {
  constructor() {
    this.view = gui.Container.create();
    this.loginView = this.createLoginView();
    const heading = gui.Label.create('Login');
    this.view.addChildView(createWelcomeHeading());
    this.view.addChildView(heading);
    this.view.addChildView(this.loginView);
    heading.setStyle(STYLES.headers);
    this.view.setStyle({ flex: 1, flexDirection: 'column', backgroundColor: COLORS.backgroundDarker });
  }

  onAttemptLogin() {
    loginAttemptCount++;
    if (this.passphraseField.getText().length) {
      // loginAttemptCount = 0;
      storage.getData()
      .then(({credentials}) => {
        datastore.verifyCrendentials(credentials.masterKey, this.passphraseField.getText())
        .then((validCredentials) => {
          if (validCredentials) {
            storage.getData().then(({entries}) => {
              datastore.decryptData(entries, credentials.masterKey)
              .then((plain) => {
                entriesData = JSON.parse(plain);
                setContentView(new DatastoreView().view);
              });
            });
          } else {
            this.failed.setText('Frase de acesso incorrecto');
            this.failed.setColor(COLORS.warningDefault);
          }
        });
      });
    } else {
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
    container.setStyle({ paddingTop: 32, flex: 1, alignItems: 'center'});
    return container;
  }
}

/**
*  Creates add entry page in datastore add entry tab.
*/
function createDatastoreAdd() {
  // const uuid, group, title, username, email, notes, password, createTime, modifyTime, url, autotype:bool
  let passphrase = '';
  const container = gui.Container.create();
  const containerLabel = gui.Label.create(localize(LANG, 'Adicionar uma nova entrada'));
  containerLabel.setStyle(STYLES.headers);
  container.addChildView(containerLabel);

  function createField(title, type, on) {
    const field = gui.Container.create();
    const label = gui.Label.create(title);
    const input = gui.Entry.createType(type);
    if (on && Object.keys(on).length) {
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
    label.setStyle({ height: 16, marginBottom: 4, color: '#888' })
    label.setAlign('start');
    input.setStyle({ width: '100%' });
    field.setStyle({ maxHeight: 56, flex: 1, flexDirection: 'column' });
    return field;
  }

  const fields = gui.Container.create();
  const submit = gui.Button.create(localize(LANG, 'Guardar...'));
  const fieldTitle = createField(localize(LANG, 'Título'), 'normal');
  const fieldHost = createField('Site', 'normal');
  const fieldName = createField(localize(LANG, 'Nome do usuário'), 'normal');
  fields.addChildView(fieldTitle);
  fields.addChildView(fieldHost);
  fields.addChildView(fieldName);

  // const fieldPassView = gui.Label.create('confirmation: ');
  // fieldPassView.setStyle({ height: 32, color: '#888', padding: 4 });
  const passFieldContainer = gui.Container.create();
  const fieldPass = createField(localize(LANG, 'Palavra-passe'), 'password', {
    textChange: () => {
      if (fieldPass.getText().length) {
        passphrase = fieldPass.getText();
        // fieldPassView.setText(passphrase);
      } else {
        passphrase = '';
      }
    },
    activate: () => { }
  });
  const viewButton = gui.Button.create(localize(LANG, 'Mostrar'));
  const genButton = gui.Button.create(localize(LANG, 'Gerar'));
  const onToggleViewPassphrase = (btn) => {

  }
  const onGeneratePassphrase = (btn) => {

  }
  viewButton.onClick = onToggleViewPassphrase;
  genButton.onClick = onGeneratePassphrase;
  passFieldContainer.addChildView(fieldPass);
  passFieldContainer.addChildView(viewButton);
  passFieldContainer.addChildView(genButton);
  fields.addChildView(passFieldContainer);
  // fields.addChildView(fieldPassView);
  container.addChildView(fields);
  container.addChildView(submit);
  viewButton.setStyle(STYLES.buttonDefaultMini);
  genButton.setStyle(STYLES.buttonDefaultMini);
  passFieldContainer.setStyle({ maxHeight: 56, flex: 1, flexDirection: 'row', alignItems: 'flex-end' });
  submit.setStyle(STYLES.buttonDefaultBig);
  fields.setStyle({ width: '100%', padding: 16, flex: 1, flexDirection: 'column' });
  container.setStyle({ flex: 1, flexDirection: 'column', alignItems: 'center' });
  return container;
}

class EntriesItemView {
  constructor(title, type) {
    const titleLabel = gui.Label.create(title);
    const typeLabel = gui.Label.create(type);
    this.view = gui.Container.create();
    // this.selected = false;
    this.view.addChildView(titleLabel);
    this.view.addChildView(typeLabel);
    // title.setStyle({ width: '92%', color: COLORS.text, align: 'center' });
    // type.setStyle({ width: '92%', color: COLORS.text, align: 'end' })
    this.view.onMouseEnter = this.onMouseEnter.bind(this);
    this.view.onMouseLeave = this.onMouseLeave.bind(this);
    this.view.onMouseUp = this.onMouseUp.bind(this);
    this.view.onDraw = this.onDraw.bind(this);
    this.view.setStyle({
      height: 64,
      marginBottom: 16,
      backgroundColor: COLORS.backgroundDarker
    });
    this.hover = false;
  }

  onDraw(view, painter, dirty) {
    if (this.hover) {
      painter.setFillColor(COLORS.bgHover);
      painter.fillRect(Object.assign(view.getBounds(), {x: 0, y: 0}));
    }
  }

  onMouseEnter(view) {
    this.hover = true;
    this.view.schedulePaint();
  }

  onMouseLeave() {
    this.hover = false;
    this.view.schedulePaint();
  }

  onMouseUp() {
    if (!this.hover) return;
    // this.
  }
}

/**
*  Creates entry list page in datastore entries tab.
*/
class TabDatastoreList {
  constructor() {
    this.view = gui.Scroll.create();
    this.entries = gui.Container.create();
    this.searchView = this.entriesSearchView();
    this.entries.addChildView(this.searchView);
    for (const entry of this.getEntries()) {
      const entryItem = new EntriesItemView(entry.title, entry.type);
      this.entries.addChildView(entryItem.view);
      entries.push(entryItem);
    }

    this.entries.setStyle({ flex: 1, flexDirection: 'column' });
    this.view.setContentSize(this.entries.getPreferredSize());
    this.view.setScrollbarPolicy('never', 'always');
    this.view.setContentView(this.entries);
  }

  onEntriesSearch() {

  }

  getEntries() {
    // if (!entriesData.length) {
      // return storage.getData().then(data => data.entries);
    // }
    return entriesData;
  }

  entriesSearchView() {
    const container = gui.Container.create();
    const search = gui.Entry.create();
    search.onActivate = this.onEntriesSearch.bind(this);
    container.addChildView(search);
    container.setStyle({ marginBottom: 32 });
    return container;
  }
}

/**
*  Creates activities page in datastore activity tab.
*/
function createDatastoreActivity() {
  const container = gui.Container.create();
  return container;
}

class TabsDatastore {
  constructor() {
    this.view = gui.Tab.create();
    this.view.addPage(localize(LANG, 'Entradas'), this.listPage());
    // this.view.addPage(localize(LANG, 'Atividades'), this.activityPage());
    this.view.addPage(localize(LANG, 'Adicionar nova'), this.addPage());
    this.view.setStyle({ flex: 1, alignItems: 'center', backgroundColor: COLORS.backgroundDarker, color: COLORS.text });
  }

  listPage() {
    return new TabDatastoreList().view;
  }

  // activityPage() {
  //   return createDatastoreActivity();
  // }

  addPage() {
    return createDatastoreAdd();
  }
}

// Part of addSidebarItems
function dispatchSidebarAction(dispatch) {
  // logger(dispatch);
  switch (dispatch) {
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
      // setContentView(createSettingsView());
      break;
    case 'lock':
      setContentView(new Authentication().view);
      break;
    default:
    break;
  }
}

class SidebarItemView {
  constructor(title, dispatch) {
    this.hover = false;
    this.selected = false;
    this.title = title;
    this.dispatch = dispatch;
    this.font = gui.Font.create('system-ui', 14, 'normal', 'normal');
    this.view = gui.Container.create();
    this.view.onMouseEnter = this.onMouseEnter.bind(this);
    this.view.onMouseLeave = this.onMouseLeave.bind(this);
    this.view.onMouseUp = this.onMouseUp.bind(this);
    this.view.onDraw = this.onDraw.bind(this);
    this.view.setStyle({ width: '100%', height: ITEM_HEIGHT });
  }

  onDraw(view, painter, dirty) {
    const padding = 4;
    const attributedText = { font: this.font, color: COLORS.text, align: 'center'};
    const itemText = gui.AttributedText.create(this.title, attributedText);
    const textBounds = itemText.getBoundsFor({ width: SIDEBAR_WIDTH, height: ITEM_HEIGHT });
    // Background.
    if (this.selected || this.hover) {
      painter.setFillColor(COLORS.bgHover);
      painter.fillRect(Object.assign(view.getBounds(), {x: 0, y: 0}));
    }
    if (this.selected) {
      painter.setFillColor(COLORS.bgSelected);
      painter.fillRect(Object.assign(view.getBounds(), {x: 0, y: 0}));
    }
    // Text.
    itemText.setColor((this.selected || this.hover) ? COLORS.text : COLORS.textHover);
    // const textY = (props.height - props.padding - item.current.textBounds.height - props.iconSize) / 2 + props.iconSize + props.padding;
    const textY = (ITEM_HEIGHT - padding - textBounds.height) / 2 + padding;
    const textAttributes = { x: 0, y: textY, width: SIDEBAR_WIDTH, height: textBounds.height };
    painter.drawAttributedText(itemText, textAttributes);
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
    // this.selected = true;
    // this.view.schedulePaint();
    dispatchSidebarAction(this.dispatch);
   };
}

/**
*  Creates sidebar component used in datastore view.
*/
class Sidebar {
  constructor() {
    this.view = gui.Container.create();
    for (const item of this.getItems()) {
      const sidebarItem = new SidebarItemView(item.title, item.dispatch);
      // const itemIcon = gui.Image.createFromPath(path.join(__dirname, 'assets', item.icon));
      this.view.addChildView(sidebarItem.view);
      sidebarItems.push(sidebarItem);
    };
    this.view.setStyle({ flexDirection: 'column', width: SIDEBAR_WIDTH });
    this.view.setBackgroundColor(COLORS.background);
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
}

/**
*  Creates datastore view, which is composed of a sidebar and tabs.
*/
class DatastoreView {
  constructor(passphrase = '') {
    this.view = gui.Container.create();
    const heading = gui.Label.create('Datastore');
    const main = gui.Container.create();
    main.addChildView(heading);
    main.addChildView(new TabsDatastore().view);
    this.view.addChildView(new Sidebar().view);
    this.view.addChildView(main);
    heading.setStyle(STYLES.headers);
    main.setStyle({ flex: 1, flexDirection: 'column' });
    main.setBackgroundColor(COLORS.backgroundDarker);
    this.view.setStyle({flex: 1, flexDirection: 'row', backgroundColor: COLORS.background});
  }
}


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
    const containerLabel = gui.Label.create(localize(LANG, 'Novo armazenamento de dados'));
    const continueButton = gui.Button.create(localize(LANG, 'Continuar...'));
    continueButton.onClick = onContinue;
    const onPassFieldChange = () => passFieldValidate();
    const onPassFieldConfirmationChange = () => passFieldValidate();
    const onPassFieldConfirmationActivate = onContinue;
    const passContainer = gui.Container.create();
    const passError = gui.Label.create('');
    const footer = gui.Container.create();
    const footerNote = gui.Label.create(`Note: ${localize(LANG, 'Frase de acesso deve ser guardada em segredo e nunca esquecida.')}`);
    const footerNotice = gui.Label.create(`NOTICE: ${localize(LANG, 'Criar um novo armazenamento de dados requer uma frase de acesso.')}`);
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
      const label = gui.Label.create(title);
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
      label.setAlign('start');
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
    container.setStyle({ flex: 1, flexDirection: 'column', backgroundColor: COLORS.backgroundDarker });
    return container;
  }

  syncDatastoreView() {
    const container = gui.Container.create();
    const heading = createWelcomeHeading();
    const containerLabel = gui.Label.create(localize(LANG, 'Sincronizar armazenamento de dados'));
    container.addChildView(heading);
    container.addChildView(containerLabel);
    containerLabel.setStyle(STYLES.headers);
    container.setStyle({ flex: 1, backgroundColor: COLORS.backgroundDarker});
    return container;
  }
}

/**
*
*/
class Welcome {
  constructor() {
    this.view = gui.Container.create();
    this.view.addChildView(createWelcomeHeading());
    this.view.addChildView(this.setupView());
    this.view.addChildView(this.authenticationView());
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
    const newHeading = gui.Label.create(localize(LANG, 'Configurar nova'));
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
    setupContainer.addChildView(this.setupSyncView());
    setupContainer.addChildView(this.setupNewView());
    setupContainer.setStyle({ padding: 16, flex: 1, flexDirection: 'row' });
    setupContainer.setBackgroundColor(COLORS.backgroundDarker);
    return setupContainer;
  }

  authenticationView() {
    const authContainer = gui.Container.create();
    const continueBtn = gui.Button.create('Login...');
    continueBtn.onClick = this.onLogin;
    authContainer.addChildView(continueBtn);
    authContainer.setStyle({ flex: 1, alignItems: 'center' });
    authContainer.setBackgroundColor(COLORS.backgroundDarker);
    continueBtn.setStyle(STYLES.buttonDefaultBig);
    return authContainer;
  }
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

class PafeDelegate {
  constructor() {
    app.whenReady().then(this.onReadyLaunchGUI.bind(this));
    this.initLogs();
  }

  onReadyLaunchGUI() {
    this.initDatastore();
    this.createMainWindow();
  }

  initLogs() {
    app.setAppLogsPath();
    log('', '', app.getPath('logs'));
    log('initializing application', logType.LOG);
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
    //   datastore = new Datastore(cryptoWin.webContents);
    //   // datastore.deriveMasterKey('Seguro@myFPasswordIsb1gL0n6')
    //   // .then((key) => {
    //   //   // datastore.verifyCrendentials(key, 'Seguro@myFPasswordIsb1gL0n6')
    //   //   // .then((valid) => {
    //   //   //   console.log('crendentials valid:', valid);
    //   //   // })
    //   //
    //   //   storage.getData().then(data => {
    //   //     datastore.encryptData(JSON.stringify(data.entries), key).then((encrypted) => {
    //   //       console.log(encrypted);
    //   //       datastore.decryptData(encrypted, key).then((plain) => {
    //   //         console.log(JSON.parse(plain));
    //   //       });
    //   //     });
    //   //   });
    //   // })
    // });
  }

  createMainWindow() {
    global.setContentView = this.onSetContentView;
    window = gui.Window.create({});

    const appIconPath = path.join(__dirname, 'assets', 'icon.png');
    if (process.platform === 'darwin') {
      const appIcon = nativeImage.createFromPath(appIconPath);
      app.dock.setIcon(appIcon);
    } else {
      const appIcon = gui.Image.createFromPath(appIconPath);
      window.setIcon(appIcon);
    }

    //@TODO: check if user data exists and show view accordingly
    // if not user data, show welcome, else, show authentication
    setContentView(this.getWelcomeView());
    // setContentView(this.getAuthenticationView());
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

function main() {
  new PafeDelegate();
  // console.log(app.getPath('userData'));
  storage = new Storage(app.getPath('userData'));
  // storage.getData().then((data) => {
  //   if ('entries' in data) {
  //     entriesData = Object.values(data.entries);
  //   }
  // }, err => {
  //   if (err.code === 'ENOENT') {
  //     // logger('[]creating storage file with initial values');
  //     // storage.set({
  //     //   entries: {}
  //     // })
  //   }
  //   // console.error("ERROR:", err);
  // });

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
