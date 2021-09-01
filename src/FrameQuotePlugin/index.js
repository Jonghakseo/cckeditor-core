import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import first from "@ckeditor/ckeditor5-utils/src/first";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import {
  addListToDropdown,
  createDropdown,
} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import { ButtonView } from "ckeditor5/src/ui";

import Model from "@ckeditor/ckeditor5-ui/src/model";
import Command from "@ckeditor/ckeditor5-core/src/command";
import { SplitButtonView, View, ViewCollection } from "@ckeditor/ckeditor5-ui";

import "./theme.css";

const FRAME_QUOTE = "frameQuote";

export function buildDefinition(options) {
  const definition = {
    model: {
      key: FRAME_QUOTE,
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

// 커멘트가 실행됐을 때 뭘하면 되는지 여기서 정의하면 됨
// 아이콘?을 눌렀을 때 실행되는 액션을 여기서 정의해주면 됨
class FrameQuoteCommand extends Command {
  // 여기는 임의로 우선 라이언이 넘긴것, 바꿀 수 있음

  refresh() {
    this.value = this._getValue();
    this.isEnabled = this._checkEnabled();
  }

  execute(options = {}) {
    console.log("execute");
    const model = this.editor.model;
    const schema = model.schema;
    const selection = model.document.selection;

    const blocks = Array.from(selection.getSelectedBlocks());

    const value =
      options.forceValue === undefined ? !this.value : options.forceValue;
    console.log({ value });

    model.change((writer) => {
      if (!value) {
        this._removeQuote(writer, blocks.filter(findQuote));

        // ? quoute 추가
      } else {
        const blocksToQuote = blocks.filter((block) => {
          console.log({ block });
          // Already quoted blocks needs to be considered while quoting too
          // in order to reuse their <bQ> elements.
          return findQuote(block) || checkCanBeQuoted(schema, block);
        });

        this._applyQuote(writer, blocksToQuote);
      }
    });
  }

  _getValue() {
    const selection = this.editor.model.document.selection;

    const firstBlock = first(selection.getSelectedBlocks());

    // In the current implementation, the block quote must be an immediate parent of a block element.
    return !!(firstBlock && findQuote(firstBlock));
  }

  _checkEnabled() {
    if (this.value) {
      return true;
    }

    const selection = this.editor.model.document.selection;
    const schema = this.editor.model.schema;

    const firstBlock = first(selection.getSelectedBlocks());

    if (!firstBlock) {
      return false;
    }

    return checkCanBeQuoted(schema, firstBlock);
  }

  _removeQuote(writer, blocks) {
    // Unquote all groups of block. Iterate in the reverse order to not break following ranges.
    getRangesOfBlockGroups(writer, blocks)
      .reverse()
      .forEach((groupRange) => {
        if (groupRange.start.isAtStart && groupRange.end.isAtEnd) {
          writer.unwrap(groupRange.start.parent);

          return;
        }

        // The group of blocks are at the beginning of an <bQ> so let's move them left (out of the <bQ>).
        if (groupRange.start.isAtStart) {
          const positionBefore = writer.createPositionBefore(
            groupRange.start.parent
          );

          writer.move(groupRange, positionBefore);

          return;
        }

        // The blocks are in the middle of an <bQ> so we need to split the <bQ> after the last block
        // so we move the items there.
        if (!groupRange.end.isAtEnd) {
          writer.split(groupRange.end);
        }

        // Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.

        const positionAfter = writer.createPositionAfter(groupRange.end.parent);

        writer.move(groupRange, positionAfter);
      });
  }

  _applyQuote(writer, blocks) {
    console.log("applyQuote");
    console.log({ writer });
    console.log({ blocks });

    const quotesToMerge = [];

    // Quote all groups of block. Iterate in the reverse order to not break following ranges.
    getRangesOfBlockGroups(writer, blocks)
      .reverse()
      .forEach((groupRange) => {
        let quote = findQuote(groupRange.start);
        console.log({ quote });

        if (!quote) {
          console.log("quote 없음");
          quote = writer.createElement("frameQuote");
          // quote = "❝";

          writer.wrap(groupRange, quote);
        }

        quotesToMerge.push(quote);
      });

    console.log({ quotesToMerge });

    //TODO: quote의 처음과 끝에 ❝ ❞ 표시만 붙여주면 됨

    // Merge subsequent <bQ> elements. Reverse the order again because this time we want to go through
    // the <bQ> elements in the source order (due to how merge works – it moves the right element's content
    // to the first element and removes the right one. Since we may need to merge a couple of subsequent `<bQ>` elements
    // we want to keep the reference to the first (furthest left) one.
    quotesToMerge.reverse().reduce((currentQuote, nextQuote) => {
      if (currentQuote.nextSibling == nextQuote) {
        writer.merge(writer.createPositionAfter(currentQuote));

        return currentQuote;
      }

      return nextQuote;
    });
  }
}

class FrameQuotePlugin extends Plugin {
  constructor(editor) {
    super(editor);
  }

  init() {
    console.log("hello");
    const editor = this.editor;
    const t = editor.t;
    const schema = editor.model.schema;

    editor.ui.componentFactory.add("frameQuote", (locale) => {
      const command = editor.commands.get("frameQuote");
      const buttonView = new ButtonView(locale);

      buttonView.set({
        label: t("Frame quote"),
        icon:
          editor.config.get("musicSelect.icon") ||
          '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><title>checkbox-unchecked</title><path d="M28 0h-24c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4v-24c0-2.2-1.8-4-4-4zM28 28h-24v-24h24v24z"></path></svg>',
        tooltip: true,
        isToggleable: true,
      });

      // Bind button model to command.
      buttonView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      // Execute command.
      this.listenTo(buttonView, "execute", () => {
        console.log("Button");
        editor.execute("frameQuote");
        editor.editing.view.focus();
      });

      return buttonView;
    });

    // 커멘트 추가할 수 있음, 커멘드는 이벤트 리스너와 같음
    editor.commands.add(FRAME_QUOTE, new FrameQuoteCommand(editor));

    schema.register("frameQuote", {
      allowWhere: "$block",
      allowContentOf: "$root",
    });

    editor.conversion.elementToElement({
      model: "frameQuote",
      view: "frameQuote",
    });

    // Postfixer which cleans incorrect model states connected with block quotes.
    editor.model.document.registerPostFixer((writer) => {
      const changes = editor.model.document.differ.getChanges();

      for (const entry of changes) {
        if (entry.type == "insert") {
          const element = entry.position.nodeAfter;

          if (!element) {
            // We are inside a text node.
            continue;
          }

          if (element.is("element", "frameQuote") && element.isEmpty) {
            // Added an empty frameQuote - remove it.
            writer.remove(element);

            return true;
          } else if (
            element.is("element", "frameQuote") &&
            !schema.checkChild(entry.position, element)
          ) {
            // Added a frameQuote in incorrect place. Unwrap it so the content inside is not lost.
            writer.unwrap(element);

            return true;
          } else if (element.is("element")) {
            // Just added an element. Check that all children meet the scheme rules.
            const range = writer.createRangeIn(element);

            for (const child of range.getItems()) {
              if (
                child.is("element", "frameQuote") &&
                !schema.checkChild(writer.createPositionBefore(child), child)
              ) {
                writer.unwrap(child);

                return true;
              }
            }
          }
        } else if (entry.type == "remove") {
          const parent = entry.position.parent;

          if (parent.is("element", "frameQuote") && parent.isEmpty) {
            // Something got removed and now frameQuote is empty. Remove the frameQuote as well.
            writer.remove(parent);

            return true;
          }
        }
      }

      return false;
    });

    const viewDocument = this.editor.editing.view.document;
    const selection = editor.model.document.selection;
    const frameQuoteCommand = editor.commands.get("frameQuote");

    // Overwrite default Enter key behavior.
    // If Enter key is pressed with selection collapsed in empty block inside a quote, break the quote.
    this.listenTo(
      viewDocument,
      "enter",
      (evt, data) => {
        console.log("here: ", evt);
        if (!selection.isCollapsed || !frameQuoteCommand.value) {
          return;
        }

        const positionParent = selection.getLastPosition().parent;

        if (positionParent.isEmpty) {
          editor.execute("frameQuote");
          editor.editing.view.scrollToTheSelection();

          data.preventDefault();
          evt.stop();
        }
      },
      { context: "frameQuote" }
    );

    // Overwrite default Backspace key behavior.
    // If Backspace key is pressed with selection collapsed in first empty block inside a quote, break the quote.
    this.listenTo(
      viewDocument,
      "delete",
      (evt, data) => {
        if (
          data.direction != "backward" ||
          !selection.isCollapsed ||
          !frameQuoteCommand.value
        ) {
          return;
        }

        const positionParent = selection.getLastPosition().parent;

        if (positionParent.isEmpty && !positionParent.previousSibling) {
          editor.execute("frameQuote");
          editor.editing.view.scrollToTheSelection();

          data.preventDefault();
          evt.stop();
        }
      },
      { context: "frameQuote" }
    );
  }
}

function findQuote(elementOrPosition) {
  return elementOrPosition.parent.name == "frameQuote"
    ? elementOrPosition.parent
    : null;
}

function getRangesOfBlockGroups(writer, blocks) {
  let startPosition;
  let i = 0;
  const ranges = [];

  while (i < blocks.length) {
    const block = blocks[i];
    const nextBlock = blocks[i + 1];

    if (!startPosition) {
      startPosition = writer.createPositionBefore(block);
    }

    if (!nextBlock || block.nextSibling != nextBlock) {
      ranges.push(
        writer.createRange(startPosition, writer.createPositionAfter(block))
      );
      startPosition = null;
    }

    i++;
  }

  return ranges;
}

// Checks whether <bQ> can wrap the block.
function checkCanBeQuoted(schema, block) {
  // TMP will be replaced with schema.checkWrap().
  const isBQAllowed = schema.checkChild(block.parent, "frameQuote");
  const isBlockAllowedInBQ = schema.checkChild(["$root", "frameQuote"], block);

  return isBQAllowed && isBlockAllowedInBQ;
}

export default FrameQuotePlugin;
