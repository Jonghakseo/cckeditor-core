/**
 * @license Copyright (c) 2014-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor.js";
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment.js";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat.js";
import AutoImage from "@ckeditor/ckeditor5-image/src/autoimage.js";
import AutoLink from "@ckeditor/ckeditor5-link/src/autolink.js";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote.js";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold.js";
import CKFinderUploadAdapter from "@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials.js";
import FontBackgroundColor from "@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js";
import FontColor from "@ckeditor/ckeditor5-font/src/fontcolor.js";
import FontFamily from "@ckeditor/ckeditor5-font/src/fontfamily.js";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize.js";
import Heading from "@ckeditor/ckeditor5-heading/src/heading.js";
import Highlight from "@ckeditor/ckeditor5-highlight/src/highlight.js";
import HorizontalLine from "@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js";
import HtmlEmbed from "@ckeditor/ckeditor5-html-embed/src/htmlembed.js";
import Image from "@ckeditor/ckeditor5-image/src/image.js";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption.js";
import ImageInsert from "@ckeditor/ckeditor5-image/src/imageinsert.js";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize.js";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle.js";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar.js";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload.js";
import Indent from "@ckeditor/ckeditor5-indent/src/indent.js";
import IndentBlock from "@ckeditor/ckeditor5-indent/src/indentblock.js";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic.js";
import Link from "@ckeditor/ckeditor5-link/src/link.js";
import LinkImage from "@ckeditor/ckeditor5-link/src/linkimage.js";
import List from "@ckeditor/ckeditor5-list/src/list.js";
import ListStyle from "@ckeditor/ckeditor5-list/src/liststyle.js";
import Markdown from "@ckeditor/ckeditor5-markdown-gfm/src/markdown.js";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed.js";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph.js";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js";
import Table from "@ckeditor/ckeditor5-table/src/table.js";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar.js";
import TextTransformation from "@ckeditor/ckeditor5-typing/src/texttransformation.js";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import LineHeightPlugin from "./LineHeightPlugin/index.js";
// import DoubleQoutePlugin from "./DobuleQoutePlugin/index";
import MusicSelectPlugin from "./MusicSelectPlugin/index.js";
import Video from "@visao/ckeditor5-video/src/video.js";
import VideoUpload from "@visao/ckeditor5-video/src/videoupload.js";
import VideoToolbar from "@visao/ckeditor5-video/src/videotoolbar.js";
import VideoResize from "@visao/ckeditor5-video/src/videoresize.js";
import VideoInsert from "@visao/ckeditor5-video/src/videoinsert.js";
import VideoStyle from "@visao/ckeditor5-video/src/videostyle.js";
import AddLocationPlugin from "./AddLocationPlugin/index.js";

class Editor extends ClassicEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
  Alignment,
  AddLocationPlugin,
  Autoformat,
  AutoImage,
  AutoLink,
  BlockQuote,
  Bold,
  LineHeightPlugin,
  // DoubleQoutePlugin,
  MusicSelectPlugin,
  CKFinderUploadAdapter,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListStyle,
  // Markdown,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  Underline,
  Strikethrough,
  Table,
  TableToolbar,
  TextTransformation,
  Video,
  VideoUpload,
  VideoInsert,
  VideoStyle,
  VideoToolbar,
  VideoResize,
];

Editor.defaultConfig = {
  alignment: {
    options: ["left", "center", "right"],
  },
  video: {},
  toolbar: {
    items: [
      "fontfamily",
      "fontsize",
      "|",
      "bold",
      "underline",
      "italic",
      "strikethrough",
      "|",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "alignment",
      //TODO divider
      "numberedList",
      "lineHeight",
      //TODO lineHeight
      "|",
      "blockQuote",
      "insertTable",
      "link",
      "uploadImage",
      //TODO video
      // "doubleQoute",
    ],
  },
  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: "en",
};

export default Editor;
