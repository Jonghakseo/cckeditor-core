import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import first from "@ckeditor/ckeditor5-utils/src/first";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import {
  addListToDropdown,
  createDropdown,
} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import Model from "@ckeditor/ckeditor5-ui/src/model";
import Command from "@ckeditor/ckeditor5-core/src/command";
import { SplitButtonView } from "@ckeditor/ckeditor5-ui";

const MUSIC_SELECT = "musicSelect";

export function buildDefinition(options) {
  const definition = {
    model: {
      key: MUSIC_SELECT,
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

class MusicSelectCommand extends Command {
  execute({ name, src }) {
    // console.log(name, src);
    const editor = this.editor;
    // console.log(editor.config);
    const onSelect = editor.config._config.musicSelect.onSelect;
    // console.log(onSelect);
    if (onSelect) onSelect({ name, src });
  }
}

class MusicSelectPlugin extends Plugin {
  constructor(editor) {
    super(editor);
  }

  init() {
    const editor = this.editor;
    const t = editor.t;
    const schema = editor.model.schema;

    const musicLists = editor.config.get("musicSelect.lists");

    editor.commands.add(MUSIC_SELECT, new MusicSelectCommand(editor));
    console.log(musicLists);

    editor.ui.componentFactory.add(MUSIC_SELECT, (locale) => {
      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, _makeSongListItems(musicLists));

      // Create dropdown model.
      dropdownView.buttonView.set({
        label: "음악 선택",
        icon:
          editor.config.get("musicSelect.icon") ||
          '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"  width="24" height="24" viewBox="0 0 24 24"><path fill="#000000" d="M10,13H22V11H10M10,19H22V17H10M10,7H22V5H10M6,7H8.5L5,3.5L1.5,7H4V17H1.5L5,20.5L8.5,17H6V7Z" /></svg>',
        tooltip: true,
      });

      dropdownView.extendTemplate({
        attributes: {
          class: ["ckeditor5-musicSelect-dropdown"],
        },
      });
      //
      // dropdownView.bind("isEnabled").to(command);

      // Execute command when an item from the dropdown is selected.
      this.listenTo(dropdownView, "execute", (evt) => {
        console.log(evt);
        editor.execute(evt.source.commandName, {
          name: evt.source.label,
          src: evt.source.commandParam,
        });
        editor.editing.view.focus();
      });

      return dropdownView;
    });
  }
}

export default MusicSelectPlugin;

function _makeSongListItems(songList) {
  const itemDefinitions = new Collection();
  console.log(songList);
  for (const song of songList) {
    console.log(song);
    const def = {
      type: "button",
      model: new Model({
        commandName: MUSIC_SELECT,
        commandParam: song.src,
        label: song.name,
        class: "ckeditor5-musicSelect-dropdown",
        withText: true,
      }),
    };

    // Add the option to the collection.
    itemDefinitions.add(def);
  }

  return itemDefinitions;
}
