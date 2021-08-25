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
    editor._selectedSong = { name, src };
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
          '<svg id="Capa_1" enable-background="new 0 0 448 448" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg"><path d="m442.016 3.5c-3.744-3.04-8.672-4.096-13.472-3.136l-288 64c-7.328 1.632-12.544 8.128-12.544 15.616v253.12c-13.408-8.128-29.92-13.12-48-13.12-44.096 0-80 28.704-80 64s35.904 64 80 64 80-28.704 80-64v-195.168l256-56.896v137.184c-13.408-8.128-29.92-13.12-48-13.12-44.128 0-80 28.704-80 64s35.872 64 80 64 80-28.704 80-64v-304c0-4.864-2.176-9.44-5.984-12.48z"/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></svg>',
        tooltip: true,
      });

      dropdownView.extendTemplate({
        attributes: {
          class: ["ckeditor5-musicSelect-dropdown"],
        },
      });

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

  for (const song of songList) {
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
