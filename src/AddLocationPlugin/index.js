import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import first from "@ckeditor/ckeditor5-utils/src/first";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import {
  addListToDropdown,
  createDropdown,
} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import Model from "@ckeditor/ckeditor5-ui/src/model";
import Command from "@ckeditor/ckeditor5-core/src/command";
import { SplitButtonView, View, ViewCollection } from "@ckeditor/ckeditor5-ui";

const ADD_LOCATION = "addLocation";

export function buildDefinition(options) {
  const definition = {
    model: {
      key: ADD_LOCATION,
      values: options.slice(),
    },
    view: {},
  };

  // for (const option of options) {
  //     definition.view[option] = {
  //         key: "style",
  //         value: {
  //             "line-height": option,
  //         },
  //     };
  // }

  return definition;
}

class AddLocationCommand extends Command {
  execute(params) {
    const editor = this.editor;
    console.log(editor.config)
    if (params.type){
     if (params.type === "USER_LOCATION") {
       const onClickUserLocation = editor.config._config.addLocation.onClickUserLocation;
       if(onClickUserLocation) onClickUserLocation(params)
     }
     if (params.type === "OPEN_MAP"){
       const onClickOpenMap = editor.config._config.addLocation.onClickOpenMap;
       if (onClickOpenMap) onClickOpenMap()
     }
    }
  }
}

class AddLocationPlugin extends Plugin {
  constructor(editor) {
    super(editor);
  }

  init() {
    const editor = this.editor;
    const t = editor.t;
    const schema = editor.model.schema;

    const userLocation = editor.config.get("addLocation.userLocation") || "장소없음";

    editor.commands.add(ADD_LOCATION, new AddLocationCommand(editor));

    editor.ui.componentFactory.add(ADD_LOCATION, (locale) => {
      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, _makeAddLocationListItems(userLocation));

      // Create dropdown model.
      dropdownView.buttonView.set({
        label: "장소 선택",
        icon:
          editor.config.get("addLocation.icon") ||
          '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><g><path d="M256,0C153.755,0,70.573,83.182,70.573,185.426c0,126.888,165.939,313.167,173.004,321.035 c6.636,7.391,18.222,7.378,24.846,0c7.065-7.868,173.004-194.147,173.004-321.035C441.425,83.182,358.244,0,256,0z M256,278.719 c-51.442,0-93.292-41.851-93.292-93.293S204.559,92.134,256,92.134s93.291,41.851,93.291,93.293S307.441,278.719,256,278.719z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>',
        tooltip: true,
      });

      dropdownView.extendTemplate({
        attributes: {
          class: ["ckeditor5-addLocation-dropdown"],
        },
      });

      // Execute command when an item from the dropdown is selected.
      this.listenTo(dropdownView, "execute", (evt) => {
        editor.execute(evt.source.commandName, evt.source.commandParam);
        editor.editing.view.focus();
      });

      return dropdownView;
    });
  }
}

export default AddLocationPlugin;

function _makeAddLocationListItems(userLocation) {
  const itemDefinitions = new Collection();
  const userLocationButton = {
    type: "button",
    model: new Model({
      commandName: ADD_LOCATION,
      commandParam: {
        type: "USER_LOCATION",
        value: userLocation,
      },
      label: userLocation,
      class: "ckeditor5-addLocation-dropdown",
      withText: true,
    }),
  };
  const openMapWindow = {
    type: "button",
    model: new Model({
      commandName: ADD_LOCATION,
      commandParam: {
        type:"OPEN_MAP"
      },
      label: "지도에서 선택",
      class: "ckeditor5-addLocation-dropdown",
      withText: true,
    }),
  };

  itemDefinitions.add(userLocationButton);
  itemDefinitions.add(openMapWindow);

  return itemDefinitions;
}
