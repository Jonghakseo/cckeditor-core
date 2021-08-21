import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import first from '@ckeditor/ckeditor5-utils/src/first'
import Collection from '@ckeditor/ckeditor5-utils/src/collection'
import {
  addListToDropdown,
  createDropdown,
} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import Model from "@ckeditor/ckeditor5-ui/src/model";
import Command from "@ckeditor/ckeditor5-core/src/command";

export function buildDefinition(options) {
  const definition = {
    model: {
      key: "lineHeight",
      values: options.slice(),
    },
    view: {},
  };

  for (const option of options) {
    definition.view[option] = {
      key: "style",
      value: {
        "line-height": option,
      },
    };
  }

  return definition;
}

class LineHeightCommand extends Command {
  refresh() {
    const firstBlock = first(
      this.editor.model.document.selection.getSelectedBlocks()
    );

    this.isEnabled = !!firstBlock && this._canSetLineHeight(firstBlock);

    this.value =
      this.isEnabled && firstBlock.hasAttribute(LINE_HEIGHT)
        ? firstBlock.getAttribute(LINE_HEIGHT)
        : "1";
  }

  execute(options = {}) {
    const editor = this.editor;
    const model = editor.model;
    const doc = model.document;

    console.log(model.schema.getDefinitions());

    // const value = '0'
    const value = options.value;

    model.change((writer) => {
      const blocks = Array.from(doc.selection.getSelectedBlocks()).filter(
        (block) => this._canSetLineHeight(block)
      );
      const currentLineHeight = blocks[0].getAttribute(LINE_HEIGHT);

      const removeLineHeight =
        /* isDefault( value ) ||  */ currentLineHeight === value ||
        typeof value === "undefined";

      console.log(
        value,
        currentLineHeight === value,
        typeof value === "undefined"
      );

      if (removeLineHeight) {
        removeLineHeightFromSelection(blocks, writer);
      } else {
        setLineHeightOnSelection(blocks, writer, value);
      }
    });
  }

  _canSetLineHeight(block) {
    return this.editor.model.schema.checkAttribute(block, LINE_HEIGHT);
  }
}

function removeLineHeightFromSelection(blocks, writer) {
  for (const block of blocks) {
    console.log("removing");
    writer.removeAttribute(LINE_HEIGHT, block);
  }
}

function setLineHeightOnSelection(blocks, writer, lineHeight) {
  for (const block of blocks) {
    console.log("setting", block, lineHeight);
    writer.setAttribute(LINE_HEIGHT, lineHeight, block);
  }
}

export function isSupported(option) {
  return /^\d(.\d+)?$/gm.test(String(option));
}
export function normalizeOptions(configuredOptions) {
  return configuredOptions.map(optionDefinition).filter((option) => !!option);
}

class LineHeightPlugin extends Plugin {
  constructor(editor) {
    super(editor);

    editor.config.define("lineHeight", {
      options: [0, 0.5, 1, 1.5, 2],
    });
  }

  init() {
    const editor = this.editor;
    const t = editor.t;
    const schema = editor.model.schema;

    // Filter out unsupported options.
    const enabledOptions = editor.config
      .get("lineHeight.options")
      .map((option) => String(option))
      .filter(isSupported);

    // Allow alignment attribute on all blocks.
    schema.extend("$block", { allowAttributes: "lineHeight" });
    editor.model.schema.setAttributeProperties("lineHeight", {
      isFormatting: true,
    });

    const definition = buildDefinition(
      enabledOptions /* .filter( option => !isDefault( option ) ) */
    );

    editor.conversion.attributeToAttribute(definition);

    editor.commands.add("lineHeight", new LineHeightCommand(editor));

    const options = this._getLocalizedOptions();

    const command = editor.commands.get("lineHeight");

    editor.ui.componentFactory.add("lineHeight", (locale) => {
      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, _prepareListOptions(options, command));

      // Create dropdown model.
      dropdownView.buttonView.set({
        label: "Line Height",
        icon:
          editor.config.get("lineHeight.icon") ||
          '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"  width="24" height="24" viewBox="0 0 24 24"><path fill="#000000" d="M10,13H22V11H10M10,19H22V17H10M10,7H22V5H10M6,7H8.5L5,3.5L1.5,7H4V17H1.5L5,20.5L8.5,17H6V7Z" /></svg>',
        tooltip: true,
      });

      dropdownView.extendTemplate({
        attributes: {
          class: ["p0thi-ckeditor5-lineHeight-dropdown"],
        },
      });

      dropdownView.bind("isEnabled").to(command);

      // Execute command when an item from the dropdown is selected.
      this.listenTo(dropdownView, "execute", (evt) => {
        editor.execute(evt.source.commandName, {
          value: evt.source.commandParam,
        });
        editor.editing.view.focus();
      });

      return dropdownView;
    });
  }

  _getLocalizedOptions() {
    const editor = this.editor;
    const t = editor.t;

    const localizedTitles = {
      // Default: 'Standard'
      Default: t("Default"),
    };

    const options = normalizeOptions(
      editor.config
        .get("lineHeight.options")
        .filter((option) => isSupported(option))
    );

    return options.map((option) => {
      const title = localizedTitles[option.title];

      if (title && title !== option.title) {
        // Clone the option to avoid altering the original `namedPresets` from `./utils.js`.
        option = Object.assign({}, option, { title });
      }

      return option;
    });
  }
}

export default LineHeightPlugin;

function _prepareListOptions(options, command) {
  const itemDefinitions = new Collection();

  for (const option of options) {
    const def = {
      type: "button",
      model: new Model({
        commandName: "lineHeight",
        commandParam: option.model,
        label: option.title,
        class: "p0thi-ckeditor5-lineHeight-dropdown",
        withText: true,
      }),
    };

    if (option.view && option.view.classes) {
      def.model.set("class", `${def.model.class} ${option.view.classes}`);
    }

    def.model.bind("isOn").to(command, "value", (value) => {
      const newValue = value ? parseFloat(value) : value;
      return newValue === option.model;
    });

    // Add the option to the collection.
    itemDefinitions.add(def);
  }

  return itemDefinitions;
}

function optionDefinition(option) {
  if (typeof option === "object") {
    return option;
  }

  if (option === "default") {
    return {
      model: undefined,
      title: "Default",
    };
  }

  const sizePreset = parseFloat(option);

  if (isNaN(sizePreset)) {
    return;
  }

  return generatePixelPreset(sizePreset);
}

function generatePixelPreset(size) {
  const sizeName = String(size);

  return {
    title: sizeName,
    model: size,
    view: {
      name: "span",
      styles: {
        "line-height": sizeName,
      },
      priority: 5,
    },
  };
}

const LINE_HEIGHT = "lineHeight";
